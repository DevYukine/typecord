import DataStore from '../DataStore';
import Message, { MessagePayload } from '../Message';

export default interface TextBasedChannel {
	messages: DataStore<Message, MessagePayload>;
	lastMessageID?: string | null;
	lastPinTimestamp?: number;
	readonly lastMessage: Message | undefined;
	readonly lastPinAt: Date | null;
}
