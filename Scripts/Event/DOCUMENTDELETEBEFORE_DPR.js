eval(getScriptText("INCLUDES_DPR_LIBRARY"));
var debug = "";
var br = "<br>";
var showDebug = false;
var documentIDList = aa.env.getValue("DocumentIDList");
var serviceProviderCode = aa.env.getValue("ServiceProviderCode");
var callerId = aa.getAuditID();
var currentUserID = callerId;
var dprUser = lookup("DPR_CONFIGS","DPR_USER_ID");
var cancelDelete = false;
aa.print("DocIdList: " + documentIDList);
printEnv();

if (callerId.toUpperCase() != dprUser.toUpperCase()) {
  if(documentIDList != "" && documentIDList != null) {
    var it = documentIDList.iterator();
    while(it.hasNext()) {
      var docId = it.next();
      aa.print(docId);
      var getDocResult = aa.document.getDocumentByPK(docId);
      if (getDocResult.getSuccess()) {
        var doc = getDocResult.getOutput();
        
        // if the document type is an attachment, don't block it
        var dprFileTypeConfig = lookup("DPR_FILE_TYPES",doc.docCategory);
        if (dprFileTypeConfig != undefined) {
          if (dprFileTypeConfig.indexOf("attachment") > -1) continue;
        }

        // if the document is a DPR plans or supporting type, and was uploaded by the DPR user
        // and the current user is not the DPR user, then block the delete
        if (doc.fileUpLoadBy.toUpperCase() == dprUser.toUpperCase()) {
          // check if the file is still listed in the plan room
          var dprFileInfo = Dpr.getFileInfo(docId);
          if (dprFileInfo) {
            var capIdArray = dprFileInfo.project.split("-");
            var capId = aa.cap.getCapID(capIdArray[1],capIdArray[2],capIdArray[3]).getOutput();
            var dprSubmittal = Dpr.getProjectSubmittal(dprFileInfo.submittal);
            if (dprSubmittal.status.toUpperCase() != "WITHDRAWN") {
              cancelDelete = true; 
            }           
          }
        }
      }
    }
  }
}


if (cancelDelete || currentUserID == "EPHADMIN" || currentUserID == "SETH") {
  aa.env.setValue("ScriptReturnCode", "1");
  aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br> One or more documents cannot be deleted because they are associated to a project within the Digital Plan Room");
}

/*------------------------------------------------------------------------------------------------------/
| Helper functions
/------------------------------------------------------------------------------------------------------*/

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

function logDebug(dstr) {
  vLevel = 1
  if (arguments.length > 1)
    vLevel = arguments[1];
  if ((showDebug & vLevel) == vLevel || vLevel == 1)
    debug += dstr + br;
  if ((showDebug & vLevel) == vLevel)
    aa.debug(aa.getServiceProviderCode() + " : " + aa.getAuditID(), dstr);
}

function lookup(stdChoice,stdValue) 
  {
  var strControl;
  var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
  
    if (bizDomScriptResult.getSuccess())
      {
    var bizDomScriptObj = bizDomScriptResult.getOutput();
    strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
  else
    {
    logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
  return strControl;
  }

function exists(eVal, eArray) {
    for (ii in eArray)
      if (eArray[ii] == eVal) return true;
    return false;
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