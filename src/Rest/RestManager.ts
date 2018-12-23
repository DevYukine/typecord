import Client from '../Client/Client';
import RateLimitBucket from './RateLimitBucket';
import RestRequest, { DiscordAPIMethod, RequestOptions } from './RestRequest';

export default class RestManager {
	public globalRateLimit: Promise<void> | null = null;

	private routes = new Map<string, RateLimitBucket>();

	constructor(public client: Client) {}

	public get auth() {
		return `Bot ${this.client.token}`;
	}

	public enqueue(method: DiscordAPIMethod, url: string, options: RequestOptions = {}): Promise<any> {
		const request = new RestRequest(this, url, method, options);
		let bucket = this.routes.get(request.path);

		if (!bucket) {
			bucket = new RateLimitBucket(this);
			this.routes.set(request.path, bucket);
		}

		return new Promise((resolve, reject) => {
			bucket!.enqueue({
				resolve,
				reject,
				request
			});
		});
	}
}
