import { DiscordAPIMethod } from './RestRequest';

export default class RestError extends Error {
	constructor(message: string, public name: string, public code: number, public method: DiscordAPIMethod, public path: string) {
		super(message);
	}
}
