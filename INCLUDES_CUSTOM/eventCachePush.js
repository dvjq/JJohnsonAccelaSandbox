function eventCachePush(stdValue, stdDesc) {
	var emseCache = aa.bizDomain.getBizDomainByValue("EMSE_EVENT_CACHE", stdValue);

	if (emseCache.getSuccess()) {
		logDebug("Standard Choices Item " + "EMSE_EVENT_CACHE" + " and Value " + stdValue + " already exist.  Lookup is not added or updated.");
		emseCache = emseCache.getOutput();

		emseCache = emseCache.getBizDomain();
		emseCache.setDescription(stdDesc);
		var editResult = aa.bizDomain.editBizDomain(emseCache);
		if (editResult.getSuccess()) {
			logDebug("Successfully removed val from cache(" + stdValue + ")");
			return true;
		} else {
			logDebug("**ERROR editing Std Choice " + editResult.getErrorMessage());
		}
		
	} else {
		if (stdValue != null && stdValue.length && stdDesc != null && stdDesc.length) {
			var createdCache = aa.bizDomain.createBizDomain("EMSE_EVENT_CACHE", stdValue, "A", stdDesc);
			if (createdCache.getSuccess()) {
				createdCache = createdCache.getOutput();

				return true;
			} else {
				logDebug("**ERROR creating event cache " + createdCache.getErrorMessage());
			}
		} else {
			logDebug("Could not create event cache, one or more null values");
		}
	}
	return false;
}
