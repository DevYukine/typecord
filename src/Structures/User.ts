import Client from '../Client/Client';

export interface UserPayload {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string;
	bot?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	email?: string;
	flags: number;
	premium_type?: number;
}

export default class User {
	public id: string;
	public bot: boolean;
	public avatar?: string;
	public locale?: string;
	public username: string;
	public discriminator: string;

	constructor(public client: Client, data: UserPayload) {
		this.id = data.id;
		this.bot = Boolean(data.bot);
		this.discriminator = data.discriminator;
		this.username = data.username;
	}
}
