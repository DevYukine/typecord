import Member from './GuildMember';
import Role from './Role';
import VoiceState from './VoiceState';
import Client from '../Client/Client';
import Emoji from './Emoji';
import PartialGuild from './PartialGuild';
import WidgetInfo from './WidgetInfo';
import { GuildCreatePayload } from '../Client/Websocket/handlers/GuildCreate';
import DataStore from './DataStore';
import GuildChannel from './GuildChannel';

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

export default class Guild extends PartialGuild {
	public name: string;
	public icon?: string;
	public embed?: WidgetInfo;
	public region: Region;
	public splash?: string;
	public ownerID: string;
	public features: string[];
	public mfaLevel: MFALevel;
	public afkTimeout: number;
	public memberCount?: number;
	public afkChannelID?: string;
	public applicationID?: string;
	public verificationLevel: VerificationLevel;
	public explicitContentFilter: ExplicitContentFilterLevel;
	public defaultMessageNotification: DefaultMessageNotifcationLevel;
	public readonly roles = new DataStore<Role>(this.client, Role);
	public readonly emojis = new DataStore<Emoji>(this.client, Emoji);
	public readonly members = new DataStore<Member>(this.client, Member);
	public readonly channels = new DataStore<GuildChannel>(this.client, GuildChannel);
	public readonly voiceStates = new DataStore<VoiceState>(this.client, VoiceState);

	constructor(client: Client, data: GuildCreatePayload) {
		super(client, data);
		this.name = data.name;
		this.icon = data.icon;
		this.region = data.region;
		this.splash = data.splash;
		this.ownerID = data.owner_id;
		this.features = data.features;
		this.mfaLevel = data.mfa_level;
		this.afkTimeout = data.afk_timeout;
		this.memberCount = data.member_count;
		this.afkChannelID = data.afk_channel_id;
		this.applicationID = data.application_id;
		this.verificationLevel = data.verification_level;
		this.explicitContentFilter = data.explicit_content_filter;
		this.defaultMessageNotification = data.default_message_notifications;
		if (data.embed_channel_id || data.embed_enabled) this.embed = new WidgetInfo(this.client, data.embed_channel_id, data.embed_enabled);
		for (const roleData of data.roles) {
			const role = new Role(this.client, roleData);
			this.roles.add(role);
		}
		for (const emojiData of data.emojis) {
			const emoji = new Emoji(this.client, this.id, emojiData);
			this.emojis.add(emoji);
		}
		if (data.members) {
			for (const memberData of data.members) {
				const member = new Member(this.client, memberData);
				this.members.add(member);
			}
		}
		if (data.voice_states) {
			for (const voiceStateData of data.voice_states) {
				const voiceState = new VoiceState(this.client, voiceStateData);
				this.voiceStates.add(voiceState);
			}
		}
	}

	public get owner() {
		return this.members.get(this.ownerID!);
	}

	public get afkChannel() {
		return this.channels.get(this.afkChannelID!);
	}
}
