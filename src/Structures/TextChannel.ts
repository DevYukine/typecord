import Channel, { ChannelPayload } from './Channel';
import Guild from './Guild';
import Client from '../Client/Client';

export default class TextChannel extends Channel {
	public name: string;
	public nsfw: boolean;
	public topic?: string;
	public position: number;
	public rateLimitPerUser: number;
	public readonly guildID: string;

	constructor(client: Client, data: ChannelPayload) {
		super(client, data);
		this.name = data.name!;
		this.nsfw = data.nsfw;
		this.topic = data.topic;
		this.guildID = data.guild_id!;
		this.position = data.position!;
		this.rateLimitPerUser = data.rate_limit_per_user!;
	}

	public get guild() {
		return this.client.guilds.get(this.guildID);
	}

	public send(content: string | string[]) {
		//
	}
}
