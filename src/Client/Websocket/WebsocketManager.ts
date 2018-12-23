import Client from '../Client';
import Collection from 'collection';
import WebSocketShard from './WebsocketShard';
import * as Util from '../../Util/Util';

export default class WebSocketManager {
	public gateway: string | null = null;
	public shards = new Collection<number, WebSocketShard>();

	constructor(public client: Client) {
		this.shards.set(0, new WebSocketShard(this, 0));
	}

	public async init() {
		for (const shard of this.shards.values()) {
			await shard.connect();
			await Util.wait(5000);
		}
	}
}
