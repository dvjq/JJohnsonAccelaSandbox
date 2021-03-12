function setRecordVisibility_ACA(visibility){
	//pass "Y" or "N"
	var itemCap = capId;
	if(arguments.length > 1){
		itemCap = arguments[1];
	}

	var result = aa.cap.updateAccessByACA(itemCap,visibility);
	if(!result.getSuccess()){
		logDebug("ERROR: Could not properly set ACA Visibility");
	}
}