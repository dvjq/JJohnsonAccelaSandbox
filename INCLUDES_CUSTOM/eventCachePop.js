function eventCachePop(stdValue) {
	var val = false;
	var emseCache = aa.bizDomain.getBizDomainByValue("EMSE_EVENT_CACHE", stdValue);

	if (emseCache.getSuccess()) {
		emseCache = emseCache.getOutput();
		val = emseCache.getDescription();
		logDebug("EMSE_EVENT_CACHE(" + stdValue + ") = " + val);

		emseCache = emseCache.getBizDomain();
		emseCache.setDescription(null);
		var editResult = aa.bizDomain.editBizDomain(emseCache);
		if (editResult.getSuccess()) {
			logDebug("Successfully removed val from cache(" + stdValue + ")");
		} else {
			logDebug("**ERROR editing Std Choice " + editResult.getErrorMessage());
		}

		return val;
	} else {
		logDebug("EMSE_EVENT_CACHE(" + stdValue + ") does not exist");
		return val;
	}
}
