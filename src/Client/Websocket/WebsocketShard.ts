import { Inflate } from 'pako';
import { stringify } from 'querystring';
import Websocket from 'ws';
import * as Util from '../../Util/Util';
import { ClientEvent } from '../Client';
import handle from './WebsocketHandler';
import WebSocketManager from './WebsocketManager';
import { EventEmitter } from 'events';

export enum GatewayCloseCode {
	UNKNOWN_ERROR = 4000,
	UNKNOWN_OPCODE = 4001,
	DECODE_ERROR = 4002,
	NOT_AUTHENTICATED = 4003,
	AUTHENTICATED_FAILED = 4004,
	ALREADY_AUTHENTICATED = 4005,
	INVALID_SEQUENCE = 4007,
	RATE_LIMITED = 4008,
	SESSION_TIMEOUT = 4009,
	INVALID_SHARD = 4010,
	SHARDING_REQUIRED = 4011
}

export enum GatewayEvent {
	CHANNEL_CREATE = 'CHANNEL_CREATE',
	CHANNEL_DELETE = 'CHANNEL_DELETE',
	CHANNEL_PINS_UPDATE = 'CHANNEL_PINS_UPDATE',
	CHANNEL_UPDATE = 'CHANNEL_UPDATE',
	GUILD_BAN_ADD = 'GUILD_BAN_ADD',
	GUILD_BAN_REMOVE = 'GUILD_BAN_REMOVE',
	GUILD_CREATE = 'GUILD_CREATE',
	GUILD_DELETE = 'GUILD_DELETE',
	GUILD_EMOJIS_UPDATE = 'GUILD_EMOJIS_UPDATE',
	GUILD_INTEGRATIONS_UPDATE = 'GUILD_INTEGRATIONS_UPDATE',
	GUILD_MEMBERS_CHUNK = 'GUILD_MEMBERS_CHUNK',
	GUILD_MEMBER_ADD = 'GUILD_MEMBER_ADD',
	GUILD_MEMBER_REMOVE = 'GUILD_MEMBER_REMOVE',
	GUILD_MEMBER_UPDATE = 'GUILD_MEMBER_UPDATE',
	GUILD_ROLE_CREATE = 'GUILD_ROLE_CREATE',
	GUILD_ROLE_DELETE = 'GUILD_ROLE_DELETE',
	GUILD_ROLE_UPDATE = 'GUILD_ROLE_UPDATE',
	GUILD_SYNC = 'GUILD_SYNC',
	GUILD_UPDATE = 'GUILD_UPDATE',
	MESSAGE_CREATE = 'MESSAGE_CREATE',
	MESSAGE_DELETE = 'MESSAGE_DELETE',
	MESSAGE_DELETE_BULK = 'MESSAGE_DELETE_BULK',
	MESSAGE_REACTION_ADD = 'MESSAGE_REACTION_ADD',
	MESSAGE_REACTION_REMOVE = 'MESSAGE_REACTION_REMOVE',
	MESSAGE_REACTION_REMOVE_ALL = 'MESSAGE_REACTION_REMOVE_ALL',
	MESSAGE_UPDATE = 'MESSAGE_UPDATE',
	PRESENCE_UPDATE = 'PRESENCE_UPDATE',
	READY = 'READY',
	RESUMED = 'RESUMED',
	TYPING_START = 'TYPING_START',
	USER_UPDATE = 'USER_UPDATE',
	VOICE_SERVER_UPDATE = 'VOICE_SERVER_UPDATE',
	VOICE_STATE_UPDATE = 'VOICE_STATE_UPDATE',
	WEBHOOKS_UPDATE = 'WEBHOOKS_UPDATE'
}

export enum WebSocketStatus {
	INITIALIZED,
	CONNECTING,
	CONNECTED,
	IDENTIFYING_SESSION,
	AWAITING_LOGIN_CONFIRMATION,
	READY,
	DISCONNECTED,
	RECONNECTING,
	FAILED_TO_LOGIN
}

export enum GatewayOPCodes {
	DISPATCH = 0,
	HEARTBEAT = 1,
	IDENTIFY = 2,
	STATUS_UPDATE = 3,
	VOICE_STATE_UPDATE = 4,
	VOICE_GUILD_PING = 5,
	RESUME = 6,
	RECONNECT = 7,
	REQUEST_GUILD_MEMBERS = 8,
	INVALID_SESSION = 9,
	HELLO = 10,
	HEARTBEAT_ACK = 11
}

export interface Payload {
	op: number;
	d: any;
}

export interface Dispatch extends Payload {
	s: number;
	t: GatewayEvent;
}

export interface RatelimitObject {
	queue: object[];
	total: number;
	remaining: number;
	time: number;
	timer: NodeJS.Timer | null;
}

export default class WebSocketShard extends EventEmitter {
	public status = WebSocketStatus.INITIALIZED;

	private _heartbeatInterval: NodeJS.Timer | null = null;
	private _zlib = new Inflate({ to: 'string' });
	private _sessionID: string | null = null;
	private _ratelimit: RatelimitObject = {
		queue: [],
		total: 120,
		remaining: 120,
		time: 6e4,
		timer: null
	};
	private _timeout: number | null = null;
	private _ws: Websocket | null = null;
	private _lastHeartbeatAck = true;
	private _pings: number[] = [];
	private _trace: string[] = [];
	private _sequence = -1;
	private _lastPing = -1;

	constructor(public manager: WebSocketManager, public id: number) {
		super();
	}

	public get client() {
		return this.manager.client;
	}

	public get ping() {
		const sum = this._pings.reduce((a, b) => a + b, 0);
		return sum / this._pings.length;
	}

	public async initialize() {
		this._debug('Initializing...');
		await this.connect();
		return new Promise(resolve => this.once('ready', resolve));
	}

	public async connect() {
		if (this._timeout) {
			this._debug(`Waiting ${this._timeout / 1000} seconds before retrying to connect...`);
			await Util.wait(this._timeout);
		}
		this._debug('Connecting to Websocket...');
		this.status = WebSocketStatus.CONNECTING;
		const obj = { v: this.manager.client.options.ws.version };
		this._ws = new Websocket(`${this.manager.gateway!.url}?${stringify(obj)}`);
		this._registerListener();
	}

	public async disconnect(code?: number, reason?: string) {
		this._debug(`Disconnecting from Websocket with ${code}: ${reason ? reason : 'no reason'}`);
		this._reset();
		await this._close(code, reason);
		this._ws = null;
	}

	public async destroy() {
		this._debug('Destroying requested');
		await this.disconnect(1000);
		this._sessionID = null;
		this._timeout = null;
		this._pings.length = 0;
		this._trace.length = 0;
		this._sequence = 0;
		this._lastPing = 0;
	}

	public enqueueRequest(data: object) {
		this._ratelimit.queue.push(data);
		this._processQueue();
	}

	private _onOpen() {
		this._debug('Connected to WebSocket');
		this.status = WebSocketStatus.CONNECTED;
		if (this._timeout) this._timeout = null;
	}

	private _onMessage(data: string) {
		let packet: Payload;
		try {
			packet = JSON.parse(data);
		} catch (error) {
			this.manager.client.emit('error', error);
			return;
		}
		if (!packet) {
			this._debug('Received null or broken packet');
			return;
		}
		const { op, d } = packet;
		switch(op) {
			case GatewayOPCodes.DISPATCH:
				return this._onDispatch(packet as Dispatch);
			case GatewayOPCodes.HEARTBEAT:
				this._debug(`Received Keep-Alive request  (OP ${GatewayOPCodes.HEARTBEAT}). Sending response...`);
				return this._heartbeat();
			case GatewayOPCodes.RECONNECT:
				this._debug(`Received Reconnect request (OP ${GatewayOPCodes.RECONNECT}). Closing connection now...`);
				return this._reconnect(4000, 'OP 7: RECONNECT');
			case GatewayOPCodes.INVALID_SESSION:
				this._debug(`Received Invalidate request (OP ${GatewayOPCodes.INVALID_SESSION}). Invalidating....`);
				return this._invalidated(d);
			case GatewayOPCodes.HELLO:
				this._debug(`Received HELLO packet (OP ${GatewayOPCodes.HELLO}). Initializing keep-alive...`);
				this._configureHeartbeat(d.heartbeat_interval);
				this._trace = d._trace;
				return this._connect();
			case GatewayOPCodes.HEARTBEAT_ACK:
				this._debug(`Received Heartbeat Ack (OP ${GatewayOPCodes.HEARTBEAT_ACK})`);
				return this._ackHeartbeat();
			default:
				return this._debug(`Received unknown op-code: ${op} with content: ${d}`);
		}
	}

	private _onDispatch(dispatch: Dispatch) {
		this.client.emit(ClientEvent.DISPATCH, dispatch);
		const { s } = dispatch;
		switch (dispatch.t) {
			case GatewayEvent.READY:
				this._sessionID = dispatch.d.session_id;
				this._trace = dispatch.d._trace;
				this.status = WebSocketStatus.READY;
				this.emit('ready');
				this._debug(`READY ${this._trace.join(' -> ')} ${this._sessionID}`);
				break;
			case GatewayEvent.RESUMED:
				this._trace = dispatch.d._trace;
				this.status = WebSocketStatus.READY;
				const replayed = s - this._sequence;
				this._debug(`RESUMED ${this._trace.join(' -> ')} | replayed ${replayed} events.`);
				break;
			default:
				break;
		}
		if (s > this._sequence) this._sequence = s;
		return handle(this, dispatch);
	}

	private _onError(error: Error) {
		this._debug('Websocket Connection received Error. Handle timeout and emitting on client...');
		if (this._timeout) this._timeout *= 2;
		else this._timeout = 1000;
		return this.client.emit(ClientEvent.ERROR, error);
	}

	private _onClose(code?: GatewayCloseCode) {
		this.status = WebSocketStatus.DISCONNECTED;
		this._reset();

		switch(code) {
			case GatewayCloseCode.AUTHENTICATED_FAILED:
			case GatewayCloseCode.INVALID_SHARD:
			case GatewayCloseCode.SHARDING_REQUIRED:
				return this._debug(`Websocket disconnected with ${code}: ${GatewayCloseCode[code]}, disconnecting...`);
			default:
				this._debug(`Websocket disconnected with ${code === 1006 ? `${code}: ${GatewayCloseCode[code]}` : 'No Close Code'}, attempting to reconnect and resume...`);
				break;
		}

		return this.connect();
	}

	private _send(data: object) {
		this._ws!.send(JSON.stringify(data), err => { if (err) this.manager.client.emit(ClientEvent.ERROR, err); });
	}

	private _processQueue() {
		if (this._ratelimit.remaining === 0) return;
		if (this._ratelimit.queue.length === 0) return;
		if (this._ratelimit.remaining === this._ratelimit.total) {
			this._ratelimit.timer = setTimeout(() => {
				this._ratelimit.remaining = this._ratelimit.total;
				this._processQueue();
			}, this._ratelimit.time);
		}
		while (this._ratelimit.remaining > 0 && this._ws!.readyState === Websocket.OPEN) {
			const item = this._ratelimit.queue.shift();
			if (!item) return;
			this._send(item);
			this._ratelimit.remaining--;
		}
	}

	private _connect() {
		this.status = WebSocketStatus.IDENTIFYING_SESSION;
		this._sessionID ? this._resume() : this._identify();
		this.status = WebSocketStatus.AWAITING_LOGIN_CONFIRMATION;
	}

	private _identify() {
		const d = { token: this.manager.client.token, shard: [this.id, this.client.options.totalShardCount], ...this.manager.client.options.ws };

		this._debug('Identifying as a new session');
		this.enqueueRequest({ op: GatewayOPCodes.IDENTIFY, d });
	}

	private _resume() {
		const d = { token: this.manager.client.token, session_id: this._sessionID, seq: this._sequence };

		this._debug(`Attempting to resume session ${this._sessionID}`);
		this.enqueueRequest({ op: GatewayOPCodes.RESUME, d });
	}

	private _invalidated(resumable: boolean) {
		if (!resumable) {
			const timeout = Math.round(Math.random() * 5e3);
			if (this._sessionID) this._sessionID = null;
			return this._reconnect(1000, 'Session Invalidated', timeout);
		}
		return this._reconnect(4000, 'Session Invalidated');
	}

	private _configureHeartbeat(time: number) {
		if (time === -1) {
			this._debug('Clearing heartbeat interval');
			clearInterval(this._heartbeatInterval!);
			this._heartbeatInterval = null;
		} else {
			this._debug(`Setting a heartbeat interval for ${time}ms`);
			this._heartbeatInterval = setInterval(this._heartbeat.bind(this), time) as NodeJS.Timer;
			this._heartbeat();
		}
	}

	private _heartbeat() {
		this._debug('Sending a heartbeat');
		if (!this._lastHeartbeatAck) return this._zombie();
		this._lastHeartbeatAck = false;
		this._lastPing = Date.now();
		this.enqueueRequest({
			op: GatewayOPCodes.HEARTBEAT,
			d: this._sequence,
		});
	}

	private _ackHeartbeat() {
		const latency = Date.now() - this._lastPing;
		this._debug(`Heartbeat acknowledged, latency of ${latency}ms`);
		this._lastHeartbeatAck = true;
		this._pings.unshift(latency);
		if (this._pings.length > 5) this._pings.length = 5;
	}

	private async _reconnect(code?: number, reason?: string, timeout?: number) {
		this._debug('Disconnect Websocket connection and then connect again');
		this.status = WebSocketStatus.RECONNECTING;
		await this.disconnect(code, reason);
		if (timeout) await Util.wait(timeout);
		await this.connect();
	}

	private _close(code?: number, reason?: string) {
		return new Promise((resolve) => {
			if ([Websocket.CLOSED, Websocket.CLOSING].includes(this._ws!.readyState)) return resolve();
			this._debug(`Closing Websocket Connection with ${code}: ${reason ? reason : 'no reason'}`);
			this._ws!.close(code, reason);
			this._ws!.once('close', resolve);
		});
	}

	private _zombie() {
		this._debug('Received no heartbeat acknowledged in time, assuming zombie connection.');
		return this._reconnect(4000, 'No heartbeat acknowledged');
	}

	private _reset() {
		this._ws!.removeAllListeners();
		if (this._heartbeatInterval) this._configureHeartbeat(-1);
		if (this._ratelimit.timer) {
			clearTimeout(this._ratelimit.timer);
			this._ratelimit.timer = null;
		}
	}

	private _registerListener() {
		this._ws!.on('open', this._onOpen.bind(this));
		this._ws!.on('message', this._onMessage.bind(this));
		this._ws!.on('error', this._onError.bind(this));
		this._ws!.on('close', this._onClose.bind(this));
	}

	private _debug(message: string) {
		return this.manager.client.emit(ClientEvent.DEBUG, `[Shard ${this.id}] ${message}`);
	}
}
