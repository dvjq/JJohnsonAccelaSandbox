if (isDPRRecord(appTypeString)) {
	eval(getScriptText("INCLUDES_DPR_LIBRARY"));
	if (Dpr.dprProjectExists()) { 		
		var dprProjectObj = {};
		dprProjectObj.name = new String(capName);
		dprProjectObj.number = new String(capIDString);
		Dpr.updateProject(dprProjectObj);
	}
}