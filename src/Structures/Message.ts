import { UserPayload } from './User';
import { GuildMemberPayload } from './GuildMember';
import { MessageEmbedPayload } from './MessageEmbed';
import { EmojiPayload } from './Emoji';

export enum MessageType {
	DEFAULT,
	RECIPIENT_ADD,
	RECIPIENT_REMOVE,
	CALL,
	CHANNEL_NAME_CHANGE,
	CHANNEL_ICON_CHANGE,
	CHANNEL_PINNED_MESSAGE,
	GUILD_MEMBER_JOIN
}

export enum MessageActivityType {
	JOIN = 1,
	SPECTATE = 2,
	LISTEN = 3,
	JOIN_REQUEST = 5
}

export interface MessageAttachmentPayload {
	id: string;
	filename: string;
	size: number;
	url: string;
	proxy_url: string;
	height: number | null;
	width: number | null;
}

export interface MessageReactionPayload {
	count: number;
	me: boolean;
	emoji: EmojiPayload;
}

export interface MessageActivity {
	type: MessageActivityType;
	party_id?: string;
}

export interface MessageApplication {
	id: string;
	cover_image: string;
	description: string;
	icon: string;
	name: string;
}

export interface MessagePayload {
	id: string;
	channel_id: string;
	guild_id?: string;
	author: UserPayload;
	member?: GuildMemberPayload;
	content: string;
	timestamp: Date;
	edited_timestamp: Date | null;
	tts: boolean;
	mention_everyone: boolean;
	mentions: UserPayload[];
	mention_roles: string[];
	attachments: MessageAttachmentPayload[];
	embeds: MessageEmbedPayload[];
	reactions?: MessageReactionPayload[];
	nonce?: string | null;
	pinned: boolean;
	webhook_id?: string;
	type: MessageType;
	activity?: MessageActivity;
	application?: MessageApplication;
}

export default class Message {

}
