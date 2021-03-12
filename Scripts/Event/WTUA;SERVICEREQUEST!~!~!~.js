if(wfStatus == "Create Enforcement Case") {
        logDebug("Start Routing Service Request");
	eval(getScriptText("UTIL_AUTO_ROUTE_RECORD"));
        logDebug("End Routing Service Request");
}