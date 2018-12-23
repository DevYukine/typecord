import Client from '../Client/Client';
import Activity, { ActivityPayload } from './Activity';
import Guild from './Guild';
import Updatable from './Interfaces/Updatable';
import { UserPayload } from './User';

export enum Status {
	ONLINE = 'online',
	IDLE = 'idle',
	DND = 'dnd',
	OFFLINE = 'offline'
}

export interface PresencePayload {
	user: UserPayload;
	roles: string[];
	game: ActivityPayload;
	guild_id: string;
	status: Status;
	activities: ActivityPayload[];
}

export default class Presence implements Updatable {
	public status: Status;
	public activity?: Activity;

	public readonly id: string;

	constructor(public client: Client, public readonly guild: Guild, data: PresencePayload) {
		this.id = data.user.id;
		this.status = data.status || Status.OFFLINE;
	}

	public get user() {
		return this.client.users.get(this.id);
	}

	public get member() {
		return this.guild.members.get(this.id);
	}

	public patch(data: PresencePayload) {

		return this;
	}
}
