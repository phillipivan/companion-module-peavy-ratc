import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import UpgradeScripts from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'
import * as config from './config.js'
import * as tcp from './tcp.js'
import * as processCmd from './processcmd.js'

class PEAVY_RATC extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, { ...config, ...tcp, ...processCmd })
		this.instanceOptions.disableVariableValidation = true
		this.cmdQueue = []
		this.varList = []
		this.controlAliases = []
	}
	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.config = config
		this.initVariables()
		this.startTimeOut()
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updateVariableValues()
		this.initTCP()
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', `destroy. ID: ${this.id}`)
		this.stopKeepAlive()
		this.stopCmdQueue()
		this.stopTimeOut()
		this.stopActionUpdateTimer()
		if (this.socket) {
			this.socket.destroy()
		}
		this.updateStatus(InstanceStatus.Disconnected)
	}

	updateVariableValues() {
		let varList = []
		this.setVariableValues(varList)
	}

	initVariables() {}

	// Track whether actions are being recorded
	handleStartStopRecordActions(isRecording) {
		this.isRecordingActions = isRecording
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(PEAVY_RATC, UpgradeScripts)
