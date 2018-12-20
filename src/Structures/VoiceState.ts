import { GuildMemberPayload } from './GuildMember';
import Guild from './Guild';
import Client from '../Client/Client';

export interface VoiceStatePayload {
	guild_id?: string;
	channel_id: string | null;
	user_id: string;
	member?: GuildMemberPayload;
	session_id: string;
	deaf: boolean;
	mute: boolean;
	self_deaf: boolean;
	self_mute: boolean;
	suppress: boolean;
}

export default class VoiceState {
	public selfDeaf?: boolean;
	public selfMute?: boolean;
	public channelID: string | null;
	public sessionID?: string;
	public serverDeaf?: boolean;
	public serverMute?: boolean;

	public readonly id: string;
	public readonly guild: Guild;

	constructor(public client: Client, data: VoiceStatePayload) {
		this.id = data.user_id;
		this.guild = client.guilds.get(data.guild_id)! as Guild;
		this.selfDeaf = data.self_deaf;
		this.selfMute = data.self_mute;
		this.sessionID = data.session_id;
		this.channelID = data.channel_id;
		this.serverMute = data.mute;
		this.serverDeaf = data.deaf;
	}

	get member() {
		return this.guild.members.get(this.id);
	}

	get channel() {
		return this.guild.channels.get(this.channelID);
	}

	get deaf() {
		return this.serverDeaf || this.selfDeaf;
	}

	get mute() {
		return this.serverMute || this.selfMute;
	}
}
