import Websocket from 'ws';
import WebSocketManager from './WebsocketManager';
import { Inflate } from 'pako';
import { stringify } from 'querystring';
import { inspect } from 'util';
import handle from './WebsocketHandler';

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
	READY,
	CONNECTING,
	RECONNECTING,
	IDLE,
	DISCONNECTED
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

export default class WebSocketShard {
	public status = WebSocketStatus.IDLE;

	private _ws: Websocket | null = null;
	private _heartbeatInterval: NodeJS.Timer | null = null;
	private _pings: number[] = [];
	private _traces: string[] = [];
	private _zlib = new Inflate({ to: 'string' });
	private _sequence = -1;
	private _lastPing = -1;

	constructor(public manager: WebSocketManager, public id: number, oldSequence?: number) {
		if (oldSequence) this._sequence = oldSequence;
	}

	public connect() {
		this._debug(`Connecting to ${this.manager.gateway}`);
		this.status = WebSocketStatus.CONNECTING;
		const obj = { v: this.manager.client.options.ws.version };
		this._ws = new Websocket(`${this.manager.gateway}?${stringify(obj)}`);
		this._ws.on('open', this._open.bind(this));
		this._ws.on('message', this._message.bind(this));
		this._ws.on('error', this._error.bind(this));
		this._ws.on('close', this._close.bind(this));
	}

	public get ping() {
		const sum = this._pings.reduce((a, b) => a + b, 0);
		return sum / this._pings.length;
	}

	private _open() {
		this._debug('Connection Open');
	}

	private _message(data: string) {
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
				return this._packet(packet as Dispatch);
			case GatewayOPCodes.HELLO:
				this._identify();
				return this._heartbeat(d.heartbeat_interval);
			case GatewayOPCodes.HEARTBEAT_ACK:
				return this._ackHeartbeat();
			case GatewayOPCodes.HEARTBEAT:
				return this._heartbeat();
			default:
				break;
		}
	}

	private _packet(data: Dispatch) {
		const { s } = data;
		if (s > this._sequence) this._sequence = s;
		return handle(this.manager.client, data);
	}

	private _error(error: Error) {
		this._debug(inspect(error));
	}

	private _close(event: CloseEvent) {
		this._debug(inspect(event));
	}

	private _send(data: object): Promise<void> {
		return new Promise((resolve, reject) => {
			this._ws!.send(JSON.stringify(data), err => {
				if (err) return reject(err);
				resolve();
			});
		});
	}

	private _ackHeartbeat() {
		const latency = Date.now() - this._lastPing;
		this._debug(`Heartbeat acknowledged, latency of ${latency}ms`);
		this._pings.unshift(latency);
		if (this._pings.length > 5) this._pings.length = 5;
	}

	private _heartbeat(time?: number) {
		if (time) {
			if (time === -1) {
				this._debug('Clearing heartbeat interval');
				clearInterval(this._heartbeatInterval!);
				this._heartbeatInterval = null;
			} else {
				this._debug(`Setting a heartbeat interval for ${time}ms`);
				this._heartbeatInterval = setInterval(this._heartbeat.bind(this), time) as any;
			}
		}

		this._debug('Sending a heartbeat');
		this._lastPing = Date.now();
		this._send({
			op: GatewayOPCodes.HEARTBEAT,
			d: this._sequence,
		});
	}

	private _identify() {
		const d = { token: this.manager.client.token, ...this.manager.client.options.ws };

		this._debug('Identifying as a new session');
		this._send({ op: GatewayOPCodes.IDENTIFY, d });
	}

	private _debug(message: string) {
		return console.log(`[Shard ${this.id}] ${message}`);
	}
}
