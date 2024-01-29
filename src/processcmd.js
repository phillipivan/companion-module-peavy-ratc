const { resp, cmd, alert } = require('./consts.js')

module.exports = {
	async processCmd(chunk) {
		let reply = chunk.toString()
		if (chunk[0] == alert) {
			this.log('warn', `${reply}`)
			return undefined
		}
		let params = reply.split(' ')
		//this.log('debug', `response recieved: ${reply}`)
		switch (params[0]) {
			case resp.ratcV1.username:
				this.sendCommand(this.config.username)
				break
			case resp.ratcV1.password:
				this.sendCommand(this.config.password)
				break
			case resp.ratcV1.ratcVersion:
				break
			case resp.ratcV1.welcome:
				this.updateStatus('ok', 'Logged in')
				this.log('info', 'OK: Logged In')
				this.stopTimeOut()
				this.startCmdQueue()
				this.startKeepAlive()
				return true
			case resp.ratcV1.overflow:
				this.log('error', `${reply}`)
				this.updateStatus('error', 'Overflow')
				return undefined	
			case resp.ratcV1.statusIs:
				break
			case resp.ratcV1.valueIs:
				break
			case resp.ratcV1.badArgumentCount:
				break
			case resp.ratcV1.unlistedGroup:
				break
			case resp.ratcV1.addedToChangeGroup:
				break
			case resp.ratcV1.removedFromChangeGroup:
				break
			case resp.ratcV1.invalidChangeGroup:
				break
			case resp.ratcV1.clearedChangeGroup:
				break
			case resp.ratcV1.numberOfChanges:
				break
			case resp.ratcV1.notRunning:
				break
			case resp.ratcV1.badCommand:
				break
			case resp.ratcV1.loginFailed:
				this.log('error', 'Password is incorrect')
				this.stopCmdQueue()
				this.stopKeepAlive()
				this.startTimeOut()
				break
			case resp.ratcV1.startControlGroupList:
				break
			case resp.ratcV1.endControlGroupList:
				break
			case resp.ratcV2.statusIs:
				break
			case resp.ratcV2.valueIs:
				break
			case resp.ratcV2.loggedIn:
				this.updateStatus('ok', 'Logged in')
				this.log('info', 'OK: Logged In')
				this.stopTimeOut()
				this.startCmdQueue()
				this.startKeepAlive()
				return true
			case resp.ratcV2.keepAlive:
				break
			case resp.ratcV2.quietModeEnabled:
				break
			case resp.ratcV2.quietModeDisabled:
				break
			case resp.ratcV2.changeGroupControlAdded:
				break
			case resp.ratcV2.changeGroupControlRemoved:
				break
			case resp.ratcV2.changeGroupCleared:
				break
			case resp.ratcV2.changeGroupChanges:
				break
			case resp.ratcV2.badCommand:
				break
			case resp.ratcV2.badArgumentCount:
				break
			case resp.ratcV2.overflow:
				this.log('error', `${reply}`)
				this.updateStatus('error', 'Overflow')
				return undefined
			case resp.ratcV2.unlistedControl:
				break
			case resp.ratcV2.invalidChangeGroup:
				break
			case resp.ratcV2.commandFailed:
				break
			case resp.ratcV2.commandUnsupported:
				break
			case resp.ratcV2.notLoggedIn:
				break
			case resp.ratcV2.loginFailed:
				this.log('error', 'Password is incorrect')
				this.stopCmdQueue()
				this.stopKeepAlive()
				this.startTimeOut()
				break
			case cmd.ratcV1.help:
			case cmd.ratcV1.statusGet:
			case cmd.ratcV1.controlGet:
			case cmd.ratcV1.controlSet:
			case cmd.ratcV1.controlList:
			case cmd.ratcV1.changeGroupAddControl:
			case cmd.ratcV1.changeGroupRemoveControl:
			case cmd.ratcV1.changeGroupClear:
			case cmd.ratcV1.changeGroupGet:
			case cmd.ratcV2.help:
			case cmd.ratcV2.logIn:
			case cmd.ratcV2.statusGet:
			case cmd.ratcV2.keepAlive:
			case cmd.ratcV2.quietModeEnable:
			case cmd.ratcV2.quietModeDisable:
			case cmd.ratcV2.controlList:
			case cmd.ratcV2.controlGet:
			case cmd.ratcV2.controlSet:
			case cmd.ratcV2.controlPositionSet:
			case cmd.ratcV2.changeGroupControlAdd:
			case cmd.ratcV2.changeGroupControlRemove:
			case cmd.ratcV2.changeGroupGet:
			case cmd.ratcV2.changeGroupClear:
			case cmd.ratcV2.changeGroupSchedule:
			case cmd.ratcV2.long.help:
			case cmd.ratcV2.long.logIn:
			case cmd.ratcV2.long.statusGet:
			case cmd.ratcV2.long.keepAlive:
			case cmd.ratcV2.long.quietModeEnable:
			case cmd.ratcV2.long.quietModeDisable:
			case cmd.ratcV2.long.controlList:
			case cmd.ratcV2.long.controlGet:
			case cmd.ratcV2.long.controlSet:
			case cmd.ratcV2.long.controlPositionSet:
			case cmd.ratcV2.long.changeGroupControlAdd:
			case cmd.ratcV2.long.changeGroupControlRemove:
			case cmd.ratcV2.long.changeGroupGet:
			case cmd.ratcV2.long.changeGroupClear:
			case cmd.ratcV2.long.changeGroupSchedule:
				this.log('info', `Recieved: ${reply}`)
				break
			default:
				this.log('warn', `Unexpected response recieved: ${reply}`)
		}
	},
}
