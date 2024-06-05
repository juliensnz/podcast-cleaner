const SEVERITY_DEBUG = 'debug';
const SEVERITY_INFO = 'info';
const SEVERITY_WARNING = 'warning';
const SEVERITY_ERROR = 'error';
const SEVERITY_FATAL = 'fatal';

const SEVERITY_LEVELS = {
  [SEVERITY_DEBUG]: 0,
  [SEVERITY_INFO]: 1,
  [SEVERITY_WARNING]: 2,
  [SEVERITY_ERROR]: 3,
  [SEVERITY_FATAL]: 4,
};

type Severity = keyof typeof SEVERITY_LEVELS;

const isSeverity = (severity: string): severity is Severity => Object.keys(SEVERITY_LEVELS).includes(severity);

export type {Severity};
export {isSeverity, SEVERITY_DEBUG, SEVERITY_ERROR, SEVERITY_FATAL, SEVERITY_INFO, SEVERITY_LEVELS, SEVERITY_WARNING};
