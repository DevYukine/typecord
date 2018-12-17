import { Dispatch, GatewayEvent } from './WebsocketShard';
import Ready from './handlers/READY';
import GUILD_CREATE from './handlers/GUILD_CREATE';
import Client from '../Client';

export default function handle(client: Client, data: Dispatch) {
	const { t } = data;

	switch (t) {
		case GatewayEvent.READY:
			Ready(client, data.d);
			break;
		case GatewayEvent.GUILD_CREATE:
			GUILD_CREATE(client, data.d);
		default:
			break;
	}
}
