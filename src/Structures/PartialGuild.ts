import Client from '../Client/Client';

export interface PartialGuildPayload {
	id: string;
	unavailable: boolean;
}

export default class PartialGuild {
	public unavailable: boolean;
	public readonly id: string;

	constructor(public client: Client, data: PartialGuildPayload) {
		this.id = data.id;
		this.unavailable = data.unavailable;
	}
}
