import Collection from 'collection';
import Client from '../Client/Client';

export interface DataStoreValue {
	id: string;
}

export interface DataStoreAddOptions {
	cache?: boolean;
	id?: string;
}

export default class DataStore<V extends DataStoreValue> extends Collection<string, V> {
	constructor(public client: Client, public type: new (...args: any[]) => V, public iterable?: Iterable<V>) {
		super();
		if (iterable) for (const item of iterable) this.add(item);
	}

	public get(key?: string | null) {
		if (!key) return undefined;
		return super.get(key);
	}

	public add(data: V, options: DataStoreAddOptions = {}): V {
		const cached = this.get(data.id || options.id);
		if (cached) return cached;

		const entry = new this.type();
		if (options.cache) this.set(data.id || entry.id, entry);
		return entry;
	}

	public remove(key: string) { return super.delete(key); }

	public resolve(input: string | V) {
		if (input instanceof this.type) return input;
		if (typeof input === 'string') return this.get(input);
		return undefined;
	}
}
