import { DiscordAPIMethod } from './RestRequest';

export default class APIError extends Error {
	constructor(public path: string, error: Error, method: DiscordAPIMethod) {
		super();
		const flattened = APIError.flattenErrors(error).join('\n');

		this.message = error.message && flattened ? `${error.message}\n${flattened}` : error.message || flattened;
	}

	private static flattenErrors(obj: object, key = '') {
		let messages: string[] = [];

		for (const [k, v] of Object.entries(obj)) {
			if (k === 'message') continue;
			const newKey = key ? isNaN(Number(k)) ? `${key}.${k}` : `${key}[${k}]` : k;
			if (v._errors) {
				messages.push(`${newKey}: ${v._errors.map((e: Error) => e.message).join(' ')}`);
			} else if (v.code || v.message) {
				messages.push(`${v.code ? `${v.code}: ` : ''}${v.message}`.trim());
			} else if (typeof v === 'string') {
				messages.push(v);
			} else {
				messages = messages.concat(this.flattenErrors(v, newKey));
			}
		}
		return messages;
	}
}
