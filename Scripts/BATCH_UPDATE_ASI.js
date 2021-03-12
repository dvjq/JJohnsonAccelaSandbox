/*

	Batch update record data

*/
var showMessage=true;
var showDebug=true;
var debug="";
var useProductScripts=true;
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var myUserId = "ADMIN"; aa.env.setValue("CurrentUserID",myUserId);
var SCRIPT_VERSION = 3.0;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		}
		else {
				var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}
}

// custom code:
try {

	// Get existing solution
  var solRecGroup = "EnvHealth";
  var solRecType = "Food Retail";
  var solRecSubType = "Food Stand";
  var solRecCategory = "Application";

  var capModel = aa.cap.getCapModel().getOutput();
  // Specify the record type to query
  capTypeModel = capModel.getCapType();
  capTypeModel.setGroup(solRecGroup);
  capTypeModel.setType(solRecType);
  capTypeModel.setSubType(solRecSubType);
  capTypeModel.setCategory(solRecCategory);
  capModel.setCapType(capTypeModel);
  //capModel.setCapStatus(recordStatus);
  //capModel.setSpecialText(solutionName);

  var recordListResult = aa.cap.getCapIDListByCapModel(capModel);
  var recordList = new Array();
  if (recordListResult.getSuccess())
  {
    recordList = recordListResult.getOutput();
    if(recordList.length>0) {
      logDebug("	Total Solutions:" + recordList.length);
			for(rec in recordList) {
				thisRecord = aa.cap.getCap(recordList[rec].getCapID()).getOutput();
				capId = thisRecord.getCapID();
				capIDString = capId.getCustomID();
				cap = aa.cap.getCap(capId).getOutput();
				solutionName = cap.getSpecialText();
				logDebug("Updating Solution: " + capId.getCustomID());

				//
				//
				// Update Solution Custom Field
				var customFieldName = "Business Code"
				var customFieldValue = "722330"

				editAppSpecific(customFieldName,customFieldValue);	
			}
    }
		else {
			logDebug(" No record found with name: " + solutionName);
		}
  }
	//exploreObject(lookupTableValues)

}catch (err) {
	logDebug("Error: " + err.message);
}


/***********************************************
Show the debug window
***********************************************/
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);


function exploreObject (objExplore) {

	logDebug("Methods:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) == "function") {
			logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
			logDebug("   " + objExplore[x] + "<br>");
		}
	}

	logDebug("");
	logDebug("Properties:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
	}

}

function getEventScriptParams()
{
	// get environment object and iterate through session variables
	var returnString = "";
	var envParams = aa.env.paramValues;
	var e = envParams.keys();
	while(e.hasMoreElements()){
		param = e.nextElement();
		returnString += param + " = " + aa.env.getValue(param.toString()) + "<br>"
		logDebug(param + " = " + aa.env.getValue(param.toString()));
	}

	return returnString;
}