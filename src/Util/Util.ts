import { promisify } from 'util';

export const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

export function mergeDefault<T>(def: any, given: any): T {
	if (!given) return def;
	for (const key in def) {
		if (!has(given, key) || given[key] === undefined) {
			given[key] = def[key];
		} else if (given[key] === Object(given[key])) {
			given[key] = mergeDefault(def[key], given[key]);
		}
	}

	return given;
}

export function wait(time: number) {
	return promisify(setTimeout)(time);
}
