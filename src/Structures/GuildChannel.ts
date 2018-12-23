import Client from '../Client/Client';
import Channel, { ChannelPayload } from './Channel';
import DataStore from './DataStore';
import PermissionOverwrite, { PermissionOverwritePayload } from './PermissionOverwrite';
import Updatable from './Interfaces/Updatable';

export default class GuildChannel extends Channel implements Updatable {
	public name: string;
	public position: number;
	public overwrites = new DataStore<PermissionOverwrite, PermissionOverwritePayload>(this.client, PermissionOverwrite);

	public readonly guildID: string;

	constructor(client: Client, data: ChannelPayload) {
		super(client, data);
		this.name = data.name!;
		this.guildID = data.guild_id!;
		this.position = data.position!;
		if (data.permission_overwrites) {
			for (const permissionOverwriteData of data.permission_overwrites) {
				const permissionOverwrite = new PermissionOverwrite(this.client, permissionOverwriteData);
				this.overwrites.add(permissionOverwrite);
			}
		}
	}

	public get guild() {
		return this.client.guilds.get(this.guildID);
	}

	public patch(data: ChannelPayload) {
		return this;
	}
}
