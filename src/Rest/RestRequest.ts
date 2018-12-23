import request from 'superagent';
import RestManager from './RestManager';

export enum DiscordAPIMethod {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	PATCH = 'patch',
	DELETE = 'delete'
}

export interface RequestOptions {
	[key: string]: any;
	query?: object;
	auth?: boolean;
	reason?: string;
	headers?: Headers;
	files?: any[];
	data?: object;
}

export interface Headers {
	[key: string]: any;
}

export default class RestRequest {
	public retry = true;

	constructor(private _manager: RestManager, public path: string, public method: DiscordAPIMethod, private _options: RequestOptions) {
	}

	public get route() {
		return `${this._manager.client.options.http.api}/v${this._manager.client.options.http.version}${this.path}`;
	}

	public make() {
		const headers: Headers = {};
		if (this._options.reason) headers['X-Audit-Log-Reason'] = encodeURIComponent(this._options.reason);
		if (this._options.headers) Object.assign(headers, this._options.headers);
		headers['User-Agent'] = this._manager.client.options.http.userAgent;
		headers.Authorization = this._manager.auth;

		const res =  request[this.method](this.route);
		if (this._options.files) {
			for (const file of this._options.files) res.attach(file.name, file.file);
			if (this._options.data) res.attach('payload_json', JSON.stringify(this._options.data));
		} else if (this._options.data) {
			res.send(this._options.data);
		}

		return res.set(headers);
	}
}
