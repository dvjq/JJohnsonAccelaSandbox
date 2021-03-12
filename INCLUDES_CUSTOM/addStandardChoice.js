function addStandardChoice(stdChoice, stdValue, stdDesc) {
	//check if stdChoice and stdValue already exist; if they do, don't add
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);
	if (bizDomScriptResult.getSuccess()) {
		logDebug("Standard Choices Item " + stdChoice + " and Value " + stdValue + " already exist.  Lookup is not added or updated.");
		return false;
	}
	//Proceed to add
	var strControl;
	if (stdChoice != null && stdChoice.length && stdValue != null && stdValue.length && stdDesc != null && stdDesc.length) {
		var rbdm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.systemConfig.RBizDomainModel", args).getOutput();
        var bdBus = aa.proxyInvoker.newInstance("com.accela.aa.aamain.systemConfig.BizDomainBusiness").getOutput();
        rbdm.setServiceProviderCode(aa.getServiceProviderCode());
        rbdm.setBizDomain(stdChoice);
        rbdm.setDescription("");
        rbdm.setType("SystemSwitch");
        rbdm.setAuditDate(new Date());
        rbdm.setAuditID("ADMIN");
        rbdm.setAuditStatus("A");
        try {
            bdBus.createRBizDomain(rbdm);
        } catch (err) {
            logDebug("Error creating biz: " + stdChoice + ":" + stdValue)
        }
        var z = aa.bizDomain.createBizDomain(stdChoice, stdValue, "A", stdDesc);
        if(z.getSuccess()){
            logDebug("Successfully created Standard Choice (" + stdChoice + " , " + stdValue + ") = " + stdDesc + " - status = " + z.getSuccess());
        }
        else{
            logDebug("Unable to created Standard Choice (" + stdChoice + " , " + stdValue + ") = " + stdDesc + " - status = " + z.getSuccess());
        }
    }
}