import { resp, cmd, alert, aliasSep, paramSep, rawAliasIdent } from './consts.js'
import { InstanceStatus } from '@companion-module/base'

/**
 * Remove illegal characters from variable Ids
 * @param {string} id variable id to sanitize
 * @param {'' | '.' | '-' | '_'} substitute Char to replace illegal characters
 * @since 1.1.4
 */

const sanitiseVariableId = (id, substitute = '_') => id.replaceAll(/[^a-zA-Z0-9-_.]/gm, substitute)

export function actionUpdate() {
	if (this.actionTimer) {
		clearTimeout(this.actionTimer)
		delete this.actionTimer
	}
	this.updateActions() // export actions
	this.updateFeedbacks() // export feedbacks
}

export function startActionUpdateTimer() {
	if (this.actionTimer) {
		clearTimeout(this.actionTimer)
		delete this.actionTimer
	}
	this.actionTimer = setTimeout(() => {
		this.actionUpdate()
	}, 10000)
}

export function stopActionUpdateTimer() {
	clearTimeout(this.actionTimer)
	delete this.actionTimer
}

export async function processCmd(chunk) {
	let reply = chunk.toString().trim()
	//this.log('debug', `response recieved: ${reply}`)
	if (chunk[0] == alert) {
		this.log('warn', `${reply}`)
		return undefined
	}
	let alias = reply.split(aliasSep)
	if (reply[0] === aliasSep) {
		if (alias[1].search(rawAliasIdent) >= 0) {
			//don't create variable definitions when in RAW mode
			this.controlAliases.push({ id: alias[1], label: alias[1] })
			if (this.actionTimer) {
				return true
			} else {
				//create 10 second timer to allow processing of raw control aliases before updating actions.
				this.startActionUpdateTimer()
				return true
			}
		}
		let newAlias = sanitiseVariableId(alias[1])
		this.controlAliases.push({ id: alias[1], label: alias[1] })
		this.varList.push(
			{ variableId: `controlAliasName_${newAlias}`, name: `Control Alias Name ${newAlias}` },
			{ variableId: `controlAliasValue_${newAlias}`, name: `Control Alias Value ${newAlias}` },
			{ variableId: `controlAliasPosition_${newAlias}`, name: `Control Alias Position ${newAlias}` },
		)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.setVariableDefinitions(this.varList)
		let aliasName = []
		aliasName[`controlAliasName_${newAlias}`] = alias[1]
		this.setVariableValues(aliasName)
		this.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias[1] + aliasSep)
		return true
	}
	let params = reply.split(paramSep)
	let aliases = reply.split(aliasSep)
	let valPos = []
	let aliasValues = []
	if (aliases.length == 3) {
		valPos = aliases[2].trim().split(paramSep)
		valPos[1] = Number(valPos[valPos.length - 1])
	}
	if (params[params.length - 1] == resp.ratcV1.username) {
		if (this.config.v2) {
			this.updateStatus(InstanceStatus.BadConfig, 'Device in RATCv1 mode')
			this.log('error', `Device in RATCv1 mode`)
			return false
		} else {
			return true
		}
	}
	switch (params[0]) {
		case resp.ratcV1.username:
			//await this.sendCommand(this.config.username) - doing this will get stuck in a loop if user/pass is incorrect.
			if (this.config.v2) {
				this.updateStatus(InstanceStatus.BadConfig, 'Device in RATCv1 mode')
				this.log('error', `Device in RATCv1 mode`)
			}
			break
		case resp.ratcV1.password:
			//await this.sendCommand(this.config.password)
			break
		case resp.ratcV1.ratcVersion:
			this.log('info', `${reply}`)
			break
		case resp.ratcV1.welcome:
			this.updateStatus(InstanceStatus.Ok, 'Logged in')
			this.log('info', `${reply}`)
			this.stopTimeOut()
			this.startCmdQueue()
			this.startKeepAlive()
			this.subscribeActions()
			this.subscribeFeedbacks()
			this.addCmdtoQueue(cmd.ratcV1.statusGet)
			this.addCmdtoQueue(cmd.ratcV1.controlList)
			return true
		case resp.ratcV1.overflow:
			this.log('error', `${reply}`)
			this.updateStatus(InstanceStatus.UnknownError, 'Overflow')
			return undefined
		case resp.ratcV1.statusIs:
			this.log('info', `${reply}`)
			break
		case resp.ratcV1.valueIs:
			this.log('info', `${reply}`)
			if (this.isRecordingActions) {
				if (this.config.v2) {
					if (!isNaN(valPos[1])) {
						this.recordAction(
							{
								actionId: 'controlPositionSet',
								options: { alias: aliases[1], value: valPos[1] },
							},
							`controlPositionSet ${aliases[1]}`,
						)
					}
				} else {
					if (!isNaN(Number(valPos[0])))
						this.recordAction(
							{
								actionId: 'controlSet',
								options: { alias: aliases[1], value: valPos[0] },
							},
							`controlSet ${aliases[1]}`,
						)
				}
			}
			aliases[1] = sanitiseVariableId(aliases[1])
			this.log('debug', `control data for alias: ${aliases[1]} value: ${valPos[0]} position: ${valPos[1]}`)
			aliasValues[`controlAliasValue_${aliases[1]}`] = valPos[0]
			if (this.config.v2) {
				aliasValues[`controlAliasPosition_${aliases[1]}`] = valPos[1]
			}
			this.setVariableValues(aliasValues)
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
			this.log('error', `${reply}`)
			this.updateStatus(InstanceStatus.UnknownError, 'Project not running')
			break
		case resp.ratcV1.badCommand:
			this.log('warn', `${reply}`)
			break
		case resp.ratcV1.loginFailed:
			this.log('error', 'Username / Password is incorrect')
			this.updateStatus(InstanceStatus.AuthenticationFailure, 'Username / Password is incorrect')
			this.stopCmdQueue()
			this.stopKeepAlive()
			this.startTimeOut()
			break
		case resp.ratcV1.startControlGroupList:
			this.log('debug', `${reply}`)
			this.log('debug', `params: ${params.toString()}`)
			if (params[1] == resp.ratcV1.aliasControlGroupList) {
				alias[0] = sanitiseVariableId(alias[1])
				this.controlAliases.push({ id: alias[1], label: alias[1] })
				this.varList.push(
					{ variableId: `controlAliasName_${alias[0]}`, name: `Control Alias Name ${alias[0]}` },
					{ variableId: `controlAliasValue_${alias[0]}`, name: `Control Alias Value ${alias[0]}` },
					//{ variableId: `controlAliasPosition_${alias[0]}`, name: `Control Alias Position ${alias[0]}` },
				)
				this.updateActions() // export actions
				this.updateFeedbacks() // export feedbacks
				this.setVariableDefinitions(this.varList)
				let aliasName = []
				aliasName[`controlAliasName_${alias[0]}`] = alias[1]
				this.setVariableValues(aliasName)
				this.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias[1] + aliasSep)
			}
			break
		case resp.ratcV1.endControlGroupList:
			this.log('debug', `${reply}`)
			break
		case resp.ratcV2.statusIs:
			this.log('info', `${reply}`)
			break
		case resp.ratcV2.valueIs:
			this.log('debug', `${reply}`)
			if (this.isRecordingActions) {
				if (this.config.v2) {
					if (!isNaN(valPos[1])) {
						this.recordAction(
							{
								actionId: 'controlPositionSet',
								options: { alias: aliases[1], value: valPos[1] },
							},
							`controlPositionSet ${aliases[1]}`,
						)
					}
				} else {
					if (!isNaN(Number(valPos[0])))
						this.recordAction(
							{
								actionId: 'controlSet',
								options: { alias: aliases[1], value: valPos[0] },
							},
							`controlSet ${aliases[1]}`,
						)
				}
			}
			aliases[1] = aliases[1].replace(' ', '_').replace('/', '')
			this.log('debug', `control data for alias: ${aliases[1]} value: ${valPos[0]} position: ${valPos[1]}`)
			aliasValues[`controlAliasValue_${aliases[1]}`] = valPos[0]
			aliasValues[`controlAliasPosition_${aliases[1]}`] = valPos[1]
			this.setVariableValues(aliasValues)
			break
		case resp.ratcV2.loggedIn:
			this.updateStatus(InstanceStatus.Ok, 'Logged in')
			this.log('info', 'OK: Logged In')
			this.stopTimeOut()
			this.startCmdQueue()
			this.startKeepAlive()
			this.subscribeActions()
			this.subscribeFeedbacks()
			return true
		case resp.ratcV2.keepAlive:
			this.log('debug', `${reply}`)
			break
		case resp.ratcV2.quietModeEnabled:
			this.log('warn', `${reply} - Quiet Mode Should be disabled for correct operation of this module`)
			this.updateStatus(InstanceStatus.UnknownWarning, 'Quiet Mode Enabled')
			this.addCmdtoQueue(cmd.ratcV2.quietModeDisable)
			break
		case resp.ratcV2.quietModeDisabled:
			this.log('info', `Quiet Mode Disabled: ${reply}`)
			this.updateStatus(InstanceStatus.Ok, 'Quiet Mode Disabled')
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
			this.updateStatus(InstanceStatus.UnknownError, 'Overflow')
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
			this.updateStatus(InstanceStatus.BadConfig, `${reply}`)
			await this.sendCommand(cmd.ratcV2.logIn + paramSep + this.config.username + paramSep + this.config.password)
			break
		case resp.ratcV2.loginFailed:
			this.log('error', 'Username / Password is incorrect')
			this.updateStatus(InstanceStatus.AuthenticationFailure, 'Username / Password is incorrect')
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
			if (params[0].includes(resp.ratcV1.loginFailed) || params[0].includes(resp.ratcV2.loginFailed)) {
				this.log('error', 'Username / Password is incorrect')
				this.updateStatus(InstanceStatus.AuthenticationFailure, 'Username / Password is incorrect')
				this.stopCmdQueue()
				this.stopKeepAlive()
				this.startTimeOut()
			} else {
				this.log('warn', `Unexpected response recieved: ${reply}`)
			}
	}
}
