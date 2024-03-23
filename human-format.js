import size from 'lodash/size.js'
import sum from 'lodash/sum.js'
import isNaN from 'lodash/isNaN.js'
import values from 'lodash/values.js'
import every from 'lodash/every.js'
import colors from 'colors/safe.js'
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam'
import { inspect } from 'util'

export class ConsoleFormat {
	reSpaces = /^\s+/
	reSpacesOrEmpty = /^(\s*)/
	// eslint-disable-next-line no-control-regex
	reColor = /\x1B\[\d+m/
	defaultStrip = [LEVEL, MESSAGE, SPLAT, 'level', 'message', 'ms', 'stack']

	constructor(opts = {}) {
		this.opts = opts
		if (typeof this.opts.showMeta === 'undefined') {
			this.opts.showMeta = true
		}
		if (
			typeof this.opts.inspectOptions === 'undefined' &&
			this.opts.breakLength
		) {
			this.opts.inspectOptions = {
				breakLength: this.opts.breakLength - 3,
			}
		}
		if (typeof this.opts.inspectOptions.breakLength === 'undefined') {
			this.opts.inspectOptions.breakLength = this.opts.breakLength
		}
		this.chars = this.opts.ignoreSpecialChars
			? {
					singleLine: '',
					startLine: '',
					line: '',
					endLine: '',
				}
			: {
					singleLine: '▪',
					startLine: '┏',
					line: '┃',
					endLine: '┗',
				}
		this.reset = this.opts.ignoreSpecialChars ? ' ' : colors.reset(' ')
		this.dim = this.opts.colors ? colors.dim : (v) => v
	}

	inspector(value, messages) {
		const inspector = inspect(value, this.opts.inspectOptions)

		inspector.split('\n').forEach((line) => {
			messages.push(line)
		})
	}

	message(info, chr, color) {
		let message = ''

		let timestamp = ''
		if (this.opts.showTimestamp && info.timestamp) {
				const date = new Date(info.timestamp)
				const year = date.getFullYear()
				const month = String(date.getMonth()).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hours = String(date.getHours()).padStart(2, '0')
				const min = String(date.getMinutes()).padStart(2, '0')
				const sec = String(date.getSeconds()).padStart(2, '0')
				const ms = String(date.getMilliseconds()).padStart(3, '0')
				const time = `${hours}:${min}:${sec}.${ms}`
				timestamp = this.opts.showTimestamp?.onlyTime
					? time
					: `${year}-${month}-${day} ${time}`

			if (this.opts.showTimestamp?.right !== true) {
				message += `[${timestamp}] `
			}
		}

		message += info.message.replace(
			undefined, // this.reSpacesOrEmpty,
			`$1${color}${this.dim(chr)}${this.reset}`
		)

		let splat = this.splat(info)

		const sizes = {
			splat: splat
				? size(
						inspect(splat, {
							...this.opts.inspectOptions,
							colors: false,
							breakLength: Infinity,
						})
					)
				: 0,
			message: size(message),
			ms: size(info.ms),
		}

		if (sizes.message > 0 && this.opts.colors) {
			sizes.message -= 10 // + 24 - 2
		}

		if (this.opts.showTimestamp?.right) {
			sizes.timestamp = size(timestamp)
		}

		for (const key in sizes) {
			if (sizes[key] > 0) {
				sizes[key]++
			}
		}

		if (splat) {
			if (sum(values(sizes)) <= this.opts.breakLength) {
				splat = inspect(splat, {
					...this.opts.inspectOptions,
					breakLength: Infinity,
				})
				message += `${this.reset}${splat}`
				delete info[SPLAT]
			} else {
				delete sizes.splat
			}
		}

		message += this.ms(info)

		if (this.opts.showTimestamp?.right) {
			delete sizes.timestamp
			const padSize =
				this.opts.breakLength - sum(values(sizes)) - size(timestamp) + 1
			const pad = ' '.padEnd(padSize, ' ')
			message += pad + this.dim(timestamp)
		}

		return message
	}

	pad(message) {
		let spaces = ''
		const matches = message && message.match(this.reSpaces)
		if (matches && matches.length > 0) {
			spaces = matches[0]
		}

		return spaces
	}

	ms(info) {
		let ms = ''
		if (info.ms) {
			ms = this.opts.ignoreSpecialChars
				? ` (${info.ms})`
				: colors.italic(this.dim(` ${info.ms}`))
		}

		return ms
	}

	stack(info) {
		const messages = []

		if (info.stack) {
			const error = new Error()
			error.stack = info.stack
			this.inspector(error, messages)
		}

		return messages
	}

	splat(info) {
		let stripped = { ...info }
		const splat = info[SPLAT]

		this.defaultStrip.forEach((e) => delete stripped[e])
		if (this.opts.metaStrip) {
			this.opts.metaStrip.forEach((e) => delete stripped[e])
		}

		if (Object.keys(stripped).length > 0) {
			if (every(Object.keys(stripped), (key) => !isNaN(parseInt(key)))) {
				stripped = values(stripped)
			}
			return stripped
		} else if (
			!info.stack &&
			size(splat) === 1 &&
			typeof splat[0] !== 'undefined'
		) {
			return splat[0]
		}
	}

	meta(info) {
		const messages = []
		if (info[SPLAT]) {
			const splat = this.splat(info)
			if (splat) {
				this.inspector(splat, messages)
			}
		}

		return messages
	}

	getColor(info) {
		let color = ''
		if (this.opts.colors) {
			const colorMatch = info.level.match(this.reColor)

			if (colorMatch) {
				color = colorMatch[0]
			}
		}

		return color
	}

	write(info, messages, color) {
		const pad = this.pad(info.message)

		messages.forEach((line, index, arr) => {
			let chr = this.chars.line
			if (index === arr.length - 1) {
				chr = this.chars.endLine
			}
			info[MESSAGE] += `\n${pad}${color}${this.dim(chr)}${this.reset} ${line}`
		})
	}

	transform(info) {
		const messages = []

		const color = this.getColor(info)

		info[MESSAGE] = this.message(
			info,
			this.chars[messages.length > 0 ? 'startLine' : 'singleLine'],
			color
		)

		if (this.opts.showMeta) {
			messages.push(...this.stack(info))
			messages.push(...this.meta(info))
		}

		this.write(info, messages, color)

		return info
	}
}

export default (opts) => {
	return new ConsoleFormat(opts)
}
