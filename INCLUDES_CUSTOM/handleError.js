function handleError(err, context) {
	var rollBack = true;
	var showError = true;

	//TODO: Cut this line if you put your AgencyMonitor in INCLUDES_CUSTOM
	eval(getScriptText("AgencyMonitor"));
	//NOTE: This line is just here so handleError doesn't depend on your config choice to put AgencyMonitor on its own or in INCLUDES_CUSTOM.
	var aMon = new AgencyMonitor();


	if (showError) showDebug = true;
	logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);

	if (aMon) {  
		//TODO: Select only either the slack or email section below unless you want to use both. 
		//for error slack
		if (lookup("EventExceptionLog", "ErrorChannel")) {
			aMon.error(err, context, capId);
		}

		//for error email
		if (lookup("EventExceptionLog", "sendTo")) {
			aMon.errorEmail(capId, err, context);
		}
	}
}
