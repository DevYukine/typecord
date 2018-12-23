export interface MessageEmbedPayload {
	type?: MessageEmbedType;
	title?: string;
	description?: string;
	url?: string;
	color?: number;
	timestamp?: Date;
	fields?: MessageEmbedField[];
	thumbnail?: MessageEmbedThumbnail;
}

export enum MessageEmbedType {
	IMAGE = 'image',
	VIDEO = 'video',
	LINK = 'link',
	RICH = 'rich'
}

export interface MessageEmbedField {
	name: string;
	value: string;
	inline: boolean;
}

export interface MessageEmbedThumbnail {
	url: string;
	proxyURL: string;
	height: number;
	width: number;
}

export default class MessageEmbed {
	public url?: string;
	public title?: string;
	public color?: number;
	public timestamp?: Date;
	public description?: string;
	public type?: MessageEmbedType;
	public fields?: MessageEmbedField[];
	public thumbnail?: MessageEmbedThumbnail;

	constructor(data?: MessageEmbedPayload) {
		if (data) {
			this.type = data.type;
			this.title = data.title;
			this.url = data.url;
			this.color = data.color;
			this.timestamp = data.timestamp;
			this.description = data.description;
			this.fields = data.fields;
			this.thumbnail = data.thumbnail;
		}
	}
}
