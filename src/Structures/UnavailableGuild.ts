import { Client } from '..';

export interface GuildPayload {
	id: string;
	unavailable: boolean;
}

export default class UnavailableGuild {
	public readonly id: string;
	public unavailable: boolean;

	constructor(public client: Client, data: GuildPayload) {
		this.id = data.id;
		this.unavailable = data.unavailable;
	}
}
