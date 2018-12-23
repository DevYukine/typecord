import Client from '../Client/Client';
import { GuildCreatePayload } from '../Client/Websocket/handlers/GuildCreate';
import DataStore from './DataStore';
import Emoji, { EmojiPayload } from './Emoji';
import GuildChannel from './GuildChannel';
import Member, { GuildMemberPayload } from './GuildMember';
import PartialGuild from './PartialGuild';
import Role, { RolePayload } from './Role';
import VoiceState, { VoiceStatePayload } from './VoiceState';
import WidgetInfo from './WidgetInfo';
import GuildMember from './GuildMember';
import { ChannelPayload, ChannelType } from './Channel';
import TextChannel from './TextChannel';
import VoiceChannel from './VoiceChannel';
import CategoryChannel from './CategoryChannel';

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
	public readonly roles = new DataStore<Role, RolePayload>(this.client, Role);
	public readonly emojis = new DataStore<Emoji, EmojiPayload>(this.client, Emoji);
	public readonly members = new DataStore<GuildMember, GuildMemberPayload>(this.client, Member);
	public readonly channels = new DataStore<GuildChannel, ChannelPayload>(this.client, GuildChannel);
	public readonly voiceStates = new DataStore<VoiceState, VoiceStatePayload>(this.client, VoiceState);

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
			this.roles.add(roleData);
		}
		for (const emojiData of data.emojis) {
			this.emojis.add(emojiData);
		}
		if (data.channels) {
			for (const channelData of data.channels) {
				let channel: GuildChannel;
				switch (channelData.type) {
					case ChannelType.TEXT:
						channel = new TextChannel(this.client, channelData);
						break;
					case ChannelType.VOICE:
						channel = new VoiceChannel(this.client, channelData);
						break;
					case ChannelType.CATEGORY:
						channel = new CategoryChannel(this.client, channelData);
						break;
					default:
						continue;
				}
				this.channels.add(channel);
			}
		}
		if (data.members) {
			for (const memberData of data.members) {
				this.members.add(memberData);
			}
		}
		if (data.voice_states) {
			for (const voiceStateData of data.voice_states) {
				this.voiceStates.add(voiceStateData);
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
