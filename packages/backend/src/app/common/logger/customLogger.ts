import * as winston from "winston";
import "winston-daily-rotate-file";
import { FastifyRequest, FastifyReply } from "fastify";

export class CustomLogger {
    private logger: winston.Logger;

    constructor() {
        const { timestamp, printf, combine } = winston.format;

        const customMsg = printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
        });

        const infoTransport = new winston.transports.DailyRotateFile({
            level: "info",
            filename: `${__dirname}/../../logs/application-info-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "7d",
        });

        const errorTransport = new winston.transports.DailyRotateFile({
            level: "error",
            filename: `${__dirname}/../../logs/application-error-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        });

        this.logger = winston.createLogger({
            level: "info",
            format: combine(timestamp(), customMsg),
            transports: [infoTransport, errorTransport],
        });
    }

    public logError(
        request: FastifyRequest,
        response: FastifyReply,
        startTime: [number, number],
        error: Error
    ) {
        const responseTime = process.hrtime(startTime);
        const responseTimeMs = responseTime[0] * 1000 + responseTime[1] / 1e6;
        const customError = `${request.id} - ${request.method} ${
            request.url
        } - ${response.statusCode || 500} - ${responseTimeMs.toFixed(2)}ms`;
        `Error: ${error.message}`;

        this.logger.error(customError);
    }

    public logInfo(request: FastifyRequest) {
        const customLog = `${request.id} - ${request.method} ${request.url}`;
        this.logger.info(customLog);
    }
}
