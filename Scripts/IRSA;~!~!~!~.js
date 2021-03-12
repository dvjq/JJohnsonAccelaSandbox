// fix v360 event
    // fix for v360 IRSA master script
    servProvCode = capId.getServiceProviderCode();
	capIDString = capId.getCustomID();
	cap = aa.cap.getCap(capId).getOutput();
	appTypeResult = cap.getCapType();
	appTypeAlias = appTypeResult.getAlias();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");


// time account review sets
logDebug("Processing Time Accounting");
assignTimeReviewSets(capId);

if (appMatch('PublicWorks/Fire Hydrant/Contractor Use/Permit') && inspType == 'Pumping Procedure' && inspResult == 'Failed') {
     addFee("PWHYD09", "PW_HYD_USE", "FINAL", 1, "Y");
}

if (appMatch('PublicWorks/Fire Hydrant/Contractor Use/Permit') && inspType == 'Final Inspection' && inspResult == 'Failed') {
     addFee("PWHYD09", "PW_HYD_USE", "FINAL", 1, "Y");
}