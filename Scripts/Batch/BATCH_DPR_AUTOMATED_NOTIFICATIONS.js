/* for testing purposes 
aa.env.setValue("showDebug","Y");
aa.env.setValue("module","Building");
aa.env.setValue("wfTask","Plans Intake");
aa.env.setValue("wfStatus","Awaiting Plans");
aa.env.setValue("fromDate","");
aa.env.setValue("toDate","");
aa.env.setValue("lookBehindDays","-7");
aa.env.setValue("daySpan","1");
aa.env.setValue("emailAddress","seth@epermithub.com");
aa.env.setValue("emailTemplate","REMINDER_SUBMIT_INITIAL_PLANS");
aa.env.setValue("batchJobName","Test Batch");
aa.env.setValue("batchUser","ADMIN");
aa.env.setValue("useCustomScript","N");
*/
/*------------------------------------------------------------------------------------------------------/
| Program: Upload Plans Reminder.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 07/20/2018 - Seth Axthelm
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
var useAppSpecificGroupName = false;
var currentUserID = aa.env.getValue("batchUser").toUpperCase();
var debug = "";
var showDebug = aa.env.getValue("showDebug").substring(0,1).toUpperCase().equals("Y");
var sysDate = aa.date.getCurrentDate();
var batchJobResult = aa.batchJob.getJobID()
var batchJobName = "" + aa.env.getValue("BatchJobName");
var wfObjArray = null;
var servProvCode = aa.getServiceProviderCode();


batchJobID = 0;


/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0
var useCustomScriptYN = aa.env.getValue("useCustomScript");
useCustomScriptYN == "Yes" ? useCustomScriptFile = true : useCustomScriptFile = false;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH",null,false));
eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_DPR_LIBRARY",null,false));
eval(getScriptText("INCLUDES_CUSTOM_GLOBALS",null,false));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/


if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var module = getParam("module");
var wfTask = getParam("wfTask");
var wfStatus = getParam("wfStatus");
var fromDate = getParam("fromDate");							// Hardcoded dates.   Use for testing only
var toDate = getParam("toDate");								// ""
var lookBehindDays = getParam("lookBehindDays");   		// Number of days from today
var daySpan = getParam("daySpan");						// Days to search (6 if run weekly, 0 if daily, etc.)
var emailAddress = getParam("emailAddress");					// email to send report
var emailTemplate = getParam("emailTemplate");	//notification template name

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

if (!fromDate.length) // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null,parseInt(lookBehindDays));

if (!toDate.length)  // no "to" date, assume today + number of look ahead days + span
	toDate = dateAdd(null,parseInt(lookBehindDays) + parseInt(daySpan)); //adding date to help with single day date ranges


// get from DPR configs
var mailFrom = lookup("DPR_CONFIGS", "NOTIFICATION_FROM_EMAIL");


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("********************************");
logDebug("Start of Job");


if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(mailFrom, emailAddress, "", batchJobName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


function mainProcess() {
	var capCount = 0;

	var appList = new Array();

	logDebug("Retrieving records where the workflow task \"" + wfTask + "\" is set to \"" + wfStatus + "\" with a due date between " + fromDate + " and " + fromDate + " (START)");
	logDebug("********************************");

	//Setup the workflow task criteria
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();

	taskItemScriptModel.setActiveFlag("Y");
	taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription(wfTask);
	taskItemScriptModel.setDisposition(wfStatus);

	//Setup the cap type criteria
	var capTypeScriptModel = aa.workflow.getCapTypeScriptModel().getOutput();
	capTypeScriptModel.setGroup(module);
	capTypeScriptModel.setType("");
	capTypeScriptModel.setSubType("");
	capTypeScriptModel.setCategory(""); //Ensure we pull Applications and Renewals

	//Set the date range for the task due date criteria
	//var startDueDate = aa.date.parseDate(dateAdd(null,-2));
	//var endDueDate = aa.date.getCurrentDate();

	//for testing purposes only
	var startDueDate = aa.date.parseDate(fromDate);
	var endDueDate = aa.date.parseDate(toDate);

	var appListResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, startDueDate, endDueDate, capTypeScriptModel, null);
	if (appListResult.getSuccess()) {
		appList = appListResult.getOutput();
	}
	else {
		logDebug("ERROR: Getting applications, reason is: " + appListResult.getErrorType() + ":" + appListResult.getErrorMessage());
		return false;
	}
		
	if (appList.length > 0) {
		logDebug("Processing " + appList.length + " application records");
	} else {
		logDebug("No applications returned"); 
		return false;
	}

	logDebug("********************************");


	/*------------------------------------------------------------------------------------------------------/
	|  Loop through the list of applications
	/------------------------------------------------------------------------------------------------------*/
	
	for (al in appList) {
		
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired 
			logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break;
		}

		/*------------------------------------------------------------------------------------------------------/
		|  Close the Denial Appeal Period workflow task
		/------------------------------------------------------------------------------------------------------*/

		//var capId = appList[al];
		capId = aa.cap.getCapID(appList[al].getCapID().getID1(),appList[al].getCapID().getID2(),appList[al].getCapID().getID3()).getOutput();
		// get the application number
		capIDString = capId.getCustomID();
		// get the cap type
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		// get the capName
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		// get cap open date
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		// get cap details
		var capDetailObjResult = aa.cap.getCapDetail(capId);		
		if (capDetailObjResult.getSuccess())
		{
			capDetail = capDetailObjResult.getOutput();
			houseCount = capDetail.getHouseCount();
			feesInvoicedTotal = capDetail.getTotalFee();
			balanceDue = capDetail.getBalance();
		}
		
		/*------------------------------------------------------------------------------------------------------/
		|  Send Plans Upload Reminder Email
		/------------------------------------------------------------------------------------------------------*/

		if (emailTemplate.length > 0) {
			var taskDueDate = getTaskDueDate(wfTask);
			
			var fDate = new Date(fromDate);
			if (taskDueDate.getTime() != fDate.getTime()) continue;
			
			logDebug("Evaluating application: " + capIDString + "(" + appTypeString + ")");

			if (matches(emailTemplate,"REMINDER_SUBMIT_INITIAL_PLANS","CORRECTIONS_REQUIRED_GO_LIVE")) {
				// check if project exists in the plan room
				if (!Dpr.dprProjectExists()) {
					// create the project
					logDebug("No DPR project found, creating project");
					Dpr.createProjectPlusSubmittal();
				} 
			}

			// get the latest review package
			var reviewPackage = Dpr.getLatestProjectSubmittal();

			// if no package returned, create one
			if (!reviewPackage) {
				logDebug("No review package found, creating a new package");
				reviewPackage = Dpr.createSubmittalPackage(null, true);
			} 

			// Create additional paramaters and lookup plan submission requirements
            var additionalParams = {};
			
			if (reviewPackage) {
				additionalParams.submittalId = reviewPackage.id;
			}
				          
			// Send email
			Dpr.sendDprEmailNotification(emailTemplate, additionalParams);               

			logDebug("********************************");
		}

		capCount++;
	} 
	
 	logDebug("Total CAPS qualified criteria: " + appList.length);
 	logDebug("Total CAPS processed: " + capCount);
 	
 }