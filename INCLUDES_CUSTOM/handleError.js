function handleError(err, context) {
	var rollBack = true;
	var showError = true;

	//NOTE: This line is just here so handleError doesn't depend on your config choice to put AgencyMonitor on its own or in INCLUDES_CUSTOM.
	var aMon = new AgencyMonitor();


	if (showError) showDebug = true;
	logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);

	if (aMon) {  
		//for error slack
		if (lookup("EventExceptionLog", "ErrorChannel")) {
			aMon.error(err, context, capId);
		}
	}
}
