import { GuildMemberPayload } from './Member';

export interface VoiceStatePayload {
	guild_id?: string;
	channel_id: string | null;
	user_id: string;
	member?: GuildMemberPayload;
	session_id: string;
	deaf: boolean;
	mute: boolean;
	self_deaf: boolean;
	self_mute: boolean;
	suppress: boolean;
}

export default class VoiceState {

}
