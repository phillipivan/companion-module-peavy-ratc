import { InstanceStatus, TCPHelper } from '@companion-module/base'
import {
	msgDelay,
	cmd,
	EOM,
	paramSep,
	keepAliveInterval,
	keepAliveValue,
	timeOutInterval,
	groupSubscribeInterval,
} from './consts.js'

export function addCmdtoQueue(msg) {
	if (msg !== undefined && msg.length > 0) {
		this.cmdQueue.push(msg)
		return true
	}
	this.log('warn', `Invalid command: ${msg}`)
	return false
}

export function processCmdQueue() {
	if (this.cmdQueue.length > 0) {
		this.sendCommand(this.cmdQueue.shift())
	}
	this.cmdTimer = setTimeout(() => {
		this.processCmdQueue()
	}, msgDelay)
}

export function startCmdQueue() {
	this.log('debug', 'starting cmdTimer')
	if (this.cmdTimer) {
		clearTimeout(this.cmdTimer)
	}
	this.cmdTimer = setTimeout(() => {
		this.processCmdQueue()
	}, msgDelay)
}

export function stopCmdQueue() {
	this.log('debug', 'stopping cmdTimer')
	if (this.cmdTimer) {
		clearTimeout(this.cmdTimer)
		delete this.cmdTimer
	} else {
		this.log('debug', 'stopCmdQueue called, but this.cmdTimer does not exist')
	}
}

export async function sendCommand(msg) {
	if (msg !== undefined) {
		if (this.socket !== undefined && this.socket.isConnected) {
			//this.log('debug', `Sending Command: ${msg}`)
			return await this.socket.send(msg + EOM)
		} else {
			this.log('warn', `Socket not connected, tried to send: ${msg}`)
		}
	} else {
		this.log('warn', 'Command undefined')
	}
	return false
}

//queries made on initial connection.
export async function queryOnConnect() {
	if (this.config.v2) {
		let msg =
			this.config.username === ''
				? ''
				: this.config.password === ''
					? paramSep + this.config.username
					: paramSep + this.config.username + paramSep + this.config.password
		await this.sendCommand(cmd.ratcV2.logIn + msg)
		this.addCmdtoQueue(cmd.ratcV2.statusGet)
		this.addCmdtoQueue(cmd.ratcV2.keepAlive + paramSep + keepAliveValue)
		this.addCmdtoQueue(cmd.ratcV2.quietModeDisable)
		this.addCmdtoQueue(cmd.ratcV2.controlList)
		this.addCmdtoQueue(cmd.ratcV2.changeGroupSchedule + paramSep + groupSubscribeInterval)
	} else {
		await this.sendCommand(this.config.username)
		await this.sendCommand(this.config.password)
	}
}

export function keepAlive() {
	//track timer requests
	if (this.config.v2) {
		this.addCmdtoQueue(cmd.ratcV2.changeGroupGet)
	} else {
		this.addCmdtoQueue(cmd.ratcV1.changeGroupGet)
	}
	this.keepAliveTimer = setTimeout(() => {
		this.keepAlive()
	}, keepAliveInterval)
}

export function startKeepAlive() {
	this.log('debug', 'starting keepAliveTimer')
	if (this.keepAliveTimer) {
		clearTimeout(this.keepAliveTimer)
		delete this.keepAliveTimer
	}
	this.keepAliveTimer = setTimeout(() => {
		this.keepAlive()
	}, keepAliveInterval)
}

export function stopKeepAlive() {
	this.log('debug', 'stopping keepAliveTimer')
	if (this.keepAliveTimer) {
		clearTimeout(this.keepAliveTimer)
		delete this.keepAliveTimer
	} else {
		this.log('debug', 'stopKeepAlive called, but this.keepAliveTimer does not exist')
	}
}

export function timeOut() {
	//dump cmdQueue to prevent excessive queuing of old commands
	this.cmdQueue = []
	this.timeOutTimer = setTimeout(() => {
		this.timeOut()
	}, timeOutInterval)
}

export function startTimeOut() {
	this.log('debug', 'starting timeOutTimer')
	if (this.timeOutTimer) {
		clearTimeout(this.timeOutTimer)
		delete this.timeOutTimer
	}
	this.timeOutTimer = setTimeout(() => {
		this.timeOut()
	}, timeOutInterval)
}

export function stopTimeOut() {
	this.log('debug', 'stopping timeOutTimer')
	if (this.timeOutTimer) {
		clearTimeout(this.timeOutTimer)
		delete this.timeOutTimer
	} else {
		this.log('debug', 'stopTimeOut called, but this.timeOutTimer does not exist')
	}
}

export function initTCP() {
	this.receiveBuffer = ''
	if (this.socket !== undefined) {
		//this.sendCommand(EndSession)
		this.stopCmdQueue()
		this.stopKeepAlive()
		this.startTimeOut()
		this.stopActionUpdateTimer()
		this.socket.destroy()
		delete this.socket
	}
	if (this.config.host) {
		this.log('debug', 'Creating New Socket')

		this.updateStatus(InstanceStatus.Connecting, `Connecting to Host: ${this.config.host}`)
		this.socket = new TCPHelper(this.config.host, this.config.port)

		this.socket.on('status_change', (status, message) => {
			this.updateStatus(status, message)
		})
		this.socket.on('error', (err) => {
			this.log('error', `Network error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			this.stopCmdQueue()
			this.stopKeepAlive()
			this.startTimeOut()
			this.stopActionUpdateTimer()
		})
		this.socket.on('connect', async () => {
			this.log('info', `Connected to ${this.config.host}:${this.config.port}`)
			this.updateStatus(InstanceStatus.Connecting, `Logging In`)
			this.receiveBuffer = ''
			await this.queryOnConnect()
		})
		this.socket.on('data', (chunk) => {
			let i = 0,
				line = '',
				offset = 0
			this.receiveBuffer += chunk
			while ((i = this.receiveBuffer.indexOf(EOM, offset)) !== -1) {
				line = this.receiveBuffer.substr(offset, i - offset)
				offset = i + 2
				this.processCmd(line)
			}
			this.receiveBuffer = this.receiveBuffer.substr(offset)
		})
	} else {
		this.updateStatus(InstanceStatus.BadConfig)
	}
}
