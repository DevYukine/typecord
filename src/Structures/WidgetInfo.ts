import Client from '../Client/Client';

export default class WidgetInfo {
	constructor(public client: Client, public channelID?: string, public enabled?: boolean) {

	}

	get channel() {
		return this.client.channels.get(this.channelID!);
	}
}
