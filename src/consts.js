export const msgDelay = 50 // Always leave at least 50 ms open between commands
export const keepAliveValue = '60'
export const keepAliveInterval = 30000
export const timeOutInterval = 15000
export const groupSubscribeInterval = '5'
export const SOM = ''
export const EOM = '\r\n'
export const paramSep = ' '
export const aliasSep = '"'
export const alert = 0x07
export const EndSession = 'exit'
export const unknown = 'unknown'
export const cmd = {
	ratcV1: {
		help: 'help',
		statusGet: 'statusGet',
		controlGet: 'controlGet',
		controlSet: 'controSet',
		controlList: 'controlList',
		changeGroupAddControl: 'changeGroupAddControl',
		changeGroupRemoveControl: 'changeGroupRemoveControl',
		changeGroupClear: 'changeGroupClear',
		changeGroupGet: 'changeGroupGet',
	},
	ratcV2: {
		help: 'h', //display help list
		logIn: 'li', //logIn name password : log in with a password
		statusGet: 'sg',//statusGet : report status
		keepAlive: 'ka',//keepAlive seconds : disconnect if no activity in n seconds
		quietModeEnable: 'qme',//quietModeEnable : suppress responses from non-query commands
		quietModeDisable: 'qmd',//quietModeDisable : allow responses from all commands
		controlList: 'cl',//controlList : get the list of available Controls
		controlGet: 'cg',//controlGet control : get a Controls value
		controlSet: 'cs',//controlSet control value : set a Controls value
		controlPositionSet: 'cps',//controlPositionSet control value : set a Controls position
		changeGroupControlAdd: 'cgca',//changeGroupControlAdd [group] control : add a Control to a Change Group
		changeGroupControlRemove: 'cgcr',//changeGroupControlRemove [group] control : remove a Control from a Change Group
		changeGroupGet: 'cgg',//changeGroupGet [group] : get changed values from a Change Group
		changeGroupClear: 'cgc',//changeGroupClear [group] : clear a Change Group (of changed values)
		changeGroupSchedule: 'cgs',//changeGroupSchedule [group] seconds : schedule recurring Change Group gets
	},
}

export const resp = {
	ratcV1: {
		overflow: 'Overflow',
		statusIs: 'statusIs',
		valueIs: 'valueIs',
		badArgumentCount: 'BadArgumentCount',
		unlistedGroup: 'UnlistedGroup',
		addedToChangeGroup: 'addedToChangeGroup',
		removedFromChangeGroup: 'removedFromChangeGroup',
		invalidChangeGroup: 'InvalidChangeGroup',
		clearedChangeGroup: 'clearedChangeGroup',
		numberOfChanges: 'numberOfChanges',
		notRunning: 'NotRunning',
		badCommand: 'BadCommand',
		username: 'Name:',
		password: 'Password:',
		loginFailed: 'LoginFailed',
		ratcVersion: 'RATCVersion',
		welcome: 'Welcome',
		startControlGroupList: '{',
		endControlGroupList: '}',
	},
	ratcV2: {
		statusIs: 'statusIs',
		valueIs:'valueIs',
		loggedIn: 'loggedIn',
		keepAlive: 'keepAlive',
		quietModeEnabled: 'quietModeEnabled',
		quietModeDisabled: 'quietModeDisabled',
		changeGroupControlAdded: 'changeGroupControlAdded',
		changeGroupControlRemoved: 'changeGroupControlRemoved',
		changeGroupCleared: 'changeGroupCleared',
		changeGroupChanges: 'changeGroupChanges',
		changeGroupSchedule: 'changeGroupSchedule',
		badCommand: 'badCommand',
		badArgumentCount: 'badArgumentCount',
		overflow: 'overflow',
		unlistedControl: 'unlistedControl',
		invalidChangeGroup: 'invalidChangeGroup',
		commandFailed: 'commandFailed',
		commandUnsupported: 'commandUnsupported',
		notLoggedIn: 'notLoggedIn',
		loginFailed: 'loginFailed',
	},

}
