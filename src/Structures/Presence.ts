import { UserPayload } from './User';

export enum ActivityFlags {
	INSTANCE = 1 << 0,
	JOIN = 1 << 1,
	SPECTATE = 1 << 2,
	JOIN_REQUEST = 1 << 3,
	SYNC = 1 << 4,
	PLAY = 1 << 5
}

export enum ActivityType {
	Game,
	Streaming,
	Listening
}

export interface ActivitySecretsPayload {
	join?: string;
	spectate?: string;
	match?: string;
}

export interface ActivityPAssetsPayloads {
	large_image?: string;
	large_text?: string;
	small_images?: string;
	small_text?: string;
}

export interface ActivityPartyPayload {
	id?: string;
	size?: number[];
}

export interface ActivityTimestampPayload {
	start?: number;
	end?: number;
}

export interface ActivityPayload {
	name: string;
	type: ActivityType;
	url?: string;
	timestamp?: ActivityTimestampPayload;
	application_id?: string;
	details?: string;
	state?: string;
	party?: ActivityPartyPayload;
	assets?: ActivityPAssetsPayloads;
	secrets?: ActivitySecretsPayload;
	instance?: boolean;
	flags?: ActivityFlags;
}

export interface PresencePayload {
	user: UserPayload;
	roles: string[];
	game: ActivityPayload;
}

export default class Presence {

}
