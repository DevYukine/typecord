import { ChannelPayload } from './Channel';
import Client from '../Client/Client';
import GuildChannel from './GuildChannel';

export default class TextChannel extends GuildChannel {
	public nsfw: boolean;
	public topic?: string;
	public rateLimitPerUser: number;

	constructor(client: Client, data: ChannelPayload) {
		super(client, data);
		this.nsfw = data.nsfw;
		this.topic = data.topic;
		this.rateLimitPerUser = data.rate_limit_per_user!;
	}

	public send(content: string | string[]) {
		//
	}
}
