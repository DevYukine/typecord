import ClientUser from '../../../Structures/ClientUser';
import PartialGuild, { PartialGuildPayload } from '../../../Structures/PartialGuild';
import { UserPayload } from '../../../Structures/User';
import WebSocketShard, { WebSocketStatus } from '../WebsocketShard';

export interface ReadyPayload {
	v: number;
	user: UserPayload;
	private_channels: [];
	guilds: PartialGuildPayload[];
	session_id: string;
	_trace: string[];
}

export default function(shard: WebSocketShard, data: ReadyPayload) {
	if (!shard.client.user) {
		const clientUser = new ClientUser(shard.client, data.user);
		shard.client.user = clientUser;
		shard.client.users.set(clientUser.id, clientUser);
	}

	for (const guildData of data.guilds) {
		const instance = new PartialGuild(shard.client, guildData);
		shard.client.guilds.set(guildData.id, instance);
	}
}
