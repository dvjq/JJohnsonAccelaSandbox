/*
//Sample expression
aa.env.setValue("name","testfunc");
aa.env.setValue("project","PERMITROCKET-REC18-00000-0001X");
//aa.env.setValue("ScriptTest","Y");
*/

/*------------------------------------------------------------------------------------------------------/
| Program : API_DPR_EXPRESSIONS.js
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
var Dpr = {};
Dpr.Expressions = {};

var scriptTest = aa.env.getValue("ScriptTest");

var func = aa.env.getValue("name");
var project = aa.env.getValue("project");
var paramsObject = {};
loadParams();

var scriptTest = aa.env.getValue("ScriptTest");
var servProvCode = aa.getServiceProviderCode();

var showMessage = false;
var showDebug = false;
var debug = "";	

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
	mstrScriptConfigArray = mstrScriptConfigString.split("|");
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

if (func != "" && func != undefined) {
	var recordId = aa.env.getValue("project");
	// If no recordId provided in the parameters then the recordId parameter will be blank
	if (recordId != "" && recordId != undefined) {
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


		} else {
			aa.env.setValue("ScriptReturnCode", "1");
			aa.env.setValue("ScriptReturnMessage", "");
			aa.env.setValue("InterfaceReturnCode", "1");
			aa.env.setValue("InterfaceReturnMessage", "No such Record ID exists. Rejecting Transaction.");
		}	
	} 

	try {

		eval(getScriptText("INCLUDES_DPR_EXPRESSIONS",null,false));
		if (Dpr.Expressions[func] != undefined) {
			aa.env.setValue("returnValue",Dpr.Expressions[func](paramsObject));
			aa.env.setValue("InterfaceReturnCode", "0"); 
			aa.env.setValue("InterfaceReturnMessage", "Success");							
		} else {
			aa.env.setValue("ScriptReturnCode", "1");
			aa.env.setValue("ScriptReturnMessage", "");
			aa.env.setValue("InterfaceReturnCode", "1");
			aa.env.setValue("InterfaceReturnMessage", "<" + func + "> is not defined");							
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
	aa.env.setValue("InterfaceReturnMessage", "No function submitted");		
}




if (scriptTest == "Y") printEnv(); 

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function loadParams() {
    var params = aa.env.getParamValues();
    var keys =  params.keys();
    var key = null;
    while(keys.hasMoreElements())
    {
     key = keys.nextElement();
     if (key != "name") {
     	paramsObject[key] = aa.env.getValue(key);	
     }
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