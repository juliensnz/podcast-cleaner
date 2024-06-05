import {Either, Result} from '../result';
import {isArray, isObject, isString} from '../utils';
import {isSeverity, Severity} from './Severity';

type RuntimeError = {
  type: string;
  message: string;
  severity?: Severity;
  payload?: Record<string, unknown>;
};

const convertErrorToLoggableError = (error: unknown) => (error instanceof Error ? error.message : error);

const errorHasType = (error: RuntimeError | Either<unknown, RuntimeError>, type: string): boolean => {
  if (!isRuntimeError(error)) {
    if (!error.isError()) return false;

    error = error.getError();
  }

  if (type === error.type) return true;
  if (undefined !== error.payload?.error && isRuntimeError(error.payload?.error))
    return errorHasType(error.payload.error, type);

  return false;
};

const errorHasTypes = (error: RuntimeError | Either<unknown, RuntimeError>, types: string[]): boolean =>
  types.some(type => errorHasType(error, type));

const decorateError = (sourceError: unknown, decoratingError: RuntimeError): RuntimeError => {
  return {
    ...(isRuntimeError(sourceError) && sourceError.severity ? {severity: sourceError.severity} : {}),
    ...decoratingError,
    payload: {
      ...decoratingError.payload,
      error: convertErrorToLoggableError(sourceError),
    },
  };
};

const errorTypeCheckerCreator =
  (types: string[]) =>
  (error: RuntimeError): boolean =>
    types.some(type => errorHasType(error, type)) ||
    (undefined !== error.payload?.error &&
      isRuntimeError(error.payload?.error) &&
      errorTypeCheckerCreator(types)(error.payload.error));

const updateSeverity = (
  error: RuntimeError,
  severity: Severity,
  filterFn: (error: RuntimeError) => boolean = () => true
): RuntimeError => {
  if (!filterFn(error)) {
    return error;
  }

  return {
    ...error,
    severity,
  };
};

const isRuntimeError = (error: unknown): error is RuntimeError => {
  if (!isObject(error) || error === null) {
    return false;
  }

  const maybeRuntimeError = error as RuntimeError;

  return (
    isString(maybeRuntimeError.type) &&
    isString(maybeRuntimeError.message) &&
    (undefined === maybeRuntimeError.severity || isSeverity(maybeRuntimeError.severity)) &&
    (undefined === maybeRuntimeError.payload ||
      isObject(maybeRuntimeError.payload) ||
      isArray(maybeRuntimeError.payload))
  );
};

type Throwing = <A>(result: Promise<Either<A, RuntimeError>> | Either<A, RuntimeError>) => Promise<A>;

const throwing: Throwing = async <A>(
  result: Promise<Either<A, RuntimeError>> | Either<A, RuntimeError>
): Promise<A> => {
  const value = await result;

  return syncedThrowing(value);
};

type SyncedThrowing = <A>(result: Either<A, RuntimeError>) => A;

const syncedThrowing: SyncedThrowing = <A>(result: Either<A, RuntimeError>): A => {
  if (typeof result.isOk !== 'function') {
    throw {
      type: 'throwing.unexpected_result',
      message: 'throwing method can only be used with Either.Ok or Either.Error types',
      payload: {result},
    };
  }

  if (result.isOk()) {
    return result.get();
  }

  throw result.getError();
};

const catching = async <A>(
  callback: (throwing: Throwing) => Promise<Either<A, RuntimeError>>,
  handleError: (error: RuntimeError) => Promise<RuntimeError> | RuntimeError = error => error
): Promise<Either<A, RuntimeError>> => {
  try {
    const result = await callback(throwing);

    if (result.isError()) {
      return Result.Error(await handleError(result.getError()));
    }

    return result;
  } catch (error) {
    if (!isRuntimeError(error)) {
      const message: string = getMessageAsString(error);
      return Result.Error(
        await handleError({
          type: 'catching.unknown_error',
          message,
          payload: {error: convertErrorToLoggableError(error)},
        })
      );
    }

    return Result.Error(await handleError(error));
  }
};

const getMessageAsString = (error: unknown): string => {
  if (isString(error)) return error;
  if (error === null) return 'Unknown error (null value)';
  if (!isObject(error)) return JSON.stringify(error);
  if (isString(error?.message)) return error.message;

  return JSON.stringify(error);
};

export {
  catching,
  decorateError,
  errorHasType,
  errorHasTypes,
  errorTypeCheckerCreator,
  isRuntimeError,
  syncedThrowing,
  throwing,
  updateSeverity,
};
export type {RuntimeError};
