import ClientUser from '../../../Structures/ClientUser';
import PartialGuild, { PartialGuildPayload } from '../../../Structures/PartialGuild';
import { UserPayload } from '../../../Structures/User';
import Client from '../../Client';

export interface ReadyPayload {
	v: number;
	user: UserPayload;
	private_channels: [];
	guilds: PartialGuildPayload[];
	session_id: string;
	_trace: string[];
}

export default function(client: Client, data: ReadyPayload) {
	const clientUser = new ClientUser(client, data.user);
	client.user = clientUser;
	client.users.set(clientUser.id, clientUser);

	for (const guildData of data.guilds) {
		const instance = new PartialGuild(client, guildData);
		client.guilds.set(guildData.id, instance);
	}
}
