//showMessage = true; 
//showDebug = true;
// *** BEGIN TIME ACCOUNTING SOLUTION ***
// time account review sets
assignTimeReviewSets(capId);

// time accounting billing
if (wfTask == "Time Entry Review" && wfStatus == "Approved") {
        assessTimeAccountingFees(capId);
}
// *** END TIME ACCOUNTING SOLUTION ***

if (appMatch('PublicWorks/Fire Hydrant/Contractor Use/Permit') && wfTask == "Permit Issuance" && wfStatus == "Issued") {
     scheduleInspection("Pumping Procedure", 3);
     scheduleInspectDate("Final Inspection", AInfo["Date To Be Used To"])
}

if (appMatch('Cannabis/Hemp/Cultivation/Application') && wfTask == "Appeal" && wfStatus == "Denied") {
     deactivateTask("Background Check")
}

if (appMatch('Cannabis/Entity/Prequalification/Application')) {
     logDebug("TEST");
     logDebug(loadASITable(MJLICENSURETYPE));
     logDebug(getASITable(MJLICENSURETYPE));
}