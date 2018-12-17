import Client from '../Client/Client';

export interface RolePayload {
	id: string;
	name: string;
	color: number;
	hoist: boolean;
	position: number;
	permissions: number;
	managed: boolean;
	mentionable: boolean;
}

export default class Role {
	public name: string;
	public color: number;
	public hoist: boolean;
	public position: number;
	public permissions: number;
	public mentionable: boolean;
	public readonly id: string;
	public readonly managed: boolean;

	constructor(public client: Client, data: RolePayload) {
		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.hoist = data.hoist;
		this.managed = data.managed;
		this.position = data.position;
		this.permissions = data.permissions;
		this.mentionable = data.mentionable;
	}
}
