//const { Regex } = require('@companion-module/base')
const { SOM, cmd, paramSep, aliasSep, groupSubscribeInterval } = require('./consts.js')


module.exports = function (self) {
	if (self.config.v2) {
		//RATCv2 actions
		self.setActionDefinitions({
/* 			help: {
				name: 'Help',
				description: 'Returns the RATC Help to the lpgs.',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV2.help)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			logIn: {
				name: 'Log In',
				description: 'Logs in to the DSP, should be done automatically.',
				options: [
					{
						id: 'username',
						type: 'textinput',
						label: 'Username',
						default: self.config.username,
						useVariables: true,
					},
					{
						id: 'password',
						type: 'textinput',
						label: 'Password',
						default: self.config.password,
						useVariables: true,
					},
				],
				callback: async ({options}) => {
					let user = await self.parseVariablesInString(options.username)
					let pass = await self.parseVariablesInString(options.password)
					let msg = user == '' ? '' : pass == '' ? paramSep + user : paramSep + user + paramSep + pass
					self.addCmdtoQueue(SOM + cmd.ratcV2.logIn + msg)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			statusGet: {
				name: 'Status Get',
				description: 'Returns the DSP Status and project name',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV2.statusGet)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			controList: {
				name: 'Control List',
				description: 'Returns the defined control aliases',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV2.controlList)
				},
				//learn: () => {},
				//subscribe: () => {},
			}, */
			controlSet: {
				name: 'Control Set',
				description: 'Set the value of a control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must return a number, up to 3 decimal places.'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let val = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val)) {
						self.log('warn', `an invalid value has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + val.toFixed(3))
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			controlSetInc: {
				name: 'Control Set - Increment',
				description: 'Increment the value of a control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must return a postive number, up to 3 decimal places.'
					},
					{
						id: 'pos',
						type: 'dropdown',
						label: '+/-',
						default: '++',
						choices: [
							{ id: '++', label: 'Positive' },
							{ id: '--', label: 'Negative' },
						],
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let val = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val) || val <= 0) {
						self.log('warn', `an invalid value has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + options.pos + val.toFixed(3))
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			controlSetString: {
				name: 'Control Set String',
				description: 'Set the value of a string control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'string',
						type: 'textinput',
						label: 'String',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must not contain "'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let string = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (string.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid string has been passed: ${string}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + aliasSep + string + aliasSep)
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			controlPositionSet: {
				name: 'Control Position Set',
				description: 'Set the control position',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Position',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must return a number between 0 and 1, up to 3 decimal places.'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let val = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val) || val < 0 || val > 1) {
						self.log('warn', `an invalid position has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlPositionSet + paramSep + aliasSep + alias + aliasSep + paramSep + val.toFixed(3))
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			changeGroupControlAdd: {
				name: 'Change Group Control Add',
				description: 'Add a control to a change group',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'changeGroup',
						type: 'textinput',
						label: 'Change Group',
						default: '',
						useVariables: true,
						tooltip: 'Variable must not contain "'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let group = await self.parseVariablesInString(options.changeGroup)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep
					if (group !== '') {
						cmdTx += group + aliasSep + paramSep + aliasSep
					}
					self.addCmdtoQueue( cmdTx + alias + aliasSep)
				},
				subscribe: async (action) => {
					let group = await self.parseVariablesInString(action.options.changeGroup)
					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupGet
					let cmdTx2 = cmd.ratcV2.changeGroupSchedule
					if (group !== '') {
						cmdTx += paramSep + aliasSep + group + aliasSep
						cmdTx2 += paramSep + aliasSep + group + aliasSep
					}
					self.addCmdtoQueue(cmdTx)
					//subscribe to periodic changes from group
					self.addCmdtoQueue(cmdTx2 + paramSep + groupSubscribeInterval)
				},
			},
			changeGroupControlRemove: {
				name: 'Change Group Control Remove',
				description: 'Remove a control to a change group',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'changeGroup',
						type: 'textinput',
						label: 'Change Group',
						default: '',
						useVariables: true,
						tooltip: 'Variable must not contain "'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let group = await self.parseVariablesInString(options.changeGroup)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupControlRemove + paramSep + aliasSep + alias + aliasSep
					if (group !== '') {
						cmdTx += group + aliasSep + paramSep + aliasSep
					}
					self.addCmdtoQueue( cmdTx )
				},
				subscribe: async (action) => {
					let group = await self.parseVariablesInString(action.options.changeGroup)
					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupGet
					if (group !== '') {
						cmdTx += paramSep + aliasSep + group + aliasSep
					}
					self.addCmdtoQueue(cmdTx)
				},
			},
			changeGroupClear: {
				name: 'Change Group Clear',
				description: 'To destroy a change group',
				options: [
					{
						id: 'changeGroup',
						type: 'textinput',
						label: 'Change Group',
						default: '',
						useVariables: true,
						tooltip: 'Variable must not contain "'
					},

				],
				callback: async ({ options }) => {
					let group = await self.parseVariablesInString(options.changeGroup)

					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupClear
					if (group !== '') {
						cmdTx += paramSep + aliasSep + group + aliasSep
					}
					self.addCmdtoQueue( cmdTx )
				},
				subscribe: async (action) => {
					let group = await self.parseVariablesInString(action.options.changeGroup)
					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupGet
					if (group !== '') {
						cmdTx += paramSep + aliasSep + group + aliasSep
					}
					self.addCmdtoQueue(cmdTx)
				},
			},
		})
	} else {
		//RATCv1 Actions
		self.setActionDefinitions({
			/* help: {
				name: 'Help',
				description: 'Returns the RATC Help to the lpgs.',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV1.help)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			statusGet: {
				name: 'Status Get',
				description: 'Returns the DSP Status and project name',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV1.statusGet)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			controList: {
				name: 'Control List',
				description: 'Returns the defined control aliases',
				options: [],
				callback: () => {
					self.addCmdtoQueue(SOM + cmd.ratcV1.controlList)
				},
				//learn: () => {},
				//subscribe: () => {},
			}, */
			controlSet: {
				name: 'Control Set',
				description: 'Set the value of a control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must return a number, up to 3 decimal places.'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let val = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val)) {
						self.log('warn', `an invalid value has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + val.toFixed(3))
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			controlSetString: {
				name: 'Control Set String',
				description: 'Set the value of a string control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
					{
						id: 'string',
						type: 'textinput',
						label: 'String',
						default: 1,
						useVariables: true,
						tooltip: 'Variable must not contain "'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					let string = Number(await self.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (string.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid string has been passed: ${string}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + aliasSep + string + aliasSep)
				},
				subscribe: async (action) => {
					let alias = await self.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
			},
			changeGroupControlAdd: {
				name: 'Change Group Control Add',
				description: 'Add a control to a change group',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},

				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue( cmd.ratcV1.changeGroupAddControl + paramSep + aliasSep + alias + aliasSep)
				},
				subscribe: () => {
					self.addCmdtoQueue(cmd.ratcV1.changeGroupGet)
				},
			},
			changeGroupControlRemove: {
				name: 'Change Group Control Remove',
				description: 'Remove a control to a change group',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: true,
						allowCustom: true,
						tooltip: 'Alias must not contain "'
					},
				],
				callback: async ({ options }) => {
					let alias = await self.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue( cmd.ratcV1.changeGroupRemoveControl + paramSep + aliasSep + alias + aliasSep )
				},
				subscribe: () => {
					self.addCmdtoQueue(cmd.ratcV1.changeGroupGet)
				},
			},
			changeGroupClear: {
				name: 'Change Group Clear',
				description: 'The Change Group is cleared of all Control Aliases',
				options: [
				],
				callback: () => {
					self.addCmdtoQueue(cmd.ratcV1.changeGroupClear)
				},
				subscribe: () => {
					self.addCmdtoQueue(cmd.ratcV1.changeGroupGet)
				},
			},
		})
	}

}
