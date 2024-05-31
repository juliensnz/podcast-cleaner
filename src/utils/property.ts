import {isInteger, isObject, isArray} from '@/utils/utils';

const propertyUpdater = <T extends object>(
  obj: T | null,
  path: string,
  value: unknown
): T | Record<string, unknown> | unknown[] => {
  const segments = path.split('.');
  const currentSegment = segments[0];

  // If value is invalid, we initialize a new object/array (depending on the current segment type)
  const currentSegmentIsNumber = isInteger(Number(currentSegment));
  const objectIsNullish = undefined === obj || obj === null;
  const objectIsInvalidType = !isObject(obj) && !isArray(obj);
  const segmentIsIncompatibleWithObjectType =
    (isArray(obj) && !currentSegmentIsNumber) || (isObject(obj) && currentSegmentIsNumber);

  let objectToUpdate: Record<string, unknown> | unknown[];
  if (objectIsNullish || objectIsInvalidType || segmentIsIncompatibleWithObjectType) {
    objectToUpdate = currentSegmentIsNumber ? [] : {};
  } else {
    objectToUpdate = isArray(obj) ? [...obj] : {...obj};
  }

  const isLastSegment = segments.length === 1;

  (objectToUpdate as Record<string, unknown>)[currentSegment] = isLastSegment
    ? value
    : propertyUpdater(
        (objectToUpdate as Record<string, unknown>)[currentSegment] as Record<string, unknown>,
        segments.slice(1).join('.'),
        value
      );

  return objectToUpdate;
};

export {propertyUpdater};
