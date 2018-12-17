import { UserPayload } from './User';
import PermissionOverwrite, { PermissionOverwritePayload } from './PermissionOverwrite';
import Client from '../Client/Client';
import Collection from 'collection';

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
	permission_overwrites: PermissionOverwritePayload[];
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
	public permissionOverwrites = new Collection<string, PermissionOverwrite>();

	constructor(public client: Client, data: ChannelPayload) {
		this.id = data.id;
		this.type = data.type;
		for (const permissionOverwriteData of data.permission_overwrites) {
			const permissionOverwrite = new PermissionOverwrite(this.client, permissionOverwriteData);
			this.permissionOverwrites.set(permissionOverwrite.id, permissionOverwrite);
		}
	}
}
