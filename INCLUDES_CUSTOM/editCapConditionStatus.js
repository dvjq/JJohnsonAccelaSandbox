function editCapConditionStatus(pType, pDesc, pStatus, pStatusType) {
	// updates a condition with the pType and pDesc
	// to pStatus and pStatusType, returns true if updates, false if not
	// will not update if status is already pStatus && pStatusType
	// all parameters are required except for pType
	var updated;
	var iCapId = arguments[4] ? arguments[4] : capId;

	if (pType == null) {
		var condResult = aa.capCondition.getCapConditions(iCapId);
	} else {
		var condResult = aa.capCondition.getCapConditions(iCapId, pType);
	}

	if (condResult.getSuccess()) {
		var capConds = condResult.getOutput();
	} else {
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return false;
	}

	for (var cc in capConds) {
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cStatusType = thisCond.getConditionStatusType();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		logDebug(cStatus + ": " + cStatusType);

		if (cDesc.toUpperCase() == pDesc.toUpperCase()) {
			if (!pStatus.toUpperCase().equals(cStatus.toUpperCase())) {
				thisCond.setConditionStatus(pStatus);
				thisCond.setConditionStatusType(pStatusType);
				thisCond.setImpactCode("");
				aa.capCondition.editCapCondition(thisCond);
				updated = true; // condition has been found and updated
				logDebug("INFO: condition "+cDesc+" found and updated to "+pStatus);
			} else {
				logDebug("ERROR: condition found but already in the status of pStatus and pStatusType");
			}
		}
	}

	return updated;
}
