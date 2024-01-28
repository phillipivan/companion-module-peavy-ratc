const { Regex } = require('@companion-module/base')

module.exports = {
	async configUpdated(config) {
		//let oldConfig = this.config
		this.config = config
		this.varList = []
		this.controlAliases = {}
		this.initTCP()
		this.initVariables()
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	},
	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Host',
				width: 12,
				regex: Regex.HOSTNAME,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 6,
				regex: Regex.PORT,
				default: 1632,
				tooltip: 'Port is not configurable on unit, only change in advanced configurations',
			},
			{
				type: 'checkbox',
				id: 'v2',
				label: 'Use V2',
				default: true,
				tooltip: 'Turn off to use RATCv1',
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 6,
				default: 'defaultuser',
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				default: 'password',
			},
		]
	},
}
