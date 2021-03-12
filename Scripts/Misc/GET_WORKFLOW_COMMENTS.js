/*------------------------------------------------------------------------------------------------------/
| Program		: GET_WORKFLOW_COMMENTS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: Hisham
| Created at	: 03/03/2018 16:41:20
|
/------------------------------------------------------------------------------------------------------*/
logDebug("Starting");

var showDebug = true;
var showMessage = 3;

var language = aa.env.getValue("language");
var capId = aa.env.getValue("capId");
var capIdArray = capId.split("-");
if (capIdArray.length==3){
	var capID1 = capIdArray[0];
	var capID2 = capIdArray[1];
	var capID3 = capIdArray[2];
}

try { 
	var comments = getMissingInfoComments();
	comments = JSON.stringify(comments);
	logDebug("GET_WORKFLOW_COMMENTS comments: " + JSON.stringify(comments));	
	aa.env.setValue("Content", comments);
	aa.env.setValue("Success", true);
	aa.env.setValue("Message", "Results returned successfully");
} catch (e) {
    aa.env.setValue("ScriptReturnCode", "-1");
    aa.env.setValue("Success", false);
    
    if (e instanceof org.mozilla.javascript.RhinoException) {
        var message = e.getValue();
        logDebug("Error while executing Workflow Comments. Error: " + message + " Trace: " + e.getScriptStackTrace());
        
        aa.env.setValue("Message", "EMSE ERROR: " + message);
        if (e.getScriptStackTrace()) {
            aa.env.setValue("StackTrace", e.getScriptStackTrace());
        }
    } else {
        logDebug("Error while executing Workflow Comments. Error: " + e);
        aa.env.setValue("Message", "Error while executing Workflow Comments. Error: " + e);
    }
}
 

function getMissingInfoComments()
{
    var tasks = [];
	var capId = aa.cap.getCapID(capID1 ,capID2 ,capID3).getOutput();
	
	var workflowHistory = aa.workflow.getWorkflowHistory(capId,null).getOutput();
	if(workflowHistory != null && workflowHistory.length>0) {
		for(var k=0;k<workflowHistory.length;k++)
		{
			var taskModel = workflowHistory[k].getTaskItem();
			var wfProcess = taskModel.getProcessCode();
			var taskDescription = taskModel.getTaskDescription();
			var wfTaskComments = taskModel.getDispositionComment();
			var wfDate = taskModel.getDispositionDateString(); 
			wfDate = wfDate.substr(0,wfDate.lastIndexOf("T"));
			var wfItemStatus = taskModel.getDisposition();
			
			if (!wfItemStatus){
				wfItemStatus = "";
			}
			if (!taskDescription){
				taskDescription = "";
			}
			if (!wfTaskComments){
				wfTaskComments = "";
			}
			if (language=="ar-AE"){
				//status = taskModel.getDisposition();
				//description = taskModel.getResTaskDescription();
				var description = translateTask(taskDescription);
				var status = translateTaskStatus(wfProcess,taskDescription, wfItemStatus);
			}else{
				var description = taskDescription;					
				var status = wfItemStatus;
			}
			tasks.push({
				description: String(description).trim(),
				comments: String(wfTaskComments).trim(),
				date: String(wfDate).trim(),
				status: String(status).trim()
			});
		}        
	}		
    return {workflowTasks: tasks};
}

function translateTask(pTaskName) {
  var taskName;
  try 
  {

    var sql = "SELECT G2.SD_PRO_DES AS TASK  ";
	sql += " FROM GPROCESS G  ";
	sql += " INNER JOIN GPROCESS_I18N G1 ON G.SERV_PROV_CODE = G1.SERV_PROV_CODE AND G.RES_ID = G1.RES_ID ";
	sql += " INNER JOIN GPROCESS_I18N G2 ON G1.SERV_PROV_CODE = G2.SERV_PROV_CODE AND G1.RES_ID = G2.RES_ID AND G2.LANG_ID = 'ar_AE'   ";
	sql += " WHERE G1.SD_PRO_DES = '"+pTaskName+"' ";
	sql += " AND   G.B1_PER_ID1 = '"+capID1+"' AND G.B1_PER_ID2 = '"+capID2+"' AND G.B1_PER_ID3 = '"+capID3+"' ";
	sql += " GROUP BY G2.SD_PRO_DES ";	
	
    var dbName="jetspeed";
    var result = aa.util.select(dbName,sql,null);

    logDebug("Task: " + sql);

    if(result.getSuccess())
    {   
      result = result.getOutput(); 
      var i = 0;
      if(result.size()>0 && result.get(0))
      { 
        while (i < result.size()) 
        {
          taskName = result.get(i).get("TASK");
		  logDebug("taskName: " + taskName);
          if (taskName)
            return taskName;
          i = i + 1;      
        }
      }     
    }
  }
  catch (err) {
    logDebug("Runtime error occurred: " + err);
  }
  return pTaskName;
}


function translateTaskStatus(processCode,taskName, pTaskStatus) {
  var status;
  try 
  {

    var sql = "SELECT G2.R3_ACT_STAT_DES AS STATUS ";
    sql += " FROM R3STATYP G1 INNER JOIN R3STATYP_I18N G2 ";
    sql += " ON G1.SERV_PROV_CODE = G2.SERV_PROV_CODE AND G1.RES_ID = G2.RES_ID AND G2.LANG_ID = 'ar_AE' ";
    sql += " where G1.R3_PROCESS_CODE = '"+processCode+"' ";
    sql += " AND G1.R3_ACT_TYPE_DES = '"+taskName+"' ";
    sql += " AND G1.R3_ACT_STAT_DES = '"+pTaskStatus+"' ";
    sql += " GROUP BY G2.R3_ACT_STAT_DES "; 

    var dbName="jetspeed";
    var result = aa.util.select(dbName,sql,null);

    logDebug("Status: " + sql);

    if(result.getSuccess())
    {   
      result = result.getOutput(); 
      var i = 0;
      if(result.size()>0 && result.get(0))
      { 
        while (i < result.size()) 
        {
          status = result.get(i).get("STATUS");
          if (status)
            return status;
          i = i + 1;      
        }
      }     
    }
  }
  catch (err) {
    logDebug("Runtime error occurred: " + err);
  }
  return pTaskStatus;
}

function getLastStepNumber(){
    // Find the Last Step Number
    var finalStepNumber = 0;
    var workflowHistory = aa.workflow.getWorkflowHistory(capId,null).getOutput();
    if(workflowHistory != null && workflowHistory.length>0)
    {
        for(var k=0;k<workflowHistory.length;k++)
        {
            var taskModel = workflowHistory[k].getTaskItem();
            var stepNumber = taskModel.getStepNumber();
            stepNumber = parseInt(stepNumber);
            if (stepNumber>finalStepNumber){
                finalStepNumber = stepNumber;
            }
        }
    }
    return finalStepNumber;
}

function logDebug(message) {
    aa.debug("GET_WORKFLOW_COMMENTS: ", message);
}