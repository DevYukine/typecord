import Channel, { ChannelPayload } from './Channel';
import Client from '../Client/Client';

export default class GuildChannel extends Channel {
	public name: string;
	public position: number;

	public readonly guildID: string;

	constructor(client: Client, data: ChannelPayload) {
		super(client, data);
		this.name = data.name!;
		this.guildID = data.guild_id!;
		this.position = data.position!;
	}

	public get guild() {
		return this.client.guilds.get(this.guildID);
	}
}
