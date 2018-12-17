import Client from '../Client/Client';

export interface PermissionOverwritePayload {
	id: string;
	type: 'role' | 'member';
	allow: number;
	deny: number;
}

export default class PermissionOverwrite {
	public id: string;
	public type: 'role' | 'member';
	public allow: number;
	public deny: number;

	constructor(public client: Client, data: PermissionOverwritePayload) {
		this.id = data.id;
		this.type = data.type;
		this.allow = data.allow;
		this.deny = data.deny;
	}
}
