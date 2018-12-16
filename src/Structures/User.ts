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

}
