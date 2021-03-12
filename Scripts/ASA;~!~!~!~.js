//doConfigurableScriptActions();
//showMessage = true; 
//showDebug = true;

if(appMatch('Planning/Site Plan/Major/NA')) {
	addFee("ENF-20", "ENF_GENERAL", "FINAL", 1, "Y");
}

if(appMatch('Enforcement/Incident/Abatement/Noise Nuisance')) {
	addFee("ENF-30", "ENF_GENERAL", "FINAL", 1, "Y");
}

if(appMatch('PublicWorks/Fire Hydrant/Contractor Use/Permit')) {
	addFee("PWHYD08", "PW_HYD_USE", "FINAL", AInfo["Total Days of Use"] , "Y");
}