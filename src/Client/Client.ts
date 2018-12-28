import Collection from 'collection';
import { EventEmitter } from 'events';
import RestManager from '../Rest/RestManager';
import { DiscordAPIMethod } from '../Rest/RestRequest';
import ClientUser from '../Structures/ClientUser';
import DataStore from '../Structures/DataStore';
import Emoji from '../Structures/Emoji';
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
	shardCount: number | 'auto';
	shards: number[];
	totalShardCount: number;
}

export interface GatewayObject {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
	};
}

export enum ClientEvent {
	READY = 'ready',
	RESUMED = 'resumed',
	GUILD_CREATE = 'guildCreate',
	GUILD_DELETE = 'guildDelete',
	GUILD_UPDATE = 'guildUpdate',
	GUILD_UNAVAILABLE = 'guildUnavailable',
	GUILD_AVAILABLE = 'guildAvailable',
	GUILD_MEMBER_ADD = 'guildMemberAdd',
	GUILD_MEMBER_REMOVE = 'guildMemberRemove',
	GUILD_MEMBER_UPDATE = 'guildMemberUpdate',
	GUILD_MEMBER_AVAILABLE = 'guildMemberAvailable',
	GUILD_MEMBER_SPEAKING = 'guildMemberSpeaking',
	GUILD_MEMBERS_CHUNK = 'guildMembersChunk',
	GUILD_INTEGRATIONS_UPDATE = 'guildIntegrationsUpdate',
	GUILD_ROLE_CREATE = 'roleCreate',
	GUILD_ROLE_DELETE = 'roleDelete',
	GUILD_ROLE_UPDATE = 'roleUpdate',
	GUILD_EMOJI_CREATE = 'emojiCreate',
	GUILD_EMOJI_DELETE = 'emojiDelete',
	GUILD_EMOJI_UPDATE = 'emojiUpdate',
	GUILD_BAN_ADD = 'guildBanAdd',
	GUILD_BAN_REMOVE = 'guildBanRemove',
	CHANNEL_CREATE = 'channelCreate',
	CHANNEL_DELETE = 'channelDelete',
	CHANNEL_UPDATE = 'channelUpdate',
	CHANNEL_PINS_UPDATE = 'channelPinsUpdate',
	MESSAGE_CREATE = 'message',
	MESSAGE_DELETE = 'messageDelete',
	MESSAGE_UPDATE = 'messageUpdate',
	MESSAGE_BULK_DELETE = 'messageDeleteBulk',
	MESSAGE_REACTION_ADD = 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE = 'messageReactionRemove',
	MESSAGE_REACTION_REMOVE_ALL = 'messageReactionRemoveAll',
	USER_UPDATE = 'userUpdate',
	USER_NOTE_UPDATE = 'userNoteUpdate',
	USER_SETTINGS_UPDATE = 'clientUserSettingsUpdate',
	PRESENCE_UPDATE = 'presenceUpdate',
	VOICE_STATE_UPDATE = 'voiceStateUpdate',
	TYPING_START = 'typingStart',
	TYPING_STOP = 'typingStop',
	WEBHOOKS_UPDATE = 'webhookUpdate',
	DISCONNECT ='disconnect',
	RECONNECT = 'reconnect',
	ERROR = 'error',
	WARN = 'warn',
	DEBUG = 'debug',
	DISPATCH = 'dispatch',
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
		this.options = Util.mergeDefault<ClientOptions>(DEFAULT_CLIENT_OPTIONS, options);
	}

	public get channels() {
		const channels: [string, GuildChannel][] = [];
		for (const guild of this.guilds.values()) {
			if (guild instanceof Guild) channels.push(...guild.channels);
		}
		return new Collection<string, GuildChannel>(channels);
	}

	public get emojis() {
		const emojis: [string, Emoji][] = [];
		for (const guild of this.guilds.values()) {
			if (guild instanceof Guild) emojis.push(...guild.emojis);
		}
		return new Collection<string, Emoji>(emojis);
	}

	public async login(token: string) {
		this._debug(`Authenticating using token ${token}`);
		this.token = token.replace(/^(Bot|Bearer)\s*/i, '');
		this.ws.gateway = await this._fetchGateway();
		this._debug(`Using ${this.ws.gateway.url} as Websocket Gateway`);
		if (this.options.shardCount === 'auto') {
			this._debug(`Using recommend shard count: ${this.ws.gateway.shards}`);
			this.options.shardCount = this.ws.gateway.shards;
			this.options.totalShardCount = this.ws.gateway.shards;
			this.options.shards = [];
			for (let i = 0; i < this.options.shardCount; i++) this.options.shards.push(i);
		}
		return this.ws.initialize();
	}

	private _debug(message: string) {
		return this.emit(ClientEvent.DEBUG, `[Connection] ${message}`);
	}

	private async _fetchGateway(): Promise<GatewayObject> {
		return this.rest.enqueue(DiscordAPIMethod.GET, ENDPOINTS.GATEWAY_BOT);
	}
}
