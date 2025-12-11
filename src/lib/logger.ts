/**
 * Environment-aware logger utility
 * Prevents sensitive information from being logged in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
}

class Logger {
    private config: LoggerConfig;

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            enabled: config?.enabled ?? import.meta.env.DEV,
            level: config?.level || 'error',
        };
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;

        const levels: LogLevel[] = ['debug', 'log', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const requestedLevelIndex = levels.indexOf(level);

        return requestedLevelIndex >= currentLevelIndex;
    }

    private sanitizeMessage(message: string): string {
        // Remove potential sensitive data patterns
        const patterns = [
            { pattern: /Bearer\s+[A-Za-z0-9-._~+/]+=*/gi, replacement: 'Bearer [REDACTED]' },
            { pattern: /token["\s:=]+[A-Za-z0-9-._~+/]+=*/gi, replacement: 'token: [REDACTED]' },
            { pattern: /password["\s:=]+[^\s,}]*/gi, replacement: 'password: [REDACTED]' },
            { pattern: /secret["\s:=]+[^\s,}]*/gi, replacement: 'secret: [REDACTED]' },
            { pattern: /apikey["\s:=]+[^\s,}]*/gi, replacement: 'apikey: [REDACTED]' },
        ];

        let sanitized = message;
        patterns.forEach(({ pattern, replacement }) => {
            sanitized = sanitized.replace(pattern, replacement);
        });

        return sanitized;
    }

    log(...args: unknown[]): void {
        if (this.shouldLog('log')) {
            console.log(...args);
        }
    }

    info(...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.info(...args);
        }
    }

    warn(...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn(...args);
        }
    }

    error(message: string, error?: unknown): void {
        if (this.shouldLog('error')) {
            const sanitizedMessage = this.sanitizeMessage(message);

            if (import.meta.env.DEV) {
                // In development, log full error details
                console.error(sanitizedMessage, error);
            } else {
                // In production, log sanitized message only
                console.error(sanitizedMessage);

                // You can integrate with external error tracking services here
                // Example: Sentry.captureException(error);
            }
        }
    }

    debug(...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.debug(...args);
        }
    }

    /**
     * Temporarily enable logging (useful for debugging production issues)
     */
    enable(): void {
        this.config.enabled = true;
    }

    /**
     * Disable logging
     */
    disable(): void {
        this.config.enabled = false;
    }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances if needed
export { Logger };
