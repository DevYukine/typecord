import DataStore from '../DataStore';
import Message, { MessagePayload } from '../Message';
import MessageEmbed from '../MessageEmbed';
import MessageOptions from '../TextChannel';

export default interface TextBasedChannel {
	messages: DataStore<Message, MessagePayload>;
	lastMessageID?: string | null;
	lastPinTimestamp?: number;
	readonly lastMessage: Message | undefined;
	readonly lastPinAt: Date | undefined;

	send(content: string | string[] | MessageEmbed, options?: MessageOptions): Promise<Message>;
}
