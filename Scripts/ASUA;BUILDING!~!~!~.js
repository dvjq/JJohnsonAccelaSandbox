if (isDPRRecord(appTypeString)) {
	if (matches(appStatus, "Void", "Withdrawn")) {

		eval(getScriptText("INCLUDES_DPR_LIBRARY"));
		if (Dpr.dprProjectExists()) {
			Dpr.deleteProjectFromAllGroups();
			Dpr.updateProjectStatus("closed");
			logDebug("DPR: Project closed.");  				
		}	
	}
}