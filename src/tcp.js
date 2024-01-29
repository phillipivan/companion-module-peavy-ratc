const { InstanceStatus, TCPHelper } = require('@companion-module/base')
const { msgDelay, cmd, SOM, EOM, paramSep, keepAliveInterval, keepAliveValue, timeOutInterval } = require('./consts.js')

module.exports = {
	addCmdtoQueue(msg) {
		if (msg !== undefined && msg.length > 0) {
			this.cmdQueue.push(msg)
			return true
		}
		this.log('warn', `Invalid command: ${msg}`)
		return false
	},

	processCmdQueue() {
		if (this.cmdQueue.length > 0) {
			this.sendCommand(this.cmdQueue.splice(0, 1))
		}
		this.cmdTimer = setTimeout(() => {
			this.processCmdQueue()
		}, msgDelay)
	},

	startCmdQueue() {
		this.log('debug', 'starting cmdTimer')
		if (this.cmdTimer) {
			clearTimeout(this.cmdTimer)
			delete this.cmdTimer
		}
		clearTimeout(this.cmdTimer)
		this.cmdTimer = setTimeout(() => {
			this.processCmdQueue()
		}, msgDelay)
	},

	stopCmdQueue() {
		this.log('debug', 'stopping cmdTimer')
		clearTimeout(this.cmdTimer)
		delete this.cmdTimer
	},

	sendCommand(msg) {
		if (msg !== undefined) {
			if (this.socket !== undefined && this.socket.isConnected) {
				//this.log('debug', `Sending Command: ${msg}`)
				this.socket.send(msg + EOM)
				return true
			} else {
				this.log('warn', `Socket not connected, tried to send: ${msg}`)
			}
		} else {
			this.log('warn', 'Command undefined')
		}
		return false
	},

	//queries made on initial connection.
	queryOnConnect() {
		if (this.config.v2) {
			let msg = this.config.username === '' ? '' : this.config.password === '' ? paramSep + this.config.username : paramSep + this.config.username + paramSep + this.config.password
			this.sendCommand(cmd.ratcV2.logIn + msg)
			this.addCmdtoQueue(cmd.ratcV2.statusGet)
			this.addCmdtoQueue(cmd.ratcV2.keepAlive + paramSep + keepAliveValue)
			this.addCmdtoQueue(cmd.ratcV2.quietModeDisable)
			this.addCmdtoQueue(cmd.ratcV2.controlList)
		} else {
			this.addCmdtoQueue(cmd.ratcV1.statusGet)
			this.addCmdtoQueue(cmd.ratcV1.controlList)
		}
	},

	keepAlive() {
		//track timer requests
		if (this.config.v2) {
			this.addCmdtoQueue(SOM + cmd.ratcV2.statusGet)
			this.addCmdtoQueue(SOM + cmd.ratcV2.changeGroupGet)
		} else {
			this.addCmdtoQueue(SOM + cmd.ratcV1.statusGet)
			this.addCmdtoQueue(SOM + cmd.ratcV1.changeGroupGet)
		}
		this.keepAliveTimer = setTimeout(() => {
			this.keepAlive() 
		}, keepAliveInterval)
	},

	startKeepAlive() {
		this.log('debug', 'starting keepAliveTimer')
		if (this.keepAliveTimer) {
			clearTimeout(this.keepAliveTimer)
			delete this.keepAliveTimer
		}
		this.keepAliveTimer = setTimeout(() => {
			this.keepAlive()
		}, keepAliveInterval)
	},

	stopKeepAlive() {
		this.log('debug', 'stopping keepAliveTimer')
		clearTimeout(this.keepAliveTimer)
		delete this.keepAliveTimer
	},

	timeOut() {
		//dump cmdQueue to prevent excessive queuing of old commands
		this.cmdQueue = []
		this.timeOutTimer = setTimeout(() => {
			this.timeOut()
		}, timeOutInterval)
	},

	startTimeOut() {
		this.log('debug', 'starting timeOutTimer')
		if (this.timeOutTimer) {
			clearTimeout(this.timeOutTimer)
			delete this.timeOutTimer
		}
		this.timeOutTimer = setTimeout(() => {
			this.timeOut()
		}, timeOutInterval)
	},

	stopTimeOut() {
		this.log('debug', 'stopping timeOutTimer')
		clearTimeout(this.timeOutTimer)
		delete this.timeOutTimer
	},

	initTCP() {
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

			this.updateStatus(`Connecting to RATC Host: ${this.config.host}:${this.config.port}`)
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})
			this.socket.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
				this.stopCmdQueue()
				this.stopKeepAlive()
				this.startTimeOut()
				this.stopActionUpdateTimer()
			})
			this.socket.on('connect', () => {
				this.log('info', `Connected to ${this.config.host}:${this.config.port}`)
				this.receiveBuffer = ''
				this.queryOnConnect()
			})
			this.socket.on('data', (chunk) => {
				let i = 0,
					line = '',
					offset = 0
				this.receiveBuffer += chunk
				while ((i = this.receiveBuffer.indexOf(EOM, offset)) !== -1) {
					line = this.receiveBuffer.substr(offset, i - offset)
					offset = i + 2
					this.processCmd(line.toString())
				}
				this.receiveBuffer = this.receiveBuffer.substr(offset)
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	},
}
