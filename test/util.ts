import { assert } from "chai";

export function deepEqualRemoveUndefined<T extends Record<any, any>>(actual: T, expected: T, message?: string) {
	return assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), message);
}
