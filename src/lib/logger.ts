// lib/logger.ts

/**
 * Log levels with corresponding numeric values for filtering
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Type for structured log data - can be extended as needed
export type LogData = {
  [key: string]: string | number | boolean | null | undefined | LogData;
} | null | undefined;

/**
 * Interface for log entries
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: LogData;
}

/**
 * Configuration for the logger
 */
interface LoggerConfig {
  minLevel?: LogLevel;
  enableConsole?: boolean;
  // Could be extended with other options like:
  // - Remote logging endpoints
  // - File logging
  // - Custom formatters
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
};

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Formats a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const levelStr = LogLevel[entry.level].padEnd(5);
  const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
  return `[${entry.timestamp}] ${levelStr} [${entry.component}] ${entry.message}${dataStr}`;
}

/**
 * Creates a new logger instance for a specific component
 */
export function createLogger(component: string) {
  function log(level: LogLevel, message: string, data?: LogData) {
    if (level > (globalConfig.minLevel ?? LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
    };

    if (globalConfig.enableConsole) {
      const formattedMessage = formatLogEntry(entry);
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    // Here you could add additional logging targets:
    // - Send to logging service
    // - Write to file
    // - Push to monitoring system
  }

  return {
    error: (message: string, data?: LogData) => log(LogLevel.ERROR, message, data),
    warn: (message: string, data?: LogData) => log(LogLevel.WARN, message, data),
    info: (message: string, data?: LogData) => log(LogLevel.INFO, message, data),
    debug: (message: string, data?: LogData) => log(LogLevel.DEBUG, message, data),
  };
}

/**
 * Configure global logger settings
 */
export function configureLogger(config: Partial<LoggerConfig>) {
  globalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

/**
 * Reset logger configuration to defaults
 */
export function resetLoggerConfig() {
  globalConfig = { ...DEFAULT_CONFIG };
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): Readonly<LoggerConfig> {
  return { ...globalConfig };
}