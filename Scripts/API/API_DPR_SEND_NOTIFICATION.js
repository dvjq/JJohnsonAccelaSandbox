/*
//FILE_PROCESSING_COMPLETE
aa.env.setValue("recordId","PERMITROCKET-REC18-00000-00009");
aa.env.setValue("submittalId","514290ed-652e-4b79-9182-02c27ab8eca6");
aa.env.setValue("notificationId","DPR_FILE_PROCESSING_COMPLETE");
aa.env.setValue("userId","PUBLICUSER22");
aa.env.setValue("ScriptTest","Y");
*/

/*
//DPR_EXCEPTION
aa.env.setValue("recordId","PERMITROCKET-REC18-00000-00009");
aa.env.setValue("notificationId","DPR_EXCEPTION");
aa.env.setValue("errorCode","DPR001");
aa.env.setValue("errorMessage","Something really bad happened");
aa.env.setValue("ScriptTest","Y");
*/

/*
//DPR_ALERT
aa.env.setValue("recordId","PERMITROCKET-REC18-00000-00009");
aa.env.setValue("notificationId","DPR_ALERT");
aa.env.setValue("errorCode","DPR001");
aa.env.setValue("errorMessage","Something really bad happened");
aa.env.setValue("publicUserId","PUBLICUSER22");
aa.env.setValue("ScriptTest","Y");
*/

/*
//DPR_REQUEST
aa.env.setValue("recordId","PERMITROCKET-REC18-00000-00009");
aa.env.setValue("notificationId","DPR_REQUEST");
aa.env.setValue("userId","PUBLICUSER22");
aa.env.setValue("requestCode","FILE_VALIDATION");
aa.env.setValue("requestMessage","I don't know why I'm getting an error");
aa.env.setValue("ScriptTest","Y");
*/

/*
//DPR_PRINT_SET_COMPLETE
aa.env.setValue("recordId","PERMITROCKET-REC19-00000-0000B");
aa.env.setValue("notificationId","DPR_PRINT_SET_COMPLETE");
aa.env.setValue("docId","2392");
aa.env.setValue("userId","ADMIN");
aa.env.setValue("docType","Approved Set");
aa.env.setValue("ScriptTest","Y");
*/

/*------------------------------------------------------------------------------------------------------/
| Program : API_DPR_SEND_NOTIFICATION.js
| Event   : REST API
|
| Usage   : 
|			
|			
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|	The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/

var controlString = null;
var documentOnly = false;
var scriptTest = aa.env.getValue("ScriptTest");

// Get DPR user id from configuration
var dprUserResult = aa.bizDomain.getBizDomainByValue("DPR_CONFIGS","DPR_USER_ID"); 
var dprUserId, currentUserID;
if (dprUserResult.getSuccess() && dprUserResult.getOutput().getAuditStatus() != "I") { 
	dprUserId = dprUserResult.getOutput().getDescription();
}

if (dprUserId) {
	currentUserID = dprUserId;
} else {
	// default to ADMIN if none configured
	currentUserID = "ADMIN";
}

aa.env.setValue("CurrentUserID",currentUserID); 

// Get the master script configuration, default to non-productized
var includesFunctions = false
	, includesGlobals = false
	, includesCustom = false
	, mstrScriptConfigString
	, mstrScriptConfigArray = new Array();
var mstrScriptConfigResult = aa.bizDomain.getBizDomainByValue("DPR_CONFIGS","EMSE_MASTER_SCRIPT_CONFIG"); 
if (mstrScriptConfigResult.getSuccess() && mstrScriptConfigResult.getOutput().getAuditStatus() != "I") { 
	mstrScriptConfigString = mstrScriptConfigResult.getOutput().getDescription();
	mstrScriptConfigArray = mstrScriptConfigString.split("~");
	if (mstrScriptConfigArray.length == 3) {
		mstrScriptConfigArray[0] == "true" ?  includesFunctions = true : includesFunctions = false;
		mstrScriptConfigArray[1] == "true" ?  includesGlobals = true : includesGlobals = false;
		mstrScriptConfigArray[2] == "true" ?  includesCustom = true : includesCustom = false;
	}
}
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0

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

var recordId = aa.env.getValue("recordId");

// If no recordId provided in the parameters then the recordId parameter will be blank
if (recordId != "") {
	var idArray = recordId.split("-");
	var getCapResult = aa.cap.getCapID(idArray[1],idArray[2],idArray[3]);

	if (getCapResult.getSuccess()) {

		var useSA = false;
		var SA = null;
		var SAScript = null;
		var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
		if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
			useSA = true; 	
			SA = bzr.getOutput().getDescription();
			bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
			if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
			}
			
		if (SA) {
			eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,includesFunctions));
			var capId = getCapResult.getOutput();

			aa.env.setValue("PermitId1",capId.ID1);
			aa.env.setValue("PermitId2",capId.ID2);
			aa.env.setValue("PermitId3",capId.ID3);
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,includesGlobals));
			eval(getScriptText(SAScript,SA));
			}
		else {
			eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,includesFunctions));
			var capId = getCapResult.getOutput();

			aa.env.setValue("PermitId1",capId.ID1);
			aa.env.setValue("PermitId2",capId.ID2);
			aa.env.setValue("PermitId3",capId.ID3);
			eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,includesGlobals));
			}
			
		eval(getScriptText("INCLUDES_CUSTOM",null,includesCustom));



		/*------------------------------------------------------------------------------------------------------/
		| BEGIN Event Specific Variables
		/------------------------------------------------------------------------------------------------------*/


		/*------------------------------------------------------------------------------------------------------/
		| END Event Specific Variables
		/------------------------------------------------------------------------------------------------------*/

		logGlobals(AInfo);

		/*------------------------------------------------------------------------------------------------------/
		| <===========Main=Loop================>
		|
		/-----------------------------------------------------------------------------------------------------*/
		//
		//  Get the Standard choices entry we'll use for this App type
		//  Then, get the action/criteria pairs for this app
		//
		try {

			var notificationId = aa.env.getValue("notificationId");

			if (notificationId == null || notificationId == "" || notificationId == undefined) {
				aa.env.setValue("ScriptReturnCode", "1");
				aa.env.setValue("ScriptReturnMessage", "");
				aa.env.setValue("InterfaceReturnCode", "1");
				aa.env.setValue("InterfaceReturnMessage", "Bad request, missing notificationId");
			} else {
				if (notificationId == "DPR_FILE_PROCESSING_COMPLETE") {
					var userId = aa.env.getValue("userId");

					var isPublicUser = false;
					if (userId.indexOf("PUBLICUSER") != -1) {
						isPublicUser = true;
						var publicUserEmail = getPublicUserEmail(userId);
					}
					
					var submittalId = aa.env.getValue("submittalId");
					eval(getScriptText("INCLUDES_DPR_LIBRARY"));
					if (submittalId == null || submittalId == "" || submittalId == undefined) {
						aa.env.setValue("ScriptReturnCode", "1");
						aa.env.setValue("ScriptReturnMessage", "");
						aa.env.setValue("InterfaceReturnCode", "1");
						aa.env.setValue("InterfaceReturnMessage", "Bad request, missing submittalId");					
					} else {
						if (isPublicUser) {
							if (!publicUserEmail) {
								Dpr.sendFileProcessingCompleteNotification(submittalId, notificationId);	
							} else {
								Dpr.sendFileProcessingCompleteNotification(submittalId, notificationId, publicUserEmail);	
							}
						} else {
							var staffUserResult = aa.person.getUser(userId);

							if (staffUserResult.getSuccess()) {
								var staffUser = staffUserResult.getOutput();
								var staffEmail = staffUser.getEmail();
								if (staffEmail) {
									Dpr.sendFileProcessingCompleteNotification(submittalId, notificationId + "_STAFF", staffEmail);
								}
							}
						}
						aa.env.setValue("InterfaceReturnCode", "0"); 
						aa.env.setValue("InterfaceReturnMessage", "Success");						
					}
				
				} else if (notificationId == "DPR_EXCEPTION") {
					var dprErrorCode = aa.env.getValue("errorCode");
					var dprErrorMessage = aa.env.getValue("errorMessage");
					eval(getScriptText("INCLUDES_DPR_LIBRARY"));
					Dpr.handleDprException(dprErrorCode, dprErrorMessage);

					aa.env.setValue("InterfaceReturnCode", "0"); 
					aa.env.setValue("InterfaceReturnMessage", "Success");

				} else if (notificationId == "DPR_ALERT") {
					var dprErrorCode = aa.env.getValue("errorCode");
					var dprErrorMessage = aa.env.getValue("errorMessage");
					var userId = aa.env.getValue("userId");
					var publicUserEmail = null;

					var isPublicUser = false;
					if (userId.indexOf("PUBLICUSER") != -1) {
						isPublicUser = true;
						publicUserEmail = getPublicUserEmail(userId);
					}

					eval(getScriptText("INCLUDES_DPR_LIBRARY"));
					Dpr.handleDprAlert(dprErrorCode, dprErrorMessage, publicUserEmail);

					aa.env.setValue("InterfaceReturnCode", "0"); 
					aa.env.setValue("InterfaceReturnMessage", "Success");

				} else if (notificationId == "DPR_REQUEST") {
					var dprRequestCode = aa.env.getValue("requestCode");
					var dprRequestMessage = aa.env.getValue("requestMessage");
					var userId = aa.env.getValue("userId");

					var isPublicUser = false;
					if (userId.indexOf("PUBLICUSER") != -1) {
						isPublicUser = true;
						var publicUserEmail = getPublicUserEmail(userId);
					}

					eval(getScriptText("INCLUDES_DPR_LIBRARY"));
					Dpr.handleDprRequest(dprRequestCode, dprRequestMessage);

					aa.env.setValue("InterfaceReturnCode", "0"); 
					aa.env.setValue("InterfaceReturnMessage", "Success");

				} else if (notificationId == "DPR_PRINT_SET_COMPLETE") {

					var userId = aa.env.getValue("userId");
					var dprUserId = lookup("DPR_CONFIGS", "DPR_USER_ID");
					if (userId.toUpperCase() == dprUserId.toUpperCase()) {
						var docId = aa.env.getValue("docId");
						var docType = aa.env.getValue("docType");
						eval(getScriptText("DPR_PRINT_SET_COMPLETE"));
					}
					aa.env.setValue("InterfaceReturnCode", "0"); 
					aa.env.setValue("InterfaceReturnMessage", "Success");

				} else {
					aa.env.setValue("ScriptReturnCode", "1");
					aa.env.setValue("ScriptReturnMessage", "");
					aa.env.setValue("InterfaceReturnCode", "1");
					aa.env.setValue("InterfaceReturnMessage", "Bad request, notificationId does not exist");
				}

			}



			
		} catch (err) {
				aa.env.setValue("InterfaceReturnCode", "1"); 
				aa.env.setValue("InterfaceReturnMessage", err);
		}

		/*------------------------------------------------------------------------------------------------------/
		| <===========END=Main=Loop================>
		/-----------------------------------------------------------------------------------------------------*/

		if (debug.indexOf("**ERROR") > 0)
			{
			aa.env.setValue("ScriptReturnCode", "1");
			aa.env.setValue("ScriptReturnMessage", debug);
			}
		else
			{
			aa.env.setValue("ScriptReturnCode", "0");
			if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
			if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
			}
	} else {
		aa.env.setValue("ScriptReturnCode", "1");
		aa.env.setValue("ScriptReturnMessage", "");
		aa.env.setValue("InterfaceReturnCode", "1");
		aa.env.setValue("InterfaceReturnMessage", "No such Record ID exists. Rejecting Transaction.");
	}	
} else {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", "");
	aa.env.setValue("InterfaceReturnCode", "1");
	aa.env.setValue("InterfaceReturnMessage", "No such Record ID exists. Rejecting Transaction.");	
}



if (scriptTest == "Y") printEnv(); 

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function getPublicUserEmail(userId) {

	var publicUserModelResult = aa.publicUser.getPublicUserByPUser(userId);

	if (publicUserModelResult.getSuccess()) {

		var publicUserModel = publicUserModelResult.getOutput();
		if (publicUserModel != null) {
			return publicUserModel.email;
		} else {
			return false;
		}
	} else {
		return false;
	}	
}

function printEnv() {
    //Log All Environmental Variables as  globals
    var params = aa.env.getParamValues();
    var keys =  params.keys();
    var key = null;
    while(keys.hasMoreElements())
    {
     key = keys.nextElement();
     eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
     aa.print(key + " = " + aa.env.getValue(key));
    }
}