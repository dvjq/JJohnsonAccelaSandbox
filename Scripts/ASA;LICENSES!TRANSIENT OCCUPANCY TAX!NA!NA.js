//PRJAUT-2017-00204 US #27 (Yazan Barghouth)
//Event: ASA;LICENSES!TRANSIENT OCCUPANCY TAX!NA!NA
try {
	var parents = getParents("Licenses/Business/License/NA");
	for (p in parents) {
		var tmpPrntCapId = parents[p];
		var b1ExpModel = aa.expiration.getLicensesByCapID(tmpPrntCapId);
		if (b1ExpModel.getSuccess()) {
			b1ExpModel = b1ExpModel.getOutput();
			if (b1ExpModel.getExpStatus() == "Expired" || b1ExpModel.getExpStatus() == "Delinquent") {
				addStdCondition("Transient Occupancy Tax", "Business License Expired");
				break;//adding the condition at least once
			}
		} else {
			logDebug("**WARN getLicensesByCapID in script ASA:" + appTypeString + " Err:" + b1ExpModel.getErrorMessage());
		}
	}//parent loop
} catch (ex) {
	logDebug("**WARN in script ASA:" + appTypeString + " ex:" + ex);
}