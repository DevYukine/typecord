import { UserPayload } from './User';
import Collection from 'collection';
import Role from './Role';
import Client from '../Client/Client';
import Guild from './Guild';

export interface EmojiPayload {
	id: string;
	name: string;
	roles?: string[];
	user?: UserPayload;
	require_colons?: boolean;
	managed: boolean;
	animated: boolean;
}

export default class Emoji {
	public name: string;
	public requireColons?: boolean;
	public roles = new Collection<string, Role>();
	public readonly id: string;
	public readonly userID?: string;
	public readonly managed: boolean;
	public readonly animated: boolean;

	constructor(public client: Client, public guildID: string, data: EmojiPayload) {
		this.id = data.id;
		this.name = data.name;
		this.managed = data.managed;
		this.animated = data.animated;
		this.requireColons = data.require_colons;
		if (data.user) this.userID = data.user.id;
		if (data.roles) {
			for (const roleID of data.roles) {
				const role = this.guild && this.guild instanceof Guild ? this.guild.roles.get(roleID) : null;
				if (role) this.roles.set(role.id, role);
			}
		}
	}

	public get user() {
		return this.client.users.get(this.userID!);
	}

	public get guild() {
		return this.client.guilds.get(this.guildID);
	}
}
