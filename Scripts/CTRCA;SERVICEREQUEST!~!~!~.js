if (appMatch('ServiceRequest/Property Maintenance Issue/High Weeds - Grass/NA') ) {

logDebug("Start Routing Service Request");
eval(getScriptText("UTIL_AUTO_ROUTE_RECORD"));
logDebug("End Routing Service Request");

}