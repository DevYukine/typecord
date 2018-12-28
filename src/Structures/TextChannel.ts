import { URL } from 'url';
import Client from '../Client/Client';
import { DiscordAPIMethod } from '../Rest/RestRequest';
import { ENDPOINTS } from '../Util/Constants';
import { ChannelPayload } from './Channel';
import DataStore from './DataStore';
import GuildChannel from './GuildChannel';
import TextBasedChannel from './Interfaces/TextBasedChannel';
import Message, { MessagePayload } from './Message';
import MessageEmbed from './MessageEmbed';

export type BufferResolvable = Buffer | URL;

export default interface MessageOptions {
	tts: boolean;
	embed: MessageEmbed;
	files: BufferResolvable[];
}

export default class TextChannel extends GuildChannel implements TextBasedChannel {
	public nsfw: boolean;
	public topic?: string;
	public messages = new DataStore<Message, MessagePayload>(this.client, Message);
	public lastMessageID?: string | null;
	public rateLimitPerUser: number;
	public lastPinTimestamp?: number;

	constructor(client: Client, data: ChannelPayload) {
		super(client, data);
		this.nsfw = data.nsfw;
		this.topic = data.topic;
		this.lastMessageID = data.last_message_id;
		this.rateLimitPerUser = data.rate_limit_per_user!;
	}

	public get lastMessage() {
		return this.messages.get(this.lastMessageID);
	}

	public get lastPinAt() {
		return this.lastPinTimestamp ? new Date(this.lastPinTimestamp) : undefined;
	}

	public send(content: string | string[] | MessageEmbed, options?: MessageOptions): Promise<Message> {
		const contentString = Array.isArray(content) ? content.join('\n') : content;
		return this.client.rest.enqueue(DiscordAPIMethod.POST, ENDPOINTS.CHANNEL_MESSAGES(this.id) , { data: { content: contentString } });
	}
}
