eval(getScriptText("INCLUDES_RECORD"));
eval(getScriptText("INCLUDES_NOTIFICATIONS"));

// update record status to reflect inspection result
updateAppStatus(inspResult,"Updated by inspection result automation.",capId);

var holdThisCapId = capId;

/**
* Purpose: Process ENF PM inspection result and take actions. 
*      - Create work orders for referrals
*      - Send email referrals
*      - Update the violations custom table with violation and referral information
*      - Set next referral date custom field based on soonest referral to be picked up by batch
*      - Create new site visit record, schedule/assign inspections and copy failed checklist items to new site visit
* Author: Aaron Williams
* Story ID: 
* Script Type: EMSE
*/

//eval(getScriptText("IRSA_PROCESS_ENF_VIOLATIONS",null,false));

if (inspType == 'Progress Check' && inspResult == 'Passed') {
	scheduleInspection('Progress Check', 365, 'AIRKULLA');
}

if (appMatch('Enforcement/Zoning/Case/Case') && inspType=="Follow-Up" && inspResult=="Citation") {
	addFee("C_R_ENF_10", "ENF_ZONING", "FINAL", 2, "Y");
}

eval(getScriptText("INCLUDES_CRM", null, false));

if (inspType == "New Complaint" && inspResult.indexOf('Violation')>-1) {
logDebug("Closing task.");
closeTask("Inspection","Violation Found - NOV Issued","","");
activateTask("Notice");

runWTUAForWFTaskWFStatus("Inspection", "", "Violation Found", capId, "");

}

capId=holdThisCapId;
