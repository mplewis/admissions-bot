import pino from 'pino';

const pretty = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
		},
	},
};

const log = pino({
	level: process.env.LOG_LEVEL || 'info',
	...(process.stdout.isTTY ? pretty : {}),
});

export default log;
