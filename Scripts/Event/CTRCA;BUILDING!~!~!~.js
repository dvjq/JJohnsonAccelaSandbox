if (isDPRRecord(appTypeString)) {
	updateTask("Application Intake", "Awaiting Plans", "", "");	

	eval(getScriptText("INCLUDES_DPR_LIBRARY"));
	Dpr.createProjectPlusSubmittal();
}

if (appMatch('Building/Residential/Roofing/NA')) {
	closeTask("Application Intake", "Accepted - Plan Review Not Req", "", "");
	closeTask("Permit Issuance", "Issued", "", "");
        closeTask("Inspection", "Final Inspection Complete", "", "");
        updateAppStatus("Issued", "");
}