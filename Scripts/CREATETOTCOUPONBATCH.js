/*------------------------------------------------------------------------------------------------------/
| Program: Create TOT Coupon child records

|
| For testing:
| aa.env.setValue("appGroup", "Licenses");
| aa.env.setValue("appTypeType", "Transient Occupancy Tax");
| aa.env.setValue("appSubtype", "NA");
| aa.env.setValue("appCategory", "NA");
| aa.env.setValue("emailAddress", "rgill@accela.com");
| aa.env.setValue("recordStatus", "Active");  
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
var sysFromEmail = "NoReply@accela.com";
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
var appGroup = getParam("appGroup");				//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");			//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");			//   app subtype to process {NA}
var appCategory = getParam("appCategory");			//   app category to process {NA}		
var emailAddress = getParam("emailAddress");			// email to send report
var recordStatus = getParam("recordStatus");

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
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
| 
/-----------------------------------------------------------------------------------------------------*/

logMessage("START","Start of Job");

if (!timeExpired) mainProcess();

logMessage("END","End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length && showDebug) 
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Debug Output", emailText);
aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function mainProcess() {
	
    var capCount = 0;
    
	capModel = aa.cap.getCapModel().getOutput(); 
	capTypeModel = capModel.getCapType(); 
	capTypeModel.setGroup(appGroup); 
	capTypeModel.setType(appTypeType); 
	capTypeModel.setSubType(appSubtype); 
	capTypeModel.setCategory(appCategory); 
	capModel.setCapType(capTypeModel); 
	capModel.setCapStatus(recordStatus); 

	// *** Retrieve cap models ***
	appListResult = aa.cap.getCapIDListByCapModel(capModel); 
	if (appListResult.getSuccess())
		appList = appListResult.getOutput();
	else
		{ logMessage("ERROR","ERROR: Getting records, reason is: " + appListResult.getErrorType() + ":" + appListResult.getErrorMessage()) ; return false }
    
    logDebug("Found " + appList.length + " records");
	for (caps in appList) 	{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
		{ 
			logMessage("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
        }	
      
		// Get the CAP and populate data.  Assume one CAP per invoice		
        thisCap = appList[caps]; 
        capId = aa.cap.getCapID(thisCap.getCapID().getID1(),thisCap.getCapID().getID2(), thisCap.getCapID().getID3()).getOutput();
        capCount++;
        var capIDshow = capId.getCustomID();
        logDebug(capIDshow);
        cap = aa.cap.getCap(capId).getOutput();	
        if (cap) {	
            capName = cap.getSpecialText();
            newId = createChild("Licenses","Transient Occupancy Tax", "Coupon", "NA", capName);
            atid = getAppSpecific("ATID", capId);
            editAppSpecific("ATID", atid, newId);
            addRecordToSet(atid, newId);
			//set TOT Type on the coupon
			editAppSpecific("TOT Type",getAppSpecific("TOT Type",capId), newId);
			
        }
        else {
            logDebug("Could not get cap object for " + capId);
        }
		
		// Actions start here:
   // if (capCount > 1) break;        // TESTING
    }

 	logDebug("Total records: " + appList.length);
 	logDebug("Total CAPS processed: " + capCount);
 	
 	
     //Create an Event Log Entry
     aa.print(emailText);
 	aa.eventLog.createEventLog("INFO", "Batch Process", batchJobName, sysDate, sysDate,"", emailText,batchJobID);
}
	 	

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/



function addRecordToSet(sName, itemCap) {
    var createResult = createSetIfNeeded(sName);
    if (!createResult.getSuccess()) {
        logDebug("**ERROR: Failed to create " + sName + " set: " + createResult.getErrorMessage());
        return false;
    }
    var addResult = aa.set.add(sName, capId);
    if (addResult.getSuccess()) 
        logDebug("Added " + capId.getCustomID() + " to set " + sName);
}

function createSetIfNeeded(setId) {
    var theSetResult = aa.set.getSetByPK(setId);
    if (!theSetResult.getSuccess()) {
        theSetResult = aa.set.createSet(setId, setId, null, null);
    }

    return theSetResult;
}