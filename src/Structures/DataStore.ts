import Collection from 'collection';
import Client from '../Client/Client';

export interface DataStoreValue {
	id?: string | null;
}

export interface DataStoreAddOptions {
	constructorArgs?: Iterable<any>;
	cache?: boolean;
	id?: string;
}

export default class DataStore<V extends DataStoreValue, T> extends Collection<string, V> {
	constructor(public client: Client, public type: new (...args: any[]) => V, public iterable?: Iterable<T>) {
		super();
		if (iterable) for (const item of iterable) this.add(item);
	}

	public get(key?: string | null) {
		if (!key) return undefined;
		return super.get(key);
	}

	public add(data: T | V, options: DataStoreAddOptions = { cache: true }): V {
		const cached = this.get((data as any).id || options.id);
		if (cached) return cached;

		if (data instanceof this.type) {
			this.set(data.id!, data);
			return data;
		}

		const constructorArguments = options.constructorArgs || [];

		const entry = new this.type(this.client, data, ...constructorArguments);
		if (options.cache) {
			const id = (data as any).id || entry.id || options.id;
			this.set(id!, entry);
		}
		return entry;
	}

	public remove(key: string) { return super.delete(key); }

	public resolve(input: string | V) {
		if (input instanceof this.type) return input;
		if (typeof input === 'string') return this.get(input);
		return undefined;
	}
}
