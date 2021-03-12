/*
//PUBLICUSER ASSOCIATED CHECK
aa.env.setValue("recordIds","PERMITROCKET-REC18-00000-0001X,PERMITROCKET-REC18-00000-0001Z");
aa.env.setValue("userId","PUBLICUSER22");
aa.env.setValue("ScriptTest","Y");
*/

/*------------------------------------------------------------------------------------------------------/
| Program : API_DPR_RECORD_PERMISSIONS.js
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

var scriptTest = aa.env.getValue("ScriptTest");
var servProvCode = aa.getServiceProviderCode();
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/

var userId = "" + aa.env.getValue("userId").toUpperCase();
var recordIds = aa.env.getValue("recordIds");
var recordIdsArray = recordIds.split(",");

var publicUserID = null;
var publicUser = false;

if (userId.indexOf("PUBLICUSER") == 0){
	publicUserID = userId; 
	publicUser = true;
}

try {
	if (userId == null || userId == "" || userId == undefined) {
		aa.env.setValue("InterfaceReturnCode", "1");
		aa.env.setValue("InterfaceReturnMessage", "Bad request, missing userId");
	} else if (recordIds == null || recordIds == "" || recordIds == undefined) {
		aa.env.setValue("InterfaceReturnCode", "1");
		aa.env.setValue("InterfaceReturnMessage", "Bad request, missing recordIds");
	} else if (publicUser) {
		var pUserSeqNum = getPublicUserSeqNum(userId);
		
		var publicUserRecordsResult = aa.cap.getAssociatedCapsByOnlineUser(pUserSeqNum);

		if (publicUserRecordsResult.getSuccess()) {
			var publicUserRecordsList = publicUserRecordsResult.getOutput();
			var thisRecord;
			var permissionsResponse = new Array();
			for (var i in recordIdsArray) {
				thisRecord = recordIdsArray[i];
				thisRecordPermissions = {};
				thisRecordPermissions.id = new String(thisRecord);
				thisRecordPermissions.recordPermission = containsRecord(thisRecord, publicUserRecordsList);
				permissionsResponse.push(thisRecordPermissions);
			}
			
			aa.env.setValue("InterfaceReturnCode", "0");
			aa.env.setValue("InterfaceReturnMessage", "Success");
			aa.env.setValue("recordPermissions", JSON.stringify(permissionsResponse));
			
		} else {
			aa.env.setValue("InterfaceReturnCode", "1");
			aa.env.setValue("InterfaceReturnMessage", "Failed to get public user");			
		}	
	} else {
		// staff user
		// future functionality
		aa.env.setValue("InterfaceReturnCode", "1");
		aa.env.setValue("InterfaceReturnMessage", "Bad request, staff user is not yet implemented");
	}	
} catch (err) {
	aa.env.setValue("InterfaceReturnCode", "1"); 
	aa.env.setValue("InterfaceReturnMessage", err);
}

if (scriptTest == "Y") printEnv(); 

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function getPublicUserSeqNum(userId) {

	var publicUserModelResult = aa.publicUser.getPublicUserByPUser(userId);

	if (publicUserModelResult.getSuccess()) {

		var publicUserModel = publicUserModelResult.getOutput();
		if (publicUserModel != null) {
			return publicUserModel.getUserSeqNum();
		} else {
			return false;
		}
	} else {
		return false;
	}	
}

function containsRecord(recordId, recordList) {
	var recordFound = false;
	for (var record in recordList) {	
		var record4Compare = servProvCode + "-" + recordList[record].getCapID();
		if (recordId == record4Compare) {
			recordFound = true;
			break;
		}
	}
	return recordFound;	
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