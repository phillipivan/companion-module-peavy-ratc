const { resp, cmd, alert, aliasSep, paramSep } = require('./consts.js')

module.exports = {
	async processCmd(chunk) {
		let reply = chunk.toString()
		this.log('debug', `response recieved: ${reply}`)
		if (chunk[0] == alert) {
			this.log('warn', `${reply}`)
			return undefined
		}
		if (reply[0] === aliasSep) {
			let alias = reply.split(aliasSep)
			this.controlAliases.push({ id: alias[1], label: alias[1] })
			this.varList.push(
				{ variableId: `controlAliasName_${alias[1]}`, name: `Control Alias Name ${alias[1]}` },
				{ variableId: `controlAliasValue_${alias[1]}`, name: `Control Alias Value ${alias[1]}` },
				{ variableId: `controlAliasPosition_${alias[1]}`, name: `Control Alias Position ${alias[1]}` },
			)
			this.setVariableDefinitions(this.varList)
			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			let aliasName = []
			aliasName[`controlAliasName_${alias[1]}`] = alias[1]
			this.setVariableValues(aliasName)
			this.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias[1] + aliasSep)
			return true
		}
		let params = reply.split(' ')
		switch (params[0]) {
			case resp.ratcV1.username:
				this.sendCommand(this.config.username)
				break
			case resp.ratcV1.password:
				this.sendCommand(this.config.password)
				break
			case resp.ratcV1.ratcVersion:
				this.log('info', `${reply}`)
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
				this.log('info', `${reply}`)
				break
			case resp.ratcV1.valueIs:
				break
			case resp.ratcV1.badArgumentCount:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV1.unlistedGroup:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV1.addedToChangeGroup:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV1.removedFromChangeGroup:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV1.invalidChangeGroup:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV1.clearedChangeGroup:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV1.numberOfChanges:
				this.log('info', `${reply}`)
				break
			case resp.ratcV1.notRunning:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV1.badCommand:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV1.loginFailed:
				this.log('error', 'Password is incorrect')
				this.stopCmdQueue()
				this.stopKeepAlive()
				this.startTimeOut()
				break
			case resp.ratcV1.startControlGroupList:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV1.endControlGroupList:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.statusIs:
				this.log('info', `${reply}`)
				break
			case resp.ratcV2.valueIs:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.loggedIn:
				this.updateStatus('ok', 'Logged in')
				this.log('info', 'OK: Logged In')
				this.stopTimeOut()
				this.startCmdQueue()
				this.startKeepAlive()
				return true
			case resp.ratcV2.keepAlive:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.quietModeEnabled:
				this.log('warn', `${reply} - Quiet Mode Should be disabled for correct operation of this module`)
				break
			case resp.ratcV2.quietModeDisabled:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.changeGroupControlAdded:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.changeGroupControlRemoved:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.changeGroupCleared:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.changeGroupChanges:
				this.log('debug', `${reply}`)
				break
			case resp.ratcV2.badCommand:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV2.badArgumentCount:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV2.overflow:
				this.log('error', `${reply}`)
				this.updateStatus('error', 'Overflow')
				return undefined
			case resp.ratcV2.unlistedControl:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV2.invalidChangeGroup:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV2.commandFailed:
				this.log('error', `${reply}`)
				break
			case resp.ratcV2.commandUnsupported:
				this.log('warn', `${reply}`)
				break
			case resp.ratcV2.notLoggedIn:
				this.log('error', `${reply}`)
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
