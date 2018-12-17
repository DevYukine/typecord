export interface MessageEmbedOptions {
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

	constructor(data?: MessageEmbedOptions) {
		if (data) {
			if (data.type) this.type = data.type;
			if (data.title) this.title = data.title;
			if (data.url) this.url = data.url;
			if (data.color) this.color = data.color;
			if (data.timestamp) this.timestamp = data.timestamp;
			if (data.description) this.description = data.description;
			if (data.fields) this.fields = data.fields;
			if (data.thumbnail) this.thumbnail = data.thumbnail;
		}
	}
}
