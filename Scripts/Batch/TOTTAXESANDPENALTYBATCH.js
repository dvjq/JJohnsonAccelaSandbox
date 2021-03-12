/*------------------------------------------------------------------------------------------------------/
| Program: TOT coupons and amendments with a balance due. Assess penalty and interest fees.
|
|
| Get all active trust accounts or only those that have had a deposit in the last 24 hours. Remove from the set Trust Account Error.
|
| For testing:
| aa.env.setValue("appGroup", "Licenses");
| aa.env.setValue("appTypeType", "Transient Occupancy Tax");
| aa.env.setValue("appSubtype", "Coupon");
| aa.env.setValue("appCategory", "*");
| aa.env.setValue("emailAddress", "deanna@grayquarter.com");

/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var batchJobName = "" + aa.env.getValue("BatchJobName");
var emailText = "";
var br = "<BR>";
var showDebug = true;								// Set to true to see debug messages in email confirmation
var maxSeconds = 30 * 60;							// number of seconds allowed for batch processing, usually < 5*60
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var sysFromEmail = "NoReply@anaheim.net";
var useAppSpecificGroupName = false;
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}
overRide = "function logDebug(dstr) { emailText += (dstr + br); } function logMessage(dstr) { emailText += (dstr + br); }";
eval(overRide);

// log the start of the batch
var batchJobResult = aa.batchJob.getJobID();
var batchJobID = 0;
if (batchJobResult.getSuccess()) {
batchJobID = batchJobResult.getOutput();
 logMessage("START", "Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else {
 logMessage("WARNING", "Batch job ID not found " + batchJobResult.getErrorMessage());
}

batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logMessage("START","Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logMessage("WARNING","Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var emailAddress = getParam("emailAddress");			// email to send report
var appGroup = getParam("appGroup");				//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");			//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");			//   app subtype to process {NA}
var appCategory = getParam("appCategory");			//   app category to process {NA}		
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
	
if (appGroup=="")
	appGroup="*";
if (appTypeType=="")
	appTypeType="*";
if (appSubtype=="")
	appSubtype="*";
if (appCategory=="")
	appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;	
logDebug(appType);

var sysDate = aa.date.getCurrentDate();
feeSchedule = 'LIC_TOT_APP';

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
| 
/-----------------------------------------------------------------------------------------------------*/

logMessage("START","Start of Job");

if (!timeExpired) mainProcess();

logMessage("END","End of Job: Elapsed Time : " + elapsed() + " Seconds");
aa.print(emailText);
aa.eventLog.createEventLog("INFO", "Batch Process", batchJobName, sysDate, sysDate,"", emailText,batchJobID);
if (emailAddress.length && showDebug) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Debug Output", emailText);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function mainProcess() {

    var capCount = 0;
    var capDeactivated = 0;
    permitsToProcess = new Array;
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();
	
    var sqlSelectAcct = "select bd.b1_per_id1 as id1, bd.b1_per_id2 as id2, bd.b1_per_id3 as id3 from bpermit_detail bd join b1permit p on (bd.serv_prov_code=p.serv_prov_code and bd.b1_per_id1=p.b1_per_id1 and bd.b1_per_id2=p.b1_per_id2 " +
    " and bd.b1_per_id3=p.b1_per_id3) where bd.serv_prov_code = 'ANAHEIM'and p.b1_per_group=? and p.b1_per_type = ? and p.b1_per_sub_type = ? and bd.balance >0";
    try {
        var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        var ds = initialContext.lookup("java:/AA");
        var conn = ds.getConnection();
        var sStmt = conn.prepareStatement(sqlSelectAcct);
        sStmt.setString(1, appGroup);
        sStmt.setString(2, appTypeType);
        sStmt.setString(3, appSubtype);
        var rSet = sStmt.executeQuery();
        
        while (rSet.next()) {
            ID1 = rSet.getString("id1");
		    ID2 = rSet.getString("id2");
		    ID3 = rSet.getString("id3");
		
		    capIdResult = aa.cap.getCapID(ID1, ID2, ID3);
            if (capIdResult.getSuccess()) {
                thisCapId = capIdResult.getOutput();
                if (thisCapId != null)
                    permitsToProcess.push(thisCapId);
            }
          //  break; //TESTING
        }
        sStmt.close();
        conn.close();
    }
    catch (err) {
        logDebug("Error retrieving records");
        logDebug(err);
        return;
    }
    for (pIndex in permitsToProcess) { 
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
		{ 
			logMessage("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
        }	

        capId = permitsToProcess[pIndex];
        capId = getCapIdBATCH(capId.getID1(), capId.getID2(), capId.getID3());
        altId = capId.getCustomID();
		logDebug("==========: " + altId + " :==========");
	
		var capResult = aa.cap.getCap(capId);

		if (!capResult.getSuccess()) {
			logDebug("     " +"skipping, Record is deactivated");
			capDeactivated++;
			continue;
		} else {
			cap = capResult.getOutput();
        }
        var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType(); //create CapTypeModel object
		appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        
        altIdPieces = null;
        if (appTypeArray[3] == "NA") { // coupon records
            altIdPieces = altId.split("-"); 
        }
        else {  // amendment records
            pId = getParent();
            if (pId) {
                pAltId = pId.getCustomID();
                logDebug("Parent is " + pAltId);
                altIdPieces = pAltId.split("-");

            } 
            else {
                logDebug("Amendment " + altId + " does not have a parent");
                continue;
            }
        }
        if (!altIdPieces) {
            logDebug("Cannot determine payment due date for " + altId)
            continue;
        }
        altIdYear = altIdPieces[1]
        altIdMonth = altIdPieces[2];     
        // due date is the day AFTER the last business day of each month
        firstDayOfDueMonth = "" + altIdMonth + "/01/" + altIdYear;
        logDebug("firstDayOfDueMonth = " + firstDayOfDueMonth);
        firstDayOfNextMonth = dateAddMonths(firstDayOfDueMonth, 2);
        lastDayOfMonth = dateAdd(firstDayOfNextMonth, -1);
        logDebug("Last day of month  = " + lastDayOfMonth);
        jsCalcDate = convertDate(lastDayOfMonth);
        var businessDay = false;
        while (businessDay == false){
            if (checkHolidayCalendar(jsCalcDate) == false) {
                logDebug("found a working day: " + jsCalcDate);
                businessDay = true;
            }
            else{
                calcDate = new Date(dateAdd(jsCalcDate, -1));
                logDebug("removed a day..." + jsCalcDate);
            }
        }
        lastBusinessDayOfMonth = jsDateToASIDate(jsCalcDate);
        logDebug("Last business day of the month is " + lastBusinessDayOfMonth)
        dayAfterLastBusinessDay = dateAdd(lastBusinessDayOfMonth, 1);
        paymentDueDate = dayAfterLastBusinessDay;
        logDebug("payment due date is " + paymentDueDate);
        currentDate = dateAdd(null, 0);
        jsPaymentDueDate = convertDate(paymentDueDate);
        if (jsPaymentDueDate.getTime() >= new Date().getTime()) {
            logDebug("Payment date is in the future, no taxes or penalties");
            continue;
        } 
        var days = Math.floor(dateDiff(paymentDueDate,currentDate));
        var totalDaysOverdue = days + 1
        var monthsOverDue = Math.floor(days/30);
        var daysOverDue = days - (monthsOverDue * 30);
        logDebug("Payment is " + monthsOverDue + " months and " + daysOverDue + " days overdue");
        
        // Penalty and Interest
        tax = getAppSpecific("Tax", capId);
        overCollectedTax = getAppSpecific("Overcollected Tax", capId);
        otc = getAppSpecific("OTC", capId);
        taxDue = (parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0) + (parseFloat(otc)*1 || 0);
        logDebug("Amount of tax due is " + taxDue);
        if (taxDue > 0) {
            penaltyDue = Math.min(monthsOverDue * (0.10 * taxDue), taxDue * 0.50);
            logDebug("Total Penalty Due is " + penaltyDue);
            //taxPlusPen = taxDue + penaltyDue;
           // totalInterestDue = (taxPlusPen * Math.pow(1.15, monthsOverDue)) - taxPlusPen;
           // dayInterest =  ((taxPlusPen * 0.15)/numberOfDaysInCurrentMonth()) * daysOverDue;
            dayInterest = (taxDue * 0.015)  / 30;
            totalInterestDue = dayInterest * totalDaysOverdue;

            logDebug("Total interest due = " + totalInterestDue);
            thisMonthsInterestDue = dayInterest * daysOverDue;
            logDebug("This months interest due = " + dayInterest);

            if (isLastDayOfMonth()) {
                //assess and invoice
                updateFee("TOT_040", feeSchedule, "FINAL", parseFloat(penaltyDue), "Y");
                updateFee("TOT_050", feeSchedule, "FINAL", thisMonthsInterestDue, "Y");
            }
            else {
                // just assess
                updateFee("TOT_040", feeSchedule, "FINAL", parseFloat(penaltyDue), "N");
                updateFee("TOT_050", feeSchedule, "FINAL", thisMonthsInterestDue, "N");
            }
        }
        
        // ATID Penalty and Interest
        tax = getAppSpecific("ATID Assessment", capId);
        overCollectedTax = getAppSpecific("ATID Covercollected", capId);
        otc = getAppSpecific("OTC ATID", capId);
        taxDue = (parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0) + (parseFloat(otc)*1 || 0);
        logDebug("Amount of ATID tax due is " + taxDue);
        if (taxDue > 0) {
            penaltyDue = Math.min(monthsOverDue * (0.10 * taxDue), taxDue * 0.50);
            logDebug("Total ATID penalty Due is " + penaltyDue);
           // taxPlusPen = taxDue + penaltyDue;
           // totalInterestDue = (taxPlusPen * Math.pow(1.15, monthsOverDue)) - taxPlusPen;
           // dayInterest =  ((taxPlusPen * 0.15)/numberOfDaysInCurrentMonth()) * daysOverDue;
            //totalInterestDue += dayInterest; 
            dayInterest = (taxDue * 0.015)  / 30;
            totalInterestDue = dayInterest * totalDaysOverdue;
            logDebug("Total ATID interest due = " + totalInterestDue);
            thisMonthsInterestDue = dayInterest * daysOverDue;
            logDebug("This months ATID interest due = " + dayInterest);

            if (isLastDayOfMonth()) {
                //assess and invoice
                updateFee("TOT_070", feeSchedule, "FINAL", parseFloat(penaltyDue), "Y");
                updateFee("TOT_080", feeSchedule, "FINAL", thisMonthsInterestDue, "Y");
            }
            else {
                // just assess
                updateFee("TOT_070", feeSchedule, "FINAL", parseFloat(penaltyDue), "N");
                updateFee("TOT_080", feeSchedule, "FINAL", thisMonthsInterestDue, "N");
            }
        }
      //  break;
    }

    logDebug("Total CAPS qualified date range: " + permitsToProcess.length);
	logDebug("Total CAPS processed: " + capCount);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
 
function isLastDayOfMonth() {
    var test = new Date();
    month = test.getMonth();
    test.setDate(test.getDate() + 1);
    return test.getMonth() !== month;

}
function numberOfDaysInCurrentMonth() {
    today = new Date();
    var month = today.getMonth();
    var year = today.getFullYear();
    return new Date(year, month, 0).getDate();
}

/*
* Checks all agency holiday calendars for an event on the specified date
* Returns true if there is an event, else false
* date - javascript date object
*/
function checkHolidayCalendar(date){
	var holiday = false;
	var calArr = new Array();
	var agency = aa.getServiceProviderCode()
	//get the holiday calendars
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();
	var selectString = "select * from CALENDAR WHERE SERV_PROV_CODE = ? AND CALENDAR_TYPE='AGENCY HOLIDAY' AND  REC_STATUS='A'";
	var sStmt = conn.prepareStatement(selectString);
	sStmt.setString(1, agency);
	var rSet = sStmt.executeQuery();
	while (rSet.next()) {
		calArr.push(rSet.getString("CALENDAR_ID"));
	}
	sStmt.close();
	for (var c in calArr){
		var cal = aa.calendar.getCalendar(calArr[c]).getOutput();
		var events = aa.calendar.getEventSeriesByCalendarID(calArr[c], date.getYear()+1900, date.getMonth()+1).getOutput();
		for (var e in events){
			var event = events[e];
			var startDate = new Date(event.getStartDate().getTime());
			var startTime = event.getStartTime();
			var endDate = event.getEndDate();
			var allDay = event.isAllDayEvent();
			var duration = event.getEventDuration();
			if (dateDiff(startDate,date) >= 0  && dateDiff(startDate,date) < 1){
				holiday = true;
			}
		}
	}
	return holiday;
}


function getCapIdBATCH(pid1,pid2,pid3)  {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if(s_capResult.getSuccess())
      return s_capResult.getOutput();
    else
    {
      logMessage("ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
      return null;
    }
  }	

	
