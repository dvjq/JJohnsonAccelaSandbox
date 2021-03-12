//@ts-check
var showDebug = true;
var myCapId = "COM-ALT-19-000003";
//myCapId = "ENF18-00016";
var myUserId = "ADMIN";
var debug = "";

/* ASA  */ //var eventName = "ApplicationSubmitAfter";
/* WTUA */ //
var eventName = "WorkflowTaskUpdateAfter";
var wfTask = "Plans Distribution";
var wfStatus = "Route for Review";
var wfComment = "This is a Workflow Task comment.";
var wfDateMMDDYYYY = "11/06/2017";
/* IRSA */ //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
/* ISA  */ //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* ISB ALT */ //var eventName = "InspectionMultipleScheduleBefore"; inspType = "Set Backs"
/* PRA  */ //var eventName = "PaymentReceiveAfter";  

var useProductScript = true; // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.  
var doScripts = true;


/* master script code don't touch */
//@ts-ignore
aa.env.setValue("EventName", eventName);
var vEventName = eventName;
var controlString = eventName;
var tmpID = aa.cap.getCapID(myCapId).getOutput();
if (tmpID != null) {
    aa.env.setValue("PermitId1", tmpID.getID1());
    aa.env.setValue("PermitId2", tmpID.getID2());
    aa.env.setValue("PermitId3", tmpID.getID3());
}
aa.env.setValue("CurrentUserID", myUserId);
var preExecute = "PreExecuteForAfterEvents";
var documentOnly = false;
var SCRIPT_VERSION = 3;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}
if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useProductScript));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useProductScript));
    showDebug = true;
    eval(getScriptText(SAScript, SA, useProductScript));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useProductScript));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useProductScript));
}
eval(getScriptText("INCLUDES_CUSTOM", null, useProductScript));
if (documentOnly) {
    doStandardChoiceActions2(controlString, false, 0);
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
}
var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);
var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = false;
var doScripts = true;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript;
    try {
        if (useProductScripts) {
            emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}
logGlobals(AInfo);
if (runEvent && typeof doStandardChoiceActions == "function" && doStdChoices) try {
    doStandardChoiceActions(controlString, true, 0);
} catch (err) {
    logDebug(err.message);
}

if (runEvent && typeof doScriptActions == "function" && doScripts) {
    logDebug("Executing Scripts");
    doScriptActions();
}

// this controller replaces lookups for STANDARD_SOLUTIONS and CONFIGURABLE_RULESETS
doConfigurableScriptActions();

var z = debug.replace(/<BR>/g, "\r");
aa.print(z);



aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

function exploreObject(objExplore) {
    logDebug("Methods:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) === "function") {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
        var counter = objExplore.length;
    }

    logDebug("");
    logDebug("Properties:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) !== "function") {
            logDebug("  <b> " + x + ": </b> " + objExplore[x]);
        }
    }
}