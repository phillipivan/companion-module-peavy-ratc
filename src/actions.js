import { cmd, paramSep, aliasSep } from './consts.js'

export default function (self) {
	if (self.config.v2) {
		//RATCv2 actions
		self.setActionDefinitions({
			statusGet: {
				name: 'Status Get',
				description: 'Returns the DSP Status and project name',
				options: [],
				callback: () => {
					self.addCmdtoQueue(cmd.ratcV2.statusGet)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			controlGet: {
				name: 'Control Get',
				description: 'Get the value of a control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
				},
			},
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must return a number, up to 3 decimal places.',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let val = Number(await context.parseVariablesInString(options.value))
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
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must return a postive number, up to 3 decimal places.',
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
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let val = Number(await context.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val) || val <= 0) {
						self.log('warn', `an invalid value has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(
						cmd.ratcV2.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + options.pos + val.toFixed(3),
					)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'string',
						type: 'textinput',
						label: 'String',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let string = Number(await context.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (string.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid string has been passed: ${string}`)
						return undefined
					}
					self.addCmdtoQueue(
						cmd.ratcV2.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + aliasSep + string + aliasSep,
					)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Position',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must return a number between 0 and 1, up to 3 decimal places.',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let val = Number(await context.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val) || val < 0 || val > 1) {
						self.log('warn', `an invalid position has been passed: ${val}`)
						return undefined
					}
					self.addCmdtoQueue(
						cmd.ratcV2.controlPositionSet + paramSep + aliasSep + alias + aliasSep + paramSep + val.toFixed(3),
					)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
				},
			},
			controlPositionInvert: {
				name: 'Control Position Invert',
				description: 'Position will be set to 1 - value.',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Position',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must return a number between 0 and 1, up to 3 decimal places.',
					},
					{
						id: 'info',
						type: 'static-text',
						label: 'Explanation',
						tooltip:
							'Position will be set to 1 - Position. Enter the position variable of a button control to achieve a toggle action',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let val = Number(await context.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (isNaN(val) || val < 0 || val > 1) {
						self.log('warn', `an invalid position has been passed: ${val}`)
						return undefined
					}
					val = 1 - val
					self.addCmdtoQueue(
						cmd.ratcV2.controlPositionSet + paramSep + aliasSep + alias + aliasSep + paramSep + val.toFixed(3),
					)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV2.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV2.changeGroupControlAdd + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'changeGroup',
						type: 'textinput',
						label: 'Change Group',
						default: '',
						useVariables: { local: true },
						tooltip: 'Variable must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let group = await context.parseVariablesInString(options.changeGroup)
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
					self.addCmdtoQueue(cmdTx + alias + aliasSep)
				},
				subscribe: async (action, context) => {
					let group = await context.parseVariablesInString(action.options.changeGroup)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'changeGroup',
						type: 'textinput',
						label: 'Change Group',
						default: '',
						useVariables: { local: true },
						tooltip: 'Variable must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let group = await context.parseVariablesInString(options.changeGroup)
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
					self.addCmdtoQueue(cmdTx)
				},
				subscribe: async (action, context) => {
					let group = await context.parseVariablesInString(action.options.changeGroup)
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
						useVariables: { local: true },
						tooltip: 'Variable must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let group = await context.parseVariablesInString(options.changeGroup)

					if (group.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid group has been passed: ${group}`)
						return undefined
					}
					let cmdTx = cmd.ratcV2.changeGroupClear
					if (group !== '') {
						cmdTx += paramSep + aliasSep + group + aliasSep
					}
					self.addCmdtoQueue(cmdTx)
				},
				subscribe: async (action, context) => {
					let group = await context.parseVariablesInString(action.options.changeGroup)
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
			statusGet: {
				name: 'Status Get',
				description: 'Returns the DSP Status and project name',
				options: [],
				callback: () => {
					self.addCmdtoQueue(cmd.ratcV1.statusGet)
				},
				//learn: () => {},
				//subscribe: () => {},
			},
			controlGet: {
				name: 'Control Get',
				description: 'Get the value of a control',
				options: [
					{
						id: 'alias',
						type: 'dropdown',
						label: 'Control Alias',
						default: '',
						choices: self.controlAliases,
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV1.changeGroupAddControl + paramSep + aliasSep + alias + aliasSep)
				},
			},
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'value',
						type: 'textinput',
						label: 'Value',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must return a number, up to 3 decimal places.',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let val = Number(await context.parseVariablesInString(options.value))
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
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV1.changeGroupAddControl + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
					{
						id: 'string',
						type: 'textinput',
						label: 'String',
						default: 1,
						useVariables: { local: true },
						tooltip: 'Variable must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					let string = Number(await context.parseVariablesInString(options.value))
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					if (string.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid string has been passed: ${string}`)
						return undefined
					}
					self.addCmdtoQueue(
						cmd.ratcV1.controlSet + paramSep + aliasSep + alias + aliasSep + paramSep + aliasSep + string + aliasSep,
					)
				},
				subscribe: async (action, context) => {
					let alias = await context.parseVariablesInString(action.options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.controlGet + paramSep + aliasSep + alias + aliasSep)
					self.addCmdtoQueue(cmd.ratcV1.changeGroupAddControl + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.changeGroupAddControl + paramSep + aliasSep + alias + aliasSep)
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
						useVariables: { local: true },
						allowCustom: true,
						minChoicesForSearch: 20,
						tooltip: 'Alias must not contain "',
					},
				],
				callback: async ({ options }, context) => {
					let alias = await context.parseVariablesInString(options.alias)
					if (alias.indexOf(aliasSep) !== -1) {
						self.log('warn', `an invalid alias has been passed: ${alias}`)
						return undefined
					}
					self.addCmdtoQueue(cmd.ratcV1.changeGroupRemoveControl + paramSep + aliasSep + alias + aliasSep)
				},
				subscribe: () => {
					self.addCmdtoQueue(cmd.ratcV1.changeGroupGet)
				},
			},
			changeGroupClear: {
				name: 'Change Group Clear',
				description: 'The Change Group is cleared of all Control Aliases',
				options: [],
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
