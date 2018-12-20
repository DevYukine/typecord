import { Region } from '../../..';
import { ChannelPayload } from '../../../Structures/Channel';
import { EmojiPayload } from '../../../Structures/Emoji';
import Guild, { DefaultMessageNotifcationLevel, ExplicitContentFilterLevel, VerificationLevel } from '../../../Structures/Guild';
import { GuildMemberPayload } from '../../../Structures/GuildMember';
import { PartialGuildPayload } from '../../../Structures/PartialGuild';
import { PresencePayload } from '../../../Structures/Presence';
import { RolePayload } from '../../../Structures/Role';
import { VoiceStatePayload } from '../../../Structures/VoiceState';
import Client from '../../Client';

export interface GuildCreatePayload extends PartialGuildPayload {
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
	embed_channel_id?: string;
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
	voice_states?: VoiceStatePayload[];
	members?: GuildMemberPayload[];
	channels?: ChannelPayload[];
	presences?: PresencePayload[];
}

export default function(client: Client, data: GuildCreatePayload) {
	const cache = client.guilds.get(data.id);
	if (cache) {
		if (cache.unavailable && !data.unavailable) {
			const guild = new Guild(client, data);
			client.guilds.set(guild.id, guild);
		}
		return;
	}
	const guild = new Guild(client, data);
	client.guilds.add(guild);
}
