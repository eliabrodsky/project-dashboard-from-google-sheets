const getTimestamp = (): string => {
    return new Date().toISOString();
};

const LOG_STYLES = {
    info: 'color: #0ea5e9;',
    warn: 'color: #f59e0b; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    success: 'color: #22c55e;',
    debug: 'color: #a855f7;'
};

class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private log(level: 'info' | 'warn' | 'error' | 'success' | 'debug', message: string, data?: any) {
        const timestamp = getTimestamp();
        const style = LOG_STYLES[level];
        
        console.groupCollapsed(`%c[${timestamp}] [${this.context}] ${message}`, style);
        if (data) {
            console.log('Data:', data);
        }
        console.groupEnd();
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, error: any) {
        const timestamp = getTimestamp();
        console.groupCollapsed(`%c[${timestamp}] [${this.context}] ${message}`, LOG_STYLES.error);
        console.error('Error Details:', error);
        console.groupEnd();
    }

    success(message: string, data?: any) {
        this.log('success', message, data);
    }

    debug(message: string, data?: any) {
        this.log('debug', message, data);
    }
}

export default Logger;
