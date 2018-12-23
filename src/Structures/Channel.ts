import Client from '../Client/Client';
import { PermissionOverwritePayload } from './PermissionOverwrite';
import { UserPayload } from './User';

export enum ChannelType {
	TEXT,
	DM,
	VOICE,
	GROUP_DM,
	CATEGORY
}

export interface ChannelPayload {
	id: string;
	type: ChannelType;
	guild_id?: string;
	position?: number;
	permission_overwrites?: PermissionOverwritePayload[];
	name?: string;
	topic?: string;
	nsfw: boolean;
	last_message_id?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: UserPayload[];
	icon?: string;
	owner_id?: string;
	application_id?: string;
	parent_id?: string;
	last_pin_timestamp?: Date;
}

export default class Channel {
	public readonly id: string;
	public readonly type: ChannelType;

	constructor(public client: Client, data: ChannelPayload) {
		this.id = data.id;
		this.type = data.type;
	}
}
