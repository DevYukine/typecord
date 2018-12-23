import { Response } from 'superagent';
import * as Util from '../Util/Util';
import RestError from './RestError';
import RestManager from './RestManager';
import RestRequest from './RestRequest';
import APIError from './APIError';

export interface RateLimitItem {
	resolve(value?: any): void;
	reject(error?: Error): void;
	request: RestRequest;
}

export default class RateLimitBucket {
	public queue: RateLimitItem[] = [];
	public retryAfter = -1;
	public remaining = -1;
	public reset = -1;
	public limit = -1;
	public busy = false;

	constructor(private _manager: RestManager) {

	}

	public enqueue(item: RateLimitItem) {
		this.queue.push(item);
		this._execute();
	}

	private get _limited() {
		return (this._manager.globalRateLimit || this.remaining <= 0) && Date.now() < this.reset;
	}

	private async _execute(): Promise<void> {
		if (this.busy || this.queue.length === 0) return;
		this.busy = true;
		const item = this.queue.shift()!;
		const { reject, request, resolve } = item;

		if (this._limited) {
			if (this._manager.globalRateLimit) {
				await this._manager.globalRateLimit;
			} else {
				const timeout = this.reset - Date.now();
				await Util.wait(timeout);
			}
		}

		let response: Response;
		try {
			response = await request.make();
		} catch (error) {
			await this._headers(request, error);
			this.busy = false;
			if (error.status >= 400 && error.status <= 500) {
				return reject(new APIError(request.route, error, request.method));
			} else if (error.status === 429) {
				this.queue.unshift(item);
				await Util.wait(this.retryAfter);
				return this._execute();
			} else if (error.status >= 500 && error.status < 600) {
				if (request.retry) {
					request.retry = false;
					this.queue.unshift(item);
					return this._execute();
				}
			}
			return reject(new RestError(error.message, error.constructor.name, error.status, request.method, request.route));
		}

		await this._headers(request, response);
		this.busy = false;

		resolve(response.body);

		return this._execute();
	}

	private async _headers(request: RestRequest, response: Response) {
		const serverDate = response.header.date;
		const limit = response.header['x-ratelimit-limit'];
		const remaining = response.header['x-ratelimit-remaining'];
		const reset = response.header['x-ratelimit-reset'];
		const retryAfter = response.header['retry-after'];

		this.limit = limit ? Number(limit) : 100;
		this.remaining = remaining ? Number(remaining) : 1;
		this.reset = reset ? RateLimitBucket.calculateReset(Number(reset), serverDate) : Date.now();
		this.retryAfter = retryAfter ? Number(retryAfter) : -1;

		if (request.route.includes('reactions')) {
			this.reset = new Date(serverDate).getTime() - RateLimitBucket.calculateAPIOffset(serverDate) + 250;
		}

		if (response.header['x-ratelimit-global']) {
			this._manager.globalRateLimit = Util.wait(this.retryAfter);

			await this._manager.globalRateLimit;

			this._manager.globalRateLimit = null;
		}
	}

	private static calculateReset(reset: number, serverDate: string) {
		return new Date(reset * 1000).getTime() - RateLimitBucket.calculateAPIOffset(serverDate);
	}

	private static calculateAPIOffset(serverDate: string) {
		return new Date(serverDate).getTime() - Date.now();

	}
}
