// import { createLogger, format, transports, Logger } from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// class MyLogger {
//     private logger: Logger;

//     constructor() {
//         const formatPrint = format.printf(({ level, message, context, requestId, timestamp, metadata }) => {
//             return `${timestamp}::${level}::${context || 'N/A'}::${requestId || 'N/A'}::${message}::${JSON.stringify(metadata || {})}`;
//         });

//         this.logger = createLogger({
//             format: format.combine(
//                 format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                 formatPrint
//             ),
//             transports: [
//                 new transports.Console({
//                     level: 'debug',
//                     format: format.combine(
//                         format.colorize(),
//                         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                         formatPrint
//                     )
//                 }),
//                 new DailyRotateFile({
//                     dirname: 'src/logs',
//                     filename: 'application-%DATE%.info.log',
//                     datePattern: 'YYYY-MM-DD',
//                     zippedArchive: true,
//                     maxSize: '1m',
//                     maxFiles: '14d',
//                     level: 'info',
//                     format: format.combine(
//                         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                         formatPrint
//                     )
//                 }),
//                 new DailyRotateFile({
//                     dirname: 'src/logs',
//                     filename: 'application-%DATE%.error.log',
//                     datePattern: 'YYYY-MM-DD',
//                     zippedArchive: true,
//                     maxSize: '1m',
//                     maxFiles: '14d',
//                     level: 'error',
//                     format: format.combine(
//                         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                         formatPrint
//                     )
//                 })
//             ]
//         });
//     }

//     log(level: string, message: string, context?: string, requestId?: string, metadata?: Record<string, unknown>): void {
//         this.logger.log(level, message, { context, requestId, metadata });
//     }

//     info(message: string, context?: string, requestId?: string, metadata?: Record<string, unknown>): void {
//         this.log('info', message, context, requestId, metadata);
//     }

//     error(message: string, context?: string, requestId?: string, metadata?: Record<string, unknown>): void {
//         this.log('error', message, context, requestId, metadata);
//     }

//     debug(message: string, context?: string, requestId?: string, metadata?: Record<string, unknown>): void {
//         this.log('debug', message, context, requestId, metadata);
//     }

//     warn(message: string, context?: string, requestId?: string, metadata?: Record<string, unknown>): void {
//         this.log('warn', message, context, requestId, metadata);
//     }
// }

// export default new MyLogger();

import winston from 'winston';
import 'winston-daily-rotate-file';

// Interface định nghĩa format của log message
interface LogMessage {
    level: string;
    message: string;
    context?: string;
    requestId?: string;
    timestamp?: string;
    metadata?: Record<string, any>;
}

class MyLogger {
    private logger: winston.Logger;

    constructor() {
        // Định dạng log message
        const formatPrint = winston.format.printf(
            (info: winston.Logform.TransformableInfo) => {
                const { level, message, context = '', requestId = '', timestamp = '', metadata = {} } = info;
                return `${timestamp}::${level}::${context}::${requestId}::${message}::${JSON.stringify(metadata)}`;
            }
        );

        // Cấu hình chung cho DailyRotateFile
        const commonRotateConfig = {
            dirname: 'src/logs',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '1m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                formatPrint
            ),
        };

        // Khởi tạo logger
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                formatPrint
            ),
            transports: [
                // Console transport
                new winston.transports.Console(),

                // Info logs transport
                new winston.transports.DailyRotateFile({
                    ...commonRotateConfig,
                    filename: 'application-%DATE%.info.log',
                    level: 'info'
                }),

                // Error logs transport
                new winston.transports.DailyRotateFile({
                    ...commonRotateConfig,
                    filename: 'application-%DATE%.error.log',
                    level: 'error'
                })
            ]
        });
    }

    /**
     * Log info message
     * @param message - Log message
     * @param context - Context của log (vd: service name, function name)
     * @param requestId - ID của request
     * @param metadata - Thông tin bổ sung
     */
    public info(
        message: string,
        context: string = '',
        requestId: string = '',
        metadata: Record<string, any> = {}
    ): void {
        this.logger.info(message, { context, requestId, metadata });
    }

    /**
     * Log error message
     * @param message - Log message
     * @param context - Context của log (vd: service name, function name)
     * @param requestId - ID của request
     * @param metadata - Thông tin bổ sung
     */
    public error(
        message: string,
        context: string = '',
        requestId: string = '',
        metadata: Record<string, any> = {}
    ): void {
        this.logger.error(message, { context, requestId, metadata });
    }

    /**
     * Log warning message
     * @param message - Log message
     * @param context - Context của log (vd: service name, function name)
     * @param requestId - ID của request
     * @param metadata - Thông tin bổ sung
     */
    public warn(
        message: string,
        context: string = '',
        requestId: string = '',
        metadata: Record<string, any> = {}
    ): void {
        this.logger.warn(message, { context, requestId, metadata });
    }

    /**
     * Log debug message
     * @param message - Log message
     * @param context - Context của log (vd: service name, function name)
     * @param requestId - ID của request
     * @param metadata - Thông tin bổ sung
     */
    public debug(
        message: string,
        context: string = '',
        requestId: string = '',
        metadata: Record<string, any> = {}
    ): void {
        this.logger.debug(message, { context, requestId, metadata });
    }
}

// Export instance duy nhất của logger
export const logger = new MyLogger();

// Export type để sử dụng ở nơi khác nếu cần
export type Logger = MyLogger;
