import * as Constants from '../Util/Constants';
import * as Util from '../Util/Util';
import request from 'superagent';
import WebSocketManager from './Websocket/WebsocketManager';
import { EventEmitter } from 'events';

export interface ClientOptions {
	ws: {
		large_threshold: number,
		compress: boolean,
		properties: {
			$os: NodeJS.Platform,
			$browser: string,
			$device: string,
		},
		version: number,
	};
	http: {
		version: number,
		api: string,
		cdn: string,
		invite: string,
	};
}

export interface SessionObject {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
	};
}

export default class Client extends EventEmitter {
	public ws: WebSocketManager = new WebSocketManager(this);
	public token: string | null = null;
	public options: ClientOptions;

	constructor(options = {}) {
		super();
		this.options = Util.mergeDefault<ClientOptions>(options, Constants.DEFAULT_CLIENT_OPTIONS);
	}

	public async login(token: string) {
		console.log(`Authenticating using token ${token}`);
		this.token = token.replace(/^(Bot|Bearer)\s*/i, '');
		const { url } = await this.fetchGateway();
		this.ws.gateway = url;
		return this.ws.init();
	}

	private async fetchGateway(): Promise<SessionObject> {
		const { body } = await request
			.get(`${this.options.http.api}/v${this.options.http.version}/gateway/bot`)
			.set({ Authorization: `Bot ${this.token}`});
		return body;
	}
}
