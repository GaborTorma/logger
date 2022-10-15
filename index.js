import isArray from 'lodash/isArray.js';
import size from 'lodash/size.js';
import { levels } from 'triple-beam/config/npm.js';
import winston from 'winston';
import humanFormat from './human-format.js';
import config from 'config';

const { combine, timestamp, json, ms, errors } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

process.on('unhandledRejection', (error, promise) => {
	Ł.error(error, promise);
});

process.on('uncaughtException', (error, origin) => {
	Ł.error(error, origin);
});

const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'white',
	http: 'green',
	verbose: 'cyan',
	debug: 'blue',
	silly: 'grey',
};

const loggerOptions = {
	exitOnError: false,
	level: config?.logLevel || process.env?.LOG_LEVEL || 'debug',
	format: combine(timestamp(), errors({ stack: true }), ms(), json()),
};

const consoleLogger = new winston.transports.Console({
	format: combine(
		winston.format.colorize({ all: true, colors }),
		humanFormat({
			showMeta: true,
			showTimestamp: {
				onlyTime: !isProd,
				right: true,
			},
			colors: true,
			metaStrip: ['timestamp'],
			breakLength: isProd ? 120 : 85,
			inspectOptions: {
				depth: 4,
				colors: true,
				breakLength: isProd ? 100 : 82,
				maxArrayLength: 15,
				compact: Infinity,
			},
		})
	),
	stderrLevels: ['warn', 'error'],
	consoleWarnLevels: ['warn', 'error'],
	debugStdout: true,
});

const fileFormat = humanFormat({
	showMeta: true,
	showTimestamp: true,
	colors: false,
	metaStrip: ['timestamp'],
	ignoreSpecialChars: true,
	breakLength: 120,
	inspectOptions: {
		depth: 5,
		colors: false,
		breakLength: 100,
		maxArrayLength: 100,
		compact: Infinity,
	},
});

const combinedFileLogger = new winston.transports.File({
	filename: 'logs/combined.log',
	format: fileFormat,
});

const errorFileLogger = new winston.transports.File({
	filename: 'logs/error.log',
	level: 'warn',
	format: fileFormat,
});

const transports = [consoleLogger];

if (isProd) {
	transports.push(combinedFileLogger, errorFileLogger);
}

export const logger = winston.createLogger({
	...loggerOptions,
	transports,
});

logger.checkLevel = function (level) {
	return this.levels[level] <= this.levels[this.level];
};

logger.l = function (message, log1, log2) {
	if (!isArray(log1[1])) {
		log1[1] = [log1[1]];
	}
	if (!isArray(log2[1])) {
		log2[1] = [log2[1]];
	}
	Ł.checkLevel(log1[0]) ? Ł[log1[0][0]](message, ...log1[1]) : Ł[log2[0][0]](message, ...log2[1]);
};

for (const level in levels) {
	logger[level[0]] = (message, ...meta) =>
		meta
			? logger[level](message, size(meta) > 1 ? [].concat(meta) : meta[0])
			: logger[level](message);
}

export default logger;
