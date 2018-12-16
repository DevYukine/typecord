import { UserPayload } from './User';

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

}
