function isAppSpecificOnCap(itemName) // optional: itemCap
{
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
			return false
		}


		var itemGroup = itemName.substr(0, itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".") + 1);
	}

	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess()) {
		var appspecObj = appSpecInfoResult.getOutput();

		if (itemName != "") {
			for (var i in appspecObj)
				if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
					return appspecObj[i].getCheckboxDesc();
				}
		}
	} else {
		logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
	}

	return null;
}