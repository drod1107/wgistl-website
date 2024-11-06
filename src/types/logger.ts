// types/logger.ts

export interface LogData {
  [key: string]: string | number | boolean | null | undefined | LogData;
}
  
export interface ErrorLogData extends LogData {
  message: string;
  details?: LogData;
  code?: number;
  name?: string;
}
  
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
  
export interface Logger {
  error: (message: string, data?: ErrorLogData) => void;
  warn: (message: string, data?: LogData) => void;
  info: (message: string, data?: LogData) => void;
  debug: (message: string, data?: LogData) => void;
}