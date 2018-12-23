import Collection from 'collection';
import { EventEmitter } from 'events';
import RestManager from '../Rest/RestManager';
import { DiscordAPIMethod } from '../Rest/RestRequest';
import ClientUser from '../Structures/ClientUser';
import DataStore from '../Structures/DataStore';
import Guild from '../Structures/Guild';
import GuildChannel from '../Structures/GuildChannel';
import PartialGuild, { PartialGuildPayload } from '../Structures/PartialGuild';
import User, { UserPayload } from '../Structures/User';
import { DEFAULT_CLIENT_OPTIONS, ENDPOINTS } from '../Util/Constants';
import * as Util from '../Util/Util';
import { GuildCreatePayload } from './Websocket/handlers/GuildCreate';
import WebSocketManager from './Websocket/WebsocketManager';

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
		userAgent: string
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
	public token: string | null = null;
	public user: ClientUser | null = null;
	public readonly options: ClientOptions;
	public readonly ws = new WebSocketManager(this);
	public readonly rest = new RestManager(this);
	public readonly users = new DataStore<User, UserPayload>(this, User);
	public readonly guilds = new DataStore<Guild | PartialGuild, PartialGuildPayload | GuildCreatePayload>(this, Guild);

	constructor(options = {}) {
		super();
		this.options = Util.mergeDefault<ClientOptions>(options, DEFAULT_CLIENT_OPTIONS);
	}

	public get channels() {
		const channels: [string, GuildChannel][] = [];
		for (const guild of this.guilds.values()) {
			if (guild instanceof Guild) channels.push(...guild.channels);
		}
		return new Collection<string, GuildChannel>(channels);
	}

	public async login(token: string) {
		this.emit('debug', `Authenticating using token ${token}`);
		this.token = token.replace(/^(Bot|Bearer)\s*/i, '');
		const { url } = await this._fetchGateway();
		this.ws.gateway = url;
		return this.ws.init();
	}

	private async _fetchGateway(): Promise<SessionObject> {
		return this.rest.enqueue(DiscordAPIMethod.GET, ENDPOINTS.GATEWAY_BOT);
	}
}
