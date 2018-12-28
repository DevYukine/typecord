import Collection from 'collection';
import * as Util from '../../Util/Util';
import Client, { GatewayObject, ClientEvent } from '../Client';
import WebSocketShard from './WebsocketShard';

export default class WebSocketManager {
	public gateway: GatewayObject | null = null;
	public shards = new Collection<number, WebSocketShard>();

	constructor(public client: Client) {

	}

	public async initialize() {
		this._debug('Initializing Websocket Manager...');
		this._createShards();
		for (const shard of this.shards.values()) {
			await shard.initialize();
			await Util.wait(5000);
		}
	}

	public async destroy() {
		this._debug('Destroying requested');
		const promises = [];
		for (const shard of this.shards.values()) {
			promises.push(shard.destroy());
		}
		await Promise.all(promises);
		this.shards.clear();
	}

	private _createShards() {
		this._debug('Creating WebSocketShards from Client Options...');
		const { shards, shardCount } = this.client.options;
		if (shards.length) {
			for (const id of shards) {
				this.shards.set(id, new WebSocketShard(this, id));
			}
			this.client.options.shardCount = shards.length;
			this.client.options.totalShardCount = shards.length;
		} else if (shardCount) {
			for (let i = 0; i < shardCount; i++) this.shards.set(i, new WebSocketShard(this, i));
			this.client.options.totalShardCount = shardCount as number;
		}
	}

	private _debug(message: string) {
		return this.client.emit(ClientEvent.DEBUG, `[Websocket Manager] ${message}`);
	}
}
