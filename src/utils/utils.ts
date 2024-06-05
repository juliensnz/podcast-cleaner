import {RuntimeError} from './error/RuntimeError';
import {Either, Result} from './result';

type UUID = string;

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isString = (value: unknown): value is string => typeof value === 'string';
const convertStringToBool = (value: 'true' | 'false'): boolean => value === 'true';
const isStringCollection = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isInteger = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isMeasurement = (value: unknown): value is {value: string; unit: string} =>
  isObject(value) && isString(value.value) && isString(value.unit);
const isPrice = (value: unknown): value is {amount: string; currency: string} =>
  isObject(value) && isString(value.amount) && isString(value.currency);

type FunctionType = (...args: unknown[]) => unknown;
const isFunction = <T extends FunctionType>(value: unknown): value is T => typeof value === 'function';

const camelToSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const capitalize = <T extends string>(value: T) => (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;
const waitFor = (time: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, time);
  });

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type ExtractValuesFromObject<Obj> = Obj[keyof Obj];

/*
  This is useful when we need to get all function overloaded signatures
  TS cannot do this on its own
*/
type OverloadsToUnion<T> = T extends {
  (...args: infer P1): infer R1;
  (...args: infer P2): infer R2;
  (...args: infer P3): infer R3;
  (...args: infer P4): infer R4;
  (...args: infer P5): infer R5;
  (...args: infer P6): infer R6;
  (...args: infer P7): infer R7;
  (...args: infer P8): infer R8;
}
  ?
      | ((...args: P1) => R1)
      | ((...args: P2) => R2)
      | ((...args: P3) => R3)
      | ((...args: P4) => R4)
      | ((...args: P5) => R5)
      | ((...args: P6) => R6)
      | ((...args: P7) => R7)
      | ((...args: P8) => R8)
  : never;

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Capitalize<T>}${Capitalize<SnakeToCamelCase<U>>}`
  : Capitalize<S>;

const upperCamelize = <T extends string>(value: T): SnakeToCamelCase<T> =>
  value.split('_').map(capitalize).join('') as SnakeToCamelCase<T>;

type PositiveInteger<T extends number> = number extends T
  ? never
  : `${T}` extends `-${string}` | `${string}.${string}` | `0`
  ? never
  : T;

const groupIntoBatches = <T, BatchSizeType extends number>(
  iterator: T[],
  batchSize: PositiveInteger<BatchSizeType>
): T[][] => {
  const batchCount = Math.ceil(iterator.length / batchSize);

  return Array.from({length: batchCount}, (_, i) => iterator.slice(i * batchSize, (i + 1) * batchSize));
};

const pick = <ValueType>(
  source: Record<string, ValueType>,
  includedKeys: Array<keyof typeof source>
): Record<string, ValueType> =>
  Object.fromEntries(Object.entries(source).filter(([key]) => includedKeys.includes(key)));

const omit = <ObjectType extends Record<string, unknown>, KeyType extends (keyof ObjectType)[]>(
  source: ObjectType,
  excludedKeys: KeyType
): Omit<ObjectType, KeyType[number]> =>
  Object.fromEntries(Object.entries(source).filter(([key]) => !excludedKeys.includes(key))) as Omit<
    ObjectType,
    KeyType[number]
  >;

const parseJSON = <T>(json: string): Either<T, RuntimeError> => {
  try {
    return Result.Ok(JSON.parse(json));
  } catch (error) {
    return Result.fromNativeError(error, {
      type: 'parse_json',
      message: 'Unable to parse JSON',
      payload: {
        data: json,
      },
    });
  }
};

const arrayUnique = <T = unknown>(...arrays: T[][]): T[] => [...new Set([...arrays.flat()])];

const areObjectsEqual = (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
  const keys = arrayUnique([...Object.keys(obj1), ...Object.keys(obj2)]);
  return keys.every(key => obj1[key] === obj2[key]);
};

const arraysContainSameElements = (array1: unknown[], array2: unknown[]) => {
  const sortedArray1 = [...array1].sort();
  const sortedArray2 = [...array2].sort();

  return (
    sortedArray1.length === sortedArray2.length && sortedArray1.every((value, index) => sortedArray2[index] === value)
  );
};

const indexBy = <Item extends Record<string, unknown>, Key extends keyof Item>(
  items: Item[],
  key: Key
): Record<string, Item> => Object.fromEntries(items.map(item => [item[key], item])) as Record<string, Item>;

const groupBy = <T>(array: T[], key: (item: T) => string | number) =>
  array.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<string | number, T[]>);

const orderObjectProperties = <T extends Record<string, unknown> = Record<string, unknown>>(
  object: T,
  callback?: (object: T, key: keyof T) => [keyof T, unknown]
): T =>
  Object.fromEntries(
    Object.keys(object)
      .sort()
      .map(key => {
        if (callback) {
          return callback(object, key);
        }
        return [key, object[key]];
      })
  ) as T;

type QueryParam = string | number | boolean | string[] | number[] | undefined | null;

const buildUrlQueryFromParams = (params: Record<string, QueryParam>, arraySeparator = ','): string =>
  new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => (Array.isArray(value) ? [key, value.join(arraySeparator)] : [key, value!.toString()]))
    )
  ).toString();

const isUrl = (maybeUrl: string): boolean => {
  try {
    new URL(maybeUrl);
    return true;
  } catch (error) {
    return false;
  }
};

// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
// This allow to make some properties optional in a type
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const doesStringContainQueryParams = (url: string): boolean => new RegExp(/\?.+=.*/g).test(url);

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

export {
  areObjectsEqual,
  arraysContainSameElements,
  arrayUnique,
  buildUrlQueryFromParams,
  camelToSnakeCase,
  capitalize,
  convertStringToBool,
  doesStringContainQueryParams,
  groupBy,
  groupIntoBatches,
  indexBy,
  isArray,
  isBoolean,
  isFunction,
  isInteger,
  isMeasurement,
  isNumber,
  isObject,
  isPrice,
  isString,
  isStringCollection,
  isUrl,
  omit,
  ONE_HOUR,
  ONE_MINUTE,
  ONE_SECOND,
  ONE_WEEK,
  orderObjectProperties,
  parseJSON,
  pick,
  upperCamelize,
  waitFor,
};

export type {DeepPartial, ExtractValuesFromObject, OverloadsToUnion, PartialBy, UUID};
