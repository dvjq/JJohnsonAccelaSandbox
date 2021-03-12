/*===========================================
* Script Name: ATID
=========================================== */
//ATID
//AccelaGIS (MapServer) > ATID | either In or Out and update Yes or No
try {
if(!publicUser){
	if (typeof(AInfo["ATID"])!="undefined") {
		if (proximity("ANAHEIM","ATID",-2,"feet")) {
			editAppSpecific("ATID", "Yes");
			// logDebug("ATID Assessment Area: Yes");
		} else {
			editAppSpecific("ATID", "No");
			// logDebug("ATID Assessment Area: No");
		}
	}
}
} catch (err) {
logDebug("A JavaScript Error occurred: CTRC;Licenses!Transient Occupancy Tax!~!~ - ATID Assessment Area" + err.message);
logDebug(err.stack);
};