import { UserPayload } from './User';

export interface GuildMemberPayload {
	user: UserPayload;
	nick?: string;
	roles: string[];
	joined_at: Date;
	deaf: boolean;
	mute: boolean;
}

export default class Member {

}
