//This is a set script that will invoice fees for all billable time entries that are in the time group associated with the set

//Initialize the Environment
myCapId = null;
myUserId="ADMIN";
runEvent=false;
/* master script includes */ 
var tmpID = aa.cap.getCapID(myCapId).getOutput();
if(tmpID != null){
	aa.env.setValue("PermitId1",tmpID.getID1());
 	aa.env.setValue("PermitId2",tmpID.getID2()); 	
	aa.env.setValue("PermitId3",tmpID.getID3());
}
aa.env.setValue("CurrentUserID",myUserId); 
var preExecute = "PreExecuteForAfterEvents";
var documentOnly = false;
var SCRIPT_VERSION = 3.0;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
 	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");
 	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA));
	/* force for script test*/
	showDebug = true;
	eval(getScriptText(SAScript,SA));
}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
}	
eval(getScriptText("INCLUDES_CUSTOM"));
if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}
var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);
var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = false;
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;
if (bzr) {
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");
	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");
	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
}

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1];
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";
	}
	catch(err) {
	return "";
	}
}
logGlobals(AInfo);

// Begin MAIN
var SetMemberArray= aa.env.getValue("SetMemberArray");
var setId = aa.env.getValue("SetID");
var theSet = aa.set.getSetByPK(setId).getOutput();
var setName = theSet.getSetTitle();

for(var i=0; i < SetMemberArray.length; i++) {
	var id = SetMemberArray[i];
	capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	assessTimeAccountingFeesForBatch(capId,setName);
}

//update the set status to indicate that it was processed
theSet.setSetStatus("Inactive");
aa.set.updateSetHeader(theSet);


//#############################################################################################################
// Helper functions
//#############################################################################################################
function assessTimeAccountingFeesForBatch(capId){
	var groupName = null;
	if (arguments.length > 1)  groupName = arguments[1];
	var baseFeeArr = new Array();
	var timeFeeArr = new Array();
	var baseFeeBalance = 0; 
	var timeEntriesArr = new Array();
	var timeEnts = aa.timeAccounting.getTimeLogModelByEntity(capId, null, null, null, null).getOutput();
	var tlmlIterator = timeEnts.iterator();
	while (tlmlIterator.hasNext()) {
		var timeLogModel = tlmlIterator.next();
        var timeLogSeq = timeLogModel.getTimeLogSeq();
		// we have to get the model again using the seq because	the other function doesn't populate the object fully
		var tResult = aa.timeAccounting.getTimeLogModel(timeLogSeq);
		if (tResult.getSuccess()) {
			var timeLogModel = tResult.getOutput();
			if (timeLogModel != null) {
				var timeGroup = getTimeGroupName(timeLogModel.getTimeGroupSeq());
				if (timeGroup != groupName && groupName != null) {
					continue;
				}
				//we branch here if this is a base fee model vs normal billable time
				var timeTypeModel = timeLogModel.getTimeTypeModel();
				var timeType = "" + timeTypeModel.getDispTimeTypeName();
				try{
					var feeInfoStr = lookup("TimeTypeToFeeCode",timeType);
					var feeInfoArr = feeInfoStr.split("|");
				}
					catch(eLook){
					logDebug("Fee configuration is not valid for time type (" + timeType + ") : " + eLook);
					continue;
				}
				//normal billing
				if (feeInfoArr.length == 4)	{
					if(timeLogModel.getBillable() == "Y" && timeLogModel.getTimeLogStatus()!="L"){
						var duration = parseInt(timeLogModel.getTotalMinutes());
						try{
							
							var feeSchedule = feeInfoArr[0];
							var feeCode = feeInfoArr[1];
							var feePeriod = feeInfoArr[2];
							var rateBased = feeInfoArr[3];
							//account for case correct string
							if (rateBased == "False") rateBased = false;
							//determine fee input for rate based vs. basic
							var quantity = 0;
							if (rateBased){
								var username = timeLogModel.getTimeLogModel().getUserName();
								var entryDate = timeLogModel.getTimeLogModel().getDateLogged();
								var rate  = getRateByUser(username,entryDate);
								if (rate) {
									quantity = parseFloat(duration/60) * rate;
								}
								else{
									logDebug("Error assessing fee; user " + username + " does not have a billing rate configured");
									continue;
								}
							}
							else{
								quantity = parseFloat(duration/60);
							}
							//add the fee item, make notation of the fee ID, and lock the time entry
							logDebug("Fee Schedule:" + feeSchedule + " Fee Code:" + feeCode + " amount: " + quantity);
							var feeSeqNumber = addFee(feeCode, feeSchedule, feePeriod, quantity, "Y", capId);
							timeLogModel.setNotation("Fee " + feeSeqNumber);
							timeLogModel.setTimeLogStatus("L");
							aa.timeAccounting.updateTimeLogModel(timeLogModel);
						}
						catch(timeErr){
							logDebug("Error assessing fee for time type " + timeType);
							logDebug("    " + timeErr);
						}
					}
				}
				//base fee setup	
				else{
					logDebug("setting up base fees");
					//the script will just get the base fee codes on this loop, assessment will happen on another loop
					if(timeLogModel.getBillable() == "Y" ){
						//get base fee info for all billable time entries
						var baseStr = feeInfoArr[4];
						try{
							var bizDom = aa.bizDomain.getBizDomain(baseStr).getOutput().toArray();
							for (var x in bizDom){
								baseFeeArr[bizDom[x].getBizdomainValue()] = 0;
							}
						}
						catch(l){
							logDebug("Failed to retrieve base fee std choice " + baseStr + ": " + l);
						}
						//get the fee info for fees already assesed
						timeFeeArr[feeInfoArr[1]] = 0;
						
					}
				}
			}	
		}
	}
	//if there are any base fee items, then update balances
	var feeStatusArr = new Array();
	feeStatusArr[0] = "INVOICED".toString();
	for (var f in baseFeeArr){
		 var baseFeeAmt = feeAmountForTime(f);
		 baseFeeArr[f] = baseFeeAmt;
		 baseFeeBalance = baseFeeBalance + baseFeeAmt;
	}
	for (var f in timeFeeArr){
		 var timeFeeAmt = feeAmountForTime(f);
		 timeFeeArr[f] = timeFeeAmt;
		 baseFeeBalance = baseFeeBalance - timeFeeAmt;
	}
	logDebug("Base Fee Balance is $" + baseFeeBalance);
	//Now loop through again and assess time fee items for anything with a base fee
	tlmlIterator = timeEnts.iterator();
	while (tlmlIterator.hasNext()) {
		logDebug("assessing time for base fee items");
		var timeLogModel = tlmlIterator.next();
        var timeLogSeq = timeLogModel.getTimeLogSeq();
		// we have to get the model again using the seq because	the other function doesn't populate the object fully
		var tResult = aa.timeAccounting.getTimeLogModel(timeLogSeq);
		if (tResult.getSuccess()) {
			var timeLogModel = tResult.getOutput();
			if (timeLogModel != null) {
				var timeGroup = getTimeGroupName(timeLogModel.getTimeGroupSeq());
				if (timeGroup != groupName && groupName != null) {
					continue;
				}
				//we branch here if this is a base fee model vs normal billable time
				var timeTypeModel = timeLogModel.getTimeTypeModel();
				var timeType = "" + timeTypeModel.getDispTimeTypeName();
				try{
					var feeInfoStr = lookup("TimeTypeToFeeCode",timeType);
					var feeInfoArr = feeInfoStr.split("|");
				}
					catch(eLook){
					logDebug("Fee configuration is not valid for time type (" + timeType + ") : " + eLook);
					continue;
				}
				//base fee billing
				if (feeInfoArr.length == 5)	{
					if(timeLogModel.getBillable() == "Y" && timeLogModel.getTimeLogStatus()!="L"){
						var duration = parseInt(timeLogModel.getTotalMinutes());
						try{
							var feeSchedule = feeInfoArr[0];
							var feeCode = feeInfoArr[1];
							var feePeriod = feeInfoArr[2];
							var rateBased = feeInfoArr[3];
							//account for case correct string
							if (rateBased == "False") rateBased = false;
							//determine fee input for rate based vs. basic
							var quantity = 0;
							var feeRate = 0;
							if (rateBased){
								var username = timeLogModel.getTimeLogModel().getUserName();
								var entryDate = timeLogModel.getTimeLogModel().getDateLogged();
								var rate  = getRateByUser(username,entryDate);
								if (rate) {
									quantity = parseFloat(duration/60) * rate;
								}
								else{
									logDebug("Error assessing fee; user " + username + " does not have a billing rate configured");
									continue;
								}
							}
							else{
								quantity = parseFloat(duration/60);
							}
							//add the fee item, make notation of the fee ID, and lock the time entry
							logDebug("Fee Schedule:" + feeSchedule + " Fee Code:" + feeCode + " amount: " + quantity);
							var feeSeqNumber = addFee(feeCode, feeSchedule, feePeriod, quantity, "N", capId);
							//handle base fee logic
							if (baseFeeBalance > 0){
								var feeQ = aa.finance.getFeeItemByPK(capId,feeSeqNumber);
								if (feeQ.getSuccess()){
									//get metadata from the fee object
									var feeObj = feeQ.getOutput();
									var feeAmt = feeObj.getFee();
									logDebug("fee: " + feeAmt);
									if (feeAmt <= baseFeeBalance){
										baseFeeBalance = baseFeeBalance - feeAmt;
										aa.finance.removeFeeItem(capId, feeSeqNumber);
										feeSeqNumber = "0";
									}
									else{
										feeAmt = feeAmt - baseFeeBalance;
										feeAmt = Math.round(feeAmt*100)/100;
										baseFeeBalance = 0;
										logDebug("Editing Fee item for base fee... " + feeAmt);
										var F4feeObj = feeObj.getF4FeeItem();
										var feeRate = F4feeObj.getFormula();
										F4feeObj.setFee(feeAmt);
										var feeUnits = feeAmt/feeRate;
										feeUnits = Math.round(feeUnits*100)/100;
										F4feeObj.setFeeUnit(feeUnits);
										F4feeObj.setAutoInvoiceFlag("Y");
										aa.finance.editFeeItem(F4feeObj);
										//invoice the fee
										feeSeqList.push(feeSeqNumber);
										paymentPeriodList.push("FINAL");
										//updateFeeItemInvoiceFlag(feeSeqNumber, "Y");
									}
								}
							}
							timeLogModel.setNotation("Fee " + feeSeqNumber);
							timeLogModel.setTimeLogStatus("L");
							aa.timeAccounting.updateTimeLogModel(timeLogModel);
						}
						catch(timeErr){
							logDebug("Error assessing fee for time type " + timeType);
							logDebug("    " + timeErr);
						}
					}
				}
			}	
		}
	}
	logDebug("Base Fee Balance is $" + baseFeeBalance);
	if (feeSeqList.length)
	{
		invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
		if (invoiceResult.getSuccess()){
			logDebug("Invoicing assessed fee items is successful.");
		}
		else{
			logDebug("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
		}
	}
	feeSeqList = new Array();
	paymentPeriodList = new Array();
}


//This function will return the time group name based on the time group sequence number 
function getTimeGroupName(groupSeqNum){
	var grpMod = aa.timeAccounting.getTimeGroupTypeModel().getOutput();
	grpMod.setTimeGroupSeq(groupSeqNum);
	var grps = aa.timeAccounting.getTimeGroupTypeModels(grpMod).getOutput();
	return grps[0].getTimeGroupName();
}

// Get the hourly rate from the User time accounting profile
// username - Accela username to lookup the rate
// entryDate - date of the time entry (SQL formatted string)
function getRateByUser(username, entryDate){
	try {
		var hourlyRate=0;
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/AA");
		var conn = ds.getConnection();
		var servProvCode = aa.getServiceProviderCode();
		//build query
		var selectString = "Select R1_RATE_SEQ, R1_UNIT_COST From RCOST_RATE Where R1_COST_ITEM = ? And SERV_PROV_CODE = ? And Rec_Status = 'A' And (R1_ACTIVE_DATE <= ? Or R1_ACTIVE_DATE Is Null) And (R1_EXPIRED_DATE > ? Or R1_EXPIRED_DATE Is Null)";
		var SQLStatement = conn.prepareStatement(selectString);
		SQLStatement.setString(1, username.toUpperCase());
		SQLStatement.setString(2, servProvCode);
		SQLStatement.setTimestamp(3, entryDate);
		SQLStatement.setTimestamp(4, entryDate);
		//get results
		var rSet = SQLStatement.executeQuery();
		while (rSet.next()) {
			var profileId = rSet.getString("R1_RATE_SEQ");
			var unitCostStr = rSet.getString("R1_UNIT_COST");
			var unitCost = parseFloat(unitCostStr);
			if (unitCost == 'NaN') {
				continue;
			}
			hourlyRate = unitCost;
			break;
		}
		return (hourlyRate);
	}
	catch (e) {
		logDebug("Exception getting time accounting profile: " + e.message);
	}
	finally {
		if (initialContext) {
			initialContext.close();
		}
		if (SQLStatement) {
			SQLStatement.close();

			if (rSet) {
				rSet.close();
			}
		}
		if (conn) {
			conn.close();
		}
	}
}

function feeAmountForTime(feestr) {
	// optional statuses to check for (SR5082)
	//
	var checkStatus = false;
	var statusArray = new Array();

	//get optional arguments
	if (arguments.length > 1) {
		checkStatus = true;
		for (var i = 1; i < arguments.length; i++)
			statusArray.push(arguments[i]);
	}

	var feeTotal = 0;
	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + feeResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr){
		aa.print(feeObjArr[ff].getFeeitemStatus());
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && "INVOICED" == feeObjArr[ff].getFeeitemStatus())
			feeTotal += feeObjArr[ff].getFee()
	}
			return feeTotal;
}