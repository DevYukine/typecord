import Member, { GuildMemberPayload } from './Member';
import Collection from 'collection';
import Channel from './Channel';
import Role, { RolePayload } from './Role';
import VoiceState, { VoiceStatePayload } from './VoiceState';
import Client from '../Client/Client';
import Emoji, { EmojiPayload } from './Emoji';
import { GuildPayload } from './UnavailableGuild';

export enum DefaultMessageNotifcationLevel {
	ALL_MESSAGES,
	ONLY_MENTIONS
}

export enum ExplicitContentFilterLevel {
	DISABLED,
	MEMBERS_WITHOUT_ROLES,
	ALL_MEMBERS
}

export enum MFALevel {
	NONE,
	ELEVATED
}

export enum VerificationLevel {
	NONE,
	LOW,
	MEDIUM,
	HIGH,
	VERY_HIGH
}

export interface GuildCreatePayload extends GuildPayload {
	name: string;
	icon?: string;
	splash?: string;
	owner?: boolean;
	owner_id: string;
	permissions?: number;
	region: Region;
	afk_channel_id?: string;
	afk_timeout: number;
	embed_enabled?: boolean;
	embed_channel_id: string;
	verification_level: VerificationLevel;
	default_message_notifications: DefaultMessageNotifcationLevel;
	explicit_content_filter: ExplicitContentFilterLevel;
	roles: RolePayload[];
	emojis: EmojiPayload[];
	features: string[];
	mfa_level: number;
	application_id?: string;
	widget_enabled?: boolean;
	widget_channel_id?: string;
	system_channel_id?: string;
	joined_at?: Date;
	large?: boolean;
	member_count?: number;
	voice_states: VoiceStatePayload[];
	members: GuildMemberPayload[];
	// TODO Finish this
}

export enum Region {
	AMSTERDAM = 'amsterdam',
	BRAZIL = 'brazil',
	EU_CENTRAL = 'eu-central',
	EU_WEST = 'eu-west',
	FRANKFURT = 'frankfurt',
	HONG_KONG = 'hongkong',
	JAPAN = 'japan',
	LONDON = 'london',
	RUSSIA = 'russia',
	SINGAPORE = 'singapore',
	SOUTH_AFRICA = 'southafrica',
	SYDNEY = 'sydney',
	US_CENTRAL = 'us-central',
	US_EAST = 'us-east',
	US_SOUTH = 'us-south',
	US_WEST = 'us-west',
	VIP_AMSTERDAM = 'vip-amsterdam',
	VIP_BRAZIL = 'vip-brazil',
	VIP_EU_CENTRAL = 'vip-eu-central',
	VIP_EU_WEST = 'vip-eu-west',
	VIP_FRANKFURT = 'vip-frankfurt',
	VIP_JAPAN = 'vip-japan',
	VIP_LONDON = 'vip-london',
	VIP_SINGAPORE = 'vip-singapore',
	VIP_SOUTH_AFRICA = 'vip-southafrica',
	VIP_SYDNEY = 'vip-sydney',
	VIP_US_CENTRAL = 'vip-us-central',
	VIP_US_EAST = 'vip-us-east',
	VIP_US_SOUTH = 'vip-us-south',
	VIP_US_WEST= 'vip-us-west'
}

export default class Guild {
	public name?: string;
	public icon?: string;
	public region?: Region;
	public splash?: string;
	public ownerID: string;
	public memberCount?: number;
	public unavailable: boolean;
	public readonly id: string;
	public readonly roles = new Collection<string, Role>();
	public readonly emojis = new Collection<string, Emoji>();
	public readonly members = new Collection<string, Member>();
	public readonly channels = new Collection<string, Channel>();
	public readonly voiceStates = new Collection<string, VoiceState>();

	constructor(public client: Client, data: GuildCreatePayload) {
		this.id = data.id;
		this.unavailable = data.unavailable;
	}

	public get owner() {
		return this.members.get(this.ownerID);
	}

	private _patch() {

	}
}
