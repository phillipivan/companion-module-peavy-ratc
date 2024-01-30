## Peavy RATC Control Protocol

This module is for control of Peavy NION DSPs. The RATC v1, v2, and v2 RAW modes are supported. All testing performed against Nion's running firmware 2.0. The selected protocol must match what your DSP is configured to use. RATC v2 is a more powerful protocol offering relative (incremental) changes, multiple change groups, and a keep alive. It should be used preferentially unless RATC v1 is required for compatibility reasons.

This module may also work with older Media Matrix units in RATCv1 mode, but this is untested.

### Configuration

**Host** 

Enter the hostname or IP address of the DSP

**Port**

This should remain 1632 unless you are using port forwarding.

**Username / Password**

The RATC protocol specifics that a login must be performed after connection before control is allowed. This is transmitted in plain text.


**Use V2**

Disable to use RATC v1 commands.

### Actions

Most actions require refernce to a control alias. The module will auto query and build a drop down list of the control aliases upon connection. You may enter a custom alias if working offline. Refer to Peavy's External Control User Guide for further details.

All control aliases in use are added to the default change group so they can be polled periodically.

### Variables

The detected control aliases, their values & positions are returned as variables. Control aliases containing white space ' ' will be replaced with '_'.

Variables are not defined when in RATC v2 RAW mode to preseve system resources. They can still be referenced if you follow the pattern of $(yourModuleName:controlAliasValue_rawAlias) or  $(yourModuleName:controlAliasPosition_rawAlias). However the '/' have been removed so '//devices/55/controls/control_1' becomes 'devices55controlscontrol_1'
They will not have a value assigned until used by an action.

## Version History

### Version 1.0.0
- Initial release