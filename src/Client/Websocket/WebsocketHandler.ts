import Client from '../Client';
import GuildCreate from './handlers/GuildCreate';
import Ready from './handlers/Ready';
import WebSocketShard, { Dispatch, GatewayEvent } from './WebsocketShard';

export default function handle(shard: WebSocketShard, data: Dispatch) {
	const { t } = data;

	switch (t) {
		case GatewayEvent.READY:
			Ready(shard, data.d);
			break;
		case GatewayEvent.GUILD_CREATE:
			GuildCreate(shard, data.d);
		default:
			break;
	}
}
