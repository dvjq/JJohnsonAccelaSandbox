function adjustTaskComment(wfstr, wfcomment, wfnote) {
	// put this in your Includes Custom
	var itemCapId = capId;
	var useProcess = false;
	var processName = "";
	if (arguments.length >= 4) {
		processName = arguments[3]; // subprocess
		useProcess = true;
	}
	if (arguments.length >= 5) {
		itemCapId = arguments[4];
	}

	var workflowResult = aa.workflow.getTaskItems(
		itemCapId,
		wfstr,
		processName,
		null,
		null,
		null
	);
	if (workflowResult.getSuccess()) var wfObj = workflowResult.getOutput();
	else {
		logMessage(
			"**ERROR: Failed to get workflow object: " +
				s_capResult.getErrorMessage()
		);
		return false;
	}

	for (var i in wfObj) {
		if (
			wfObj[i]
				.getTaskDescription()
				.toUpperCase()
				.equals(wfstr.toUpperCase()) &&
			(!useProcess || wfObj[i].getProcessCode().equals(processName))
		) {
			wfObj[i].setDispositionComment(wfcomment);
			wfObj[i].setDispositionNote(wfnote);
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTask(fTaskModel);
			if (tResult.getSuccess())
				logDebug("Set Workflow: " + wfstr + " comment " + wfcomment);
			else {
				logMessage(
					"**ERROR: Failed to update comment on workflow task: " +
						tResult.getErrorMessage()
				);
				return false;
			}
		}
	}
}