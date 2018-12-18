import Client from '../Client';
import GuildCreate from './handlers/GuildCreate';
import Ready from './handlers/Ready';
import { Dispatch, GatewayEvent } from './WebsocketShard';

export default function handle(client: Client, data: Dispatch) {
	const { t } = data;

	switch (t) {
		case GatewayEvent.READY:
			Ready(client, data.d);
			break;
		case GatewayEvent.GUILD_CREATE:
			GuildCreate(client, data.d);
		default:
			break;
	}
}
