/**
 * INT_BLUEBEAM_INITSESSION
 * @requires INCLUDES_BLUEBEAM
 * @requires INCLUDES_RECORD
 */

eval(getScriptText("INCLUDES_BLUEBEAM", null, false));
eval(getScriptText("INCLUDES_RECORD", null, true));

// TO DO: create custom field subgroup for bluebeam and add to demo records
var thisRecord = new Record(capId.getCustomID());
var existingSession = thisRecord.getASI("BLUEBEAM","Session URL","");

// assume create session
var action = "createSession";

// if existing session URL
if(existingSession && existingSession != null && existingSession != ""){
    action = "reuseSession";
}

executeBluebeamIntegration(capId, action);