/*------------------------------------------------------------------------------------------------------/
| Program: Assess Time Accounting Fees
| This script processes time accounting fee assessment sets in order to automatically approve, bill, 
| and invoice time accounting entries.  It accepts a single parameter to control how far back from the
| current date the script should process the time accounting sets (processing is based on the week of
| the year).  A specific time group can be specified for processing using the timeGroup paramters.
| If none is specified, all billable groups will be processed.
|
| See the Time Accounting Billing solution documentation for details.  
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//this sepcifies the number of days to look back from the current system date when determining sets
var lookBackDays = aa.env.getValue("lookBackDays");
var timeGroupName = aa.env.getValue("timeGroup");
if (timeGroupName == "") timeGroupName = null;

//system vars
var batchJobName = "" + aa.env.getValue("BatchJobName");
var emailText = "";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));

//override functions for cleaner logs
var br = "<BR>";
overRide = "function logDebug(dstr) { aa.print(dstr + br); } function logMessage(dstr) { aa.print(dstr + br); }";
eval(overRide);


function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

// log the start of the batch
var batchJobResult = aa.batchJob.getJobID()
var batchJobID = 0;
if (batchJobResult.getSuccess()) {
batchJobID = batchJobResult.getOutput();
 logMessage("START", "Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else {
 logMessage("WARNING", "Batch job ID not found " + batchJobResult.getErrorMessage());
}

// Get all time groups that are subject to billing/review
var stdChoiceArray = new Array();
var stdChoice = "TimeReviewGroups";
var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
if (bizDomScriptResult.getSuccess() == false) {
	logDebug("**ERROR: " + "Unable to retrieve values from standard choice " + stdChoice + ": " + result.getErrorMessage());
}
else {
	stdChoiceArray = bizDomScriptResult.getOutput().toArray();
}
//setup date
var adjustedDate = new Date(startDate.getTime());
if (lookBackDays) adjustedDate.setDate(startDate.getDate() - lookBackDays);
logDebug("Processing with date " + adjustedDate + "   week: "+ getWeekOfYear(adjustedDate));
if (timeGroupName) logDebug("Processing for group: " + timeGroupName);
//fetch sets for processing
for (a in stdChoiceArray) {
	var timeGroup = String(stdChoiceArray[a].bizdomainValue);
	if (timeGroupName) {
		if (timeGroup != timeGroupName) continue;
	}
	var year = adjustedDate.getFullYear();
	var setId = timeGroup.toUpperCase() + " " + year + "." + getWeekOfYear(adjustedDate);
	// Check for an existing set
	var capSet = aa.set.getSetByPK(setId).getOutput();
	if (capSet == null) {
		continue;
	}
	logDebug("Set found...");
	var setName = capSet.setTitle;
	logDebug("   ID  (" + setId + ")");
	logDebug("   Name(" + setName + ")");
	var setDate = new Date(capSet.setDate.epochMilliseconds);
	logDebug("   Date(" + setDate + ")");
	//get set members and process each record
	var setMembers = aa.set.getCAPSetMembersByPK(setId).getOutput().toArray();
	for (a in setMembers) {
		var cap = aa.cap.getCap(setMembers[a].ID1, setMembers[a].ID2, setMembers[a].ID3).getOutput();
		var capId = cap.getCapID();
		var altId = cap.getCapModel().altID;
		logDebug("      Processing " + altId); 
		assessTimeAccountingFeesForBatch(capId, timeGroup);
	}
}


/*------------------------------------------------------------------------------------------------------/
|
| SUPPORTING FUNCTIONS
|
/------------------------------------------------------------------------------------------------------*/

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

function getTimeGroupName(groupSeqNum) {
    var grpMod = aa.timeAccounting.getTimeGroupTypeModel().getOutput();
    grpMod.setTimeGroupSeq(groupSeqNum);
    var grps = aa.timeAccounting.getTimeGroupTypeModels(grpMod).getOutput();
    return grps[0].getTimeGroupName();
}

// Takes a javascript date and returns an int representing the week of the year
function getWeekOfYear(jsDate) {
    var target = new Date(jsDate.valueOf());

    // ISO week date weeks start on monday  
    // so correct the day number  
    var dayNr = (jsDate.getDay() + 6) % 7;

    // Set the target to the thursday of this week so the  
    // target date is in the right year  
    target.setDate(target.getDate() - dayNr + 3);

    // ISO 8601 states that week 1 is the week  
    // with january 4th in it  
    var jan4 = new Date(target.getFullYear(), 0, 4);

    // Number of days between target date and january 4th  
    var dayDiff = (target - jan4) / 86400000;

    // Calculate week number: Week 1 (january 4th) plus the    
    // number of weeks between target date and january 4th    
    var weekNr = 1 + Math.ceil(dayDiff / 7);
    return weekNr;
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