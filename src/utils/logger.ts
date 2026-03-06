// Centralized logging utility

type LogLevel = 'log' | 'error' | 'warn' | 'info';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private logWithLevel(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment && level === 'log') {
      return; // Don't log in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  log(message: string, ...args: any[]) {
    this.logWithLevel('log', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logWithLevel('error', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logWithLevel('warn', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.logWithLevel('info', message, ...args);
  }
}

export const logger = new Logger();

