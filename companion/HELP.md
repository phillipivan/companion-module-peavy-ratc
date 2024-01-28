## Peavy RATC Control Protocol

This module is for control of NION DSPs. The RATC v1, v2, and v2 RAW modes are supported. All testing performed against Nion's running firmware 2.0.

This module may also work with older Media Matrix units in RATCv1 mode, but this is untested.

### Configuration

**Host** 

Enter the hostname or IP address of the DSP

**Port**

This should remain 1632 unless you are using port forwarding.

**Username / Password**

The RATC protocol specifics that a login must be performed after connection before control is allowed. This is transmitted in plain text.


**Use V2**

Disable to use RATCv1 commands.

### Actions

Most actions require refernce to a control alias. The module will auto query and build a drop down list of the control aliases upon connection. You may enter a custom alias if working offline. Refer to Peavy's External Control User Guide for further details.

### Variables

The detected control aliases and their values are returned as variables. 

## Version History

### Version 1.0.0
- Initial release