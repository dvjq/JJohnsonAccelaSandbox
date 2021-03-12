/**
 * Purpose: Process ENF PM inspection result and take actions.
 *      - Create work orders for referrals
 *      - Send email referrals
 *      - Update the violations custom table with violation and referral information
 *      - Set next referral date custom field based on soonest referral to be picked up by batch
 *      - Create new site visit record, schedule/assign inspections and copy failed checklist items to new site visit
 * Author: Aaron Williams
 * Story ID:
 * Script Type: EMSE
 */

try {
    // get JSON Config Rules
    var rulesString = getScriptText("CONF_ENFORCEMENT_SITE_VISIT_INSP", null, false);
    if (rulesString == "") {
        throw "This script is not configured in: CONF_ENFORCEMENT_SITE_VISIT_INSP";
    }
    var rules = JSON.parse(rulesString);
    logDebug("rules: " + rules);

    if (!rules) {
        logDebug("WARNING: Inspection result rules have not been defined. Configure the CONF_ENF_INSP_RESULT JSON to configure business rules for inspection result.");
    }

    // fix for v360 IRSA master script
    servProvCode = capId.getServiceProviderCode();
	capIDString = capId.getCustomID();
	cap = aa.cap.getCap(capId).getOutput();
	appTypeResult = cap.getCapType();
	appTypeAlias = appTypeResult.getAlias();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");

    var myResultRules = getJSONRulesForInspResult(rules, appTypeString, inspType);
    for (r in myResultRules) {

        var thisResultRule = myResultRules[r];
        var resultStatusCriteria = thisResultRule.inspectionResult;
        logDebug("ResultStatusCriteria: " + resultStatusCriteria);
        var resultMatch = false;
        for (cr in resultStatusCriteria) {
            logDebug("Result status: " + resultStatusCriteria[cr]);
            if (inspResult == resultStatusCriteria[cr]) {
                resultMatch = true;
                break;
            }
        }

        // if the current inspection result does not match the JSON result criteria, continue to next rule.
        if (!resultMatch) {
            logDebug("Inspection result does not match criteria, continue to next rule.")
            continue;
        }

        // get update workflow rules
        var updateWorkflowRules = thisResultRule.updateWorkflow;
        if (updateWorkflowRules) {
            for (wf in updateWorkflowRules) {
                var updWfTask = updateWorkflowRules[wf].wfTask;
                var updWfStatus = updateWorkflowRules[wf].wfStatus;
                var updWfComment = "";
                var updWfNote = updateWorkflowRules[wf].wfNote;
                var copyInspectionComment = updateWorkflowRules[wf].copyInspectionComment;
                if (copyInspectionComment) {
                    updWfComment = inspComment;
                }
                closeTask(updWfTask, updWfStatus, updWfComment, updWfNote);
                deactivateTask("Closure");
                activateTask("Issue Citation");
            }
        }

        // get reinspect current record rules
        var violationArray = new Array();
        var reInspectCurrentRecord = thisResultRule.reInspectCurrentRecord;
        if (reInspectCurrentRecord) {
            for (rr in reInspectCurrentRecord) {
                var newInspectionType = reInspectCurrentRecord[rr].newInspectionType;
                var newInspectionStatus = reInspectCurrentRecord[rr].newInspectionStatus;
                var newInspectionDaysOut = reInspectCurrentRecord[rr].newInspectionDaysOut;
                var failedChecklistType = reInspectCurrentRecord[rr].failedChecklistType;
                var carryOverFailedItems = reInspectCurrentRecord[rr].carryOverFailedItems;
                var violationReferralRules = reInspectCurrentRecord[rr].violationReferralRules;

                copyFailChecklistItemsToCurrentRecord(capId, inspId, newInspectionType, newInspectionStatus, newInspectionDaysOut, currentUserID, carryOverFailedItems, failedChecklistType, violationReferralRules);

            }
        }

        // get create new record rules
        var violationArray = new Array();
        var createNewRecordRules = thisResultRule.createNewRecord;
        if (createNewRecordRules) {
            for (nr in createNewRecordRules) {
                var newRecordType = createNewRecordRules[nr].newRecordType;
                var newInspectionType = createNewRecordRules[nr].newInspectionType;
                var newInspectionStatus = createNewRecordRules[nr].newInspectionStatus;
                var newInspectionDaysOut = createNewRecordRules[nr].newInspectionDaysOut;
                var failedChecklistType = createNewRecordRules[nr].failedChecklistType;
                var carryOverFailedItems = createNewRecordRules[nr].carryOverFailedItems;
                var violationReferralRules = createNewRecordRules[nr].violationReferralRules;

                copyFailChecklistItemsToNewRecord(capId, inspId, newRecordType, newInspectionType, newInspectionStatus, newInspectionDaysOut, currentUserID, carryOverFailedItems, failedChecklistType, violationReferralRules);

            }
        }
    }
} catch (e) {
    logDebug("ERROR: " + e);
}

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);


function copyFailChecklistItemsToNewRecord(srcCapId, srcInspId, targetRecordType, targetInspType, targetInspStatus, targetInspDaysOut, inspectorId, carryOverFailedItems, failedChecklistType, violationReferralRules) {

    //keep in array to support multiple in the future
    var recordTypeList = aa.util.newArrayList();
    logDebug("type of: " + typeof (targetRecordType))
    if (typeof (targetRecordType) == 'string') {
        recordTypeList.add(targetRecordType);
    } else {
        recordTypeList = targetRecordType;
    }

    // loop through array of record types to create child records
    if (recordTypeList != null && recordTypeList.size() > 0) {
        for (var i = 0; i < recordTypeList.size(); i++) {
            var recordType = recordTypeList.get(i);

            //Create a new cap.
            var parentCapId;
            if (appTypeArray[2] == "Case") {
                parentCapId = srcCapId;
            } else {
                parentCapId = getParent();
            }
            var recTypeArray = recordType.split("/");
            var recordTypeArray = recordType.split("/");
            if (recordTypeArray.length == 4) {
                var newCapID = createChild(recordTypeArray[0], recordTypeArray[1], recordTypeArray[2], recordTypeArray[3], capName, parentCapId);
                copyOwnerFix(parentCapId, newCapID);

                var vContactResult = {};
                var vContactAry = new Array();

                vContactResult = aa.people.getCapContactByCapID(newCapID);
                vContactAry = vContactResult.getOutput();

                for (yy in vContactAry) {
                    var vCapContactModel = new Array();
                    var vContactSeqNumber = 0;
                    var vPeopleModel = new Array();

                    vCapContactModel = vContactAry[yy].getCapContactModel();
                    vPeopleModel = vContactAry[yy].getPeople();
                    logDebug("vPeopleModel: " + vPeopleModel);

                    vContactSeqNumber = parseInt(vPeopleModel.getContactSeqNumber());
                    logDebug("vContactSeqNumber: " + vContactSeqNumber);

                    aa.people.removeCapContact(newCapID, vContactSeqNumber);
                }

                copyContacts(capId, newCapID);

                var holdId = capId;
                capId = newCapID;
                copyParcelGisObjects();
                //setGISDistricts(capId,false);
                capId = holdId;

            } else {
                logDebug("ERROR: Record type not valid: " + recordType);
                continue;
            }

            logDebug("New Site Visit Record ID: " + newCapID.getCustomID());

            //update child record alt id to align with the parent case record ID
            var newAltId = updateNewEnfIDAndNameForChild(parentCapId, newCapID, recordType);

            //Get the InspSequenceNumber
            var inspSequenceNumber = getInspSequenceNumber(srcCapId, srcInspId);
            var newInspectionID;

            // first create the follow up as pending - we'll schedule it below after getting due dates
            //var newInspectionID = copyInspAsPendingToNewRecord(newCapID, inspSequenceNumber);

            // determine days out
            var daysOut = 30;
            if(targetInspDaysOut!=undefined && targetInspDaysOut != null && targetInspDaysOut > -1){
                daysOut = targetInspDaysOut;
            }

            // schedule inspection 30 days out by default, will auto schedule later based on due date
            logDebug("Schedule and assign to same inspector: " + targetInspType + ", " + inspectorId);
            scheduleInspect(newCapID, targetInspType, daysOut);
            var newInspectionID = getInspID(newCapID, targetInspType);
            assignInspection(newInspectionID,inspectorId);

            // Get the failed guideSheetItem list from the inspection and cap.
            var isCheckGuideItemCarryOverFlag = false;
            var failGuidesheetModel = getFailGuideSheetItemList(srcCapId, srcInspId, isCheckGuideItemCarryOverFlag);

            // copy the failed items to ASIT
            copyFailedGSItemsToASIT(srcCapId, failGuidesheetModel.getItems(), "VIOLATIONS", violationReferralRules);

            var cleanFailGuidesheet = cleanFailedGuidesheet(failGuidesheetModel, "Current Violations");
            var guideSheetModels = aa.util.newArrayList();
            if(cleanFailGuidesheet) {
                logDebug("Failed guidesheet list is null.")
                guideSheetModels.add(cleanFailGuidesheet);

            }

            var copyResult = aa.guidesheet.copyGGuideSheetItems(guideSheetModels, newCapID, newInspectionID, "ADMIN");
            if (copyResult.getSuccess()) {
                logDebug("Successfully copy guideSheet items to cap : " + newCapID);
            } else {
                logDebug("Failed copy guideSheet items to cap: " + copyResult.getErrorMessage());
            }
            logDebug("*********************************************************************************");

            // auto schedule and assign the inspection based on next due date
            if (targetInspStatus.toUpperCase() == "PENDING") {
                //Create a pending Inspection on the new cap.

            } else {
                var nextDueDate = getNextVioDueDate(srcCapId, failGuidesheetModel.getItems());
                if (nextDueDate == null) {
                    nextDueDate = dateAdd(nextDueDate, 30);
                    logDebug("No Violation Due Date. Using default of 30+ days: " + nextDueDate);
                }
                //autoScheduleInspection(newCapID, newInspectionID, new Date(nextDueDate));
            }


            return failGuidesheetModel;
        }
    }
}

function copyFailChecklistItemsToCurrentRecord(srcCapId, srcInspId, targetInspType, targetInspStatus, targetInspDaysOut, inspectorId, carryOverFailedItems, failedChecklistType, violationReferralRules) {



    //Get the InspSequenceNumber
    var inspSequenceNumber = getInspSequenceNumber(srcCapId, srcInspId);
    var newInspectionID;

         // determine days out
         var daysOut = 30;
         if(targetInspDaysOut!=undefined && targetInspDaysOut != null && targetInspDaysOut > -1){
             daysOut = targetInspDaysOut;
         }

               // schedule inspection 30 days out by default, will auto schedule later based on due date
               logDebug("Schedule and assign to same inspector: " + targetInspType + ", " + inspectorId);
               scheduleInspect(srcCapId, targetInspType, daysOut);
               var newInspectionID = getInspID(srcCapId, targetInspType);
               assignInspection(newInspectionID,inspectorId);

    // Get the failed guideSheetItem list from the inspection and cap.
    var isCheckGuideItemCarryOverFlag = false;
    var failGuidesheetModel = getFailGuideSheetItemList(srcCapId, srcInspId, isCheckGuideItemCarryOverFlag);

    // copy the failed items to ASIT
    copyFailedGSItemsToASIT(srcCapId, failGuidesheetModel.getItems(), "VIOLATIONS", violationReferralRules);

    var cleanFailGuidesheet = cleanFailedGuidesheet(failGuidesheetModel, "Current Violations");
    var guideSheetModels = aa.util.newArrayList();
    if(cleanFailGuidesheet) {
        logDebug("Failed guidesheet list is null.")
        guideSheetModels.add(cleanFailGuidesheet);

    }
    var copyResult = aa.guidesheet.copyGGuideSheetItems(guideSheetModels, srcCapId, newInspectionID, "ADMIN");
    if (copyResult.getSuccess()) {
        logDebug("Successfully copy guideSheet items to cap : " + srcCapId);
    } else {
        logDebug("Failed copy guideSheet items to cap: " + copyResult.getErrorMessage());
    }
    logDebug("*********************************************************************************");

    // auto schedule and assign the inspection based on next due date
    if (targetInspStatus.toUpperCase() == "PENDING") {
        //Create a pending Inspection on the new cap.

    } else {
        var nextDueDate = getNextVioDueDate(srcCapId, failGuidesheetModel.getItems());
        if (nextDueDate == null) {
            nextDueDate = dateAdd(nextDueDate, 30);
            logDebug("No Violation Due Date. Using default of 30+ days: " + nextDueDate);
        }
        //autoScheduleInspection(srcCapId, newInspectionID, new Date(nextDueDate));
    }

    return failGuidesheetModel;
}

function getInspID(vCapId, insp2Check) {
    // warning, returns only the first scheduled occurrence
    var inspResultObj = aa.inspection.getInspections(vCapId);
    if (inspResultObj.getSuccess()) {
        var inspList = inspResultObj.getOutput();
        for (xx in inspList)
            if (String(insp2Check).equals(inspList[xx].getInspectionType()))
                return inspList[xx].getIdNumber();
    }
    return false;
}

function editInspectionDate(iType, iDate) {
	// optional capId
	// updates the inspection date
	var itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

  var foundID;
	var inspResultObj = aa.inspection.getInspection(itemCap);
	if (inspResultObj.getSuccess()) {
		var inspList = inspResultObj.getOutput();
		for (xx in inspList) {
      if (String(iType).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("SCHEDULED")) {
        inspObj = inspList[xx];
        inspId = inspObj.getIdNumber();
        break;
      }
    }
    if (inspId)
    {
      logDebug("Updating inspection date for " + iType + ":" + inspId + " to " + iDate);
      inspObj.setScheduledDate(aa.date.parseDate(iDate));
      aa.inspection.editInspection(inspObj);
    }
	}
}

function autoScheduleInspection(vCapId, inspSeqNbr, date) {

    var inspModel;
    var inspScriptModel;
    var inspScriptModelResult = aa.inspection.getInspection(vCapId, inspSeqNbr);
    if (inspScriptModelResult.getSuccess()) {
        inspScriptModel = inspScriptModelResult.getOutput();
        inspModel = inspScriptModel.getInspection();
    } else {
        logDebug("**ERROR: Could not get inspection from record. InspSeqNbr: " + inspSeqNbr + ". " + inspScriptModelResult.getErrorMessage());
    }

    // work around required to set autoAssign = Y on new inspection (defaults to "N" when scheduled via script)
    var actModel = inspModel.getActivity();
    actModel.setAutoAssign("Y");
    inspModel.setActivity(actModel);

    logDebug("Schedule on earliest date: " + date);
    inspModel.getActivity().setActivityDate(date);
    inspSchedDate = aa.util.formatDate(date, "MM/dd/yyyy");

    var assignSwitch = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.AssignSwitch").getOutput();

    assignSwitch.setGetNextAvailableTime(true);
    assignSwitch.setOnlyAssignOnGivenDate(false);
    assignSwitch.setValidateCutOffTime(false);
    assignSwitch.setValidateScheduleNumOfDays(false);
    assignSwitch.setAutoAssignOnGivenDeptAndUser(false);
    assignSwitch.setCheckingCalendar(true);
    var assignService = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.AssignInspectionBusiness").getOutput();

    var inspectionList = aa.util.newArrayList();
    inspectionList.add(inspModel);

    var specifiedDate = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.SpecifiedDateTime").getOutput();
    specifiedDate.setDate(date)
    var result = assignService.autoAssign4AddOns(aa.getServiceProviderCode(), inspectionList, specifiedDate, assignSwitch);
    var assinfo = null;

    // last change made
    if (result.size() <= 0) {
        return false;
    }

    var atm = result.get(0);
    assinfo = atm;

    var errMsg = "";
    if (assinfo.flag == "S") {
        logDebug("Successfully auto scheduled inspection.");

        var inspector = assinfo.getInspector();
        var schedDate = assinfo.getScheduleDate();
        var schedDateScript = aa.date.getScriptDateTime(schedDate);
        inspScriptModel.setInspector(inspector);
        inspScriptModel.setScheduledDate(schedDateScript);

        var editInspResult = aa.inspection.editInspection(inspScriptModel)

        if (!editInspResult.getSuccess()) {
            logDebug("WARNING: re-assigning inspection " + editInspResult.getErrorMessage());
            return false;
        } else {
            logDebug("Successfully reassigned inspection " + inspScriptModel.getInspectionType() + " to user " + inspector.getUserID() + " on " + schedDate);
        }
        return true;
    }

    if (assinfo.flag == "C") {
        logDebug("WARNING: Cut off will not allow to schedule.");

    }

    if (assinfo.flag == "U") {
        logDebug("WARNING: Unable to auto schedule and assign inspection.");
        switch (assinfo.resultType) {
            case 24:
                errMsg = "Auto assign is disabled for inspection.";
                break;
            case 25:
                errMsg = "Calendar not found.";
                break;
            case 23:
                errMsg = "Inspector not found.";
                break;
            case 22:
                errMsg = "End time is less than start time.";
                break;
            case 21:
                errMsg = "End time not available.";
                break;
            case 9:
                errMsg = "Inspection unit exceeded inspector max unit.";
            case 2:
                errMsg = "Next available time not found.";
                break;
            default:
                errMsg = "Cannot schedule.";
                break;
        }
        logDebug(errMsg);
    }

    if (assinfo.flag == "F") {
        logDebug("WARNING: Can not auto schedule and assign inspection. Calendar is full.");
        switch (assinfo.resultType) {
            case 4:
                errMsg = "Calendar Units full.";
                break;
            case 6:
                errMsg = "Calendar Inspection overlap.";
                break;
            case 10:
                errMsg = "Inspection Units Full";
                break;
            case 11:
                errMsg = "Inspection Inspection Overlap";
                break;
            case 5:
                errMsg = "Next inspection not found.";
                break;
            case 12:
                errMsg = "Issue with number of schedule days.";
            case 13:
                errMsg = "Not a working day";
            case 14:
                errMsg = "Scheduled time is not avaialble";
                break;
            case 15:
                errMsg = "Calendar daily units are full";
                break;
            case 16:
                errMsg = "Calendar event units are full.";
                break;
            default:
                errMsg = "";
                break;
        }
        logDebug(errMsg);
    }


    return assinfo;

}

function autoScheduleInspection(vCapId, inspSeqNbr, date) {

    var inspModel;
    var inspScriptModel;
    var inspScriptModelResult = aa.inspection.getInspection(vCapId, inspSeqNbr);
    if (inspScriptModelResult.getSuccess()) {
        inspScriptModel = inspScriptModelResult.getOutput();
        inspModel = inspScriptModel.getInspection();
    } else {
        logDebug("**ERROR: Could not get inspection from record. InspSeqNbr: " + inspSeqNbr + ". " + inspScriptModelResult.getErrorMessage());
    }

    // work around required to set autoAssign = Y on new inspection (defaults to "N" when scheduled via script)
    var actModel = inspModel.getActivity();
    actModel.setAutoAssign("Y");
    inspModel.setActivity(actModel);

    logDebug("Schedule on earliest date: " + date);
    inspModel.getActivity().setActivityDate(date);
    inspSchedDate = aa.util.formatDate(date, "MM/dd/yyyy");

    var assignSwitch = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.AssignSwitch").getOutput();

    assignSwitch.setGetNextAvailableTime(true);
    assignSwitch.setOnlyAssignOnGivenDate(false);
    assignSwitch.setValidateCutOffTime(false);
    assignSwitch.setValidateScheduleNumOfDays(false);
    assignSwitch.setAutoAssignOnGivenDeptAndUser(false);
    assignSwitch.setCheckingCalendar(true);
    var assignService = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.AssignInspectionBusiness").getOutput();

    var inspectionList = aa.util.newArrayList();
    inspectionList.add(inspModel);

    var specifiedDate = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.SpecifiedDateTime").getOutput();
    specifiedDate.setDate(date)
    var result = assignService.autoAssign4AddOns(aa.getServiceProviderCode(), inspectionList, specifiedDate, assignSwitch);
    var assinfo = null;

    // last change made
    if (result.size() <= 0) {
        return false;
    }

    var atm = result.get(0);
    assinfo = atm;

    var errMsg = "";
    if (assinfo.flag == "S") {
        logDebug("Successfully auto scheduled inspection.");

        var inspector = assinfo.getInspector();
        var schedDate = assinfo.getScheduleDate();
        var schedDateScript = aa.date.getScriptDateTime(schedDate);
        inspScriptModel.setInspector(inspector);
        inspScriptModel.setScheduledDate(schedDateScript);

        var editInspResult = aa.inspection.editInspection(inspScriptModel)

        if (!editInspResult.getSuccess()) {
            logDebug("WARNING: re-assigning inspection " + editInspResult.getErrorMessage());
            return false;
        } else {
            logDebug("Successfully reassigned inspection " + inspScriptModel.getInspectionType() + " to user " + inspector.getUserID() + " on " + schedDate);
        }
        return true;
    }

    if (assinfo.flag == "C") {
        logDebug("WARNING: Cut off will not allow to schedule.");

    }

    if (assinfo.flag == "U") {
        logDebug("WARNING: Unable to auto schedule and assign inspection.");
        switch (assinfo.resultType) {
            case 24:
                errMsg = "Auto assign is disabled for inspection.";
                break;
            case 25:
                errMsg = "Calendar not found.";
                break;
            case 23:
                errMsg = "Inspector not found.";
                break;
            case 22:
                errMsg = "End time is less than start time.";
                break;
            case 21:
                errMsg = "End time not available.";
                break;
            case 9:
                errMsg = "Inspection unit exceeded inspector max unit.";
            case 2:
                errMsg = "Next available time not found.";
                break;
            default:
                errMsg = "Cannot schedule.";
                break;
        }
        logDebug(errMsg);
    }

    if (assinfo.flag == "F") {
        logDebug("WARNING: Can not auto schedule and assign inspection. Calendar is full.");
        switch (assinfo.resultType) {
            case 4:
                errMsg = "Calendar Units full.";
                break;
            case 6:
                errMsg = "Calendar Inspection overlap.";
                break;
            case 10:
                errMsg = "Inspection Units Full";
                break;
            case 11:
                errMsg = "Inspection Inspection Overlap";
                break;
            case 5:
                errMsg = "Next inspection not found.";
                break;
            case 12:
                errMsg = "Issue with number of schedule days.";
            case 13:
                errMsg = "Not a working day";
            case 14:
                errMsg = "Scheduled time is not avaialble";
                break;
            case 15:
                errMsg = "Calendar daily units are full";
                break;
            case 16:
                errMsg = "Calendar event units are full.";
                break;
            default:
                errMsg = "";
                break;
        }
        logDebug(errMsg);
    }


    return assinfo;

}
/*------------------------------------------------------------------------------------------------------/
| <===========Helper Functions
/------------------------------------------------------------------------------------------------------*/

function getNextVioDueDate(vCapId, guideSheetModelArr) {
    var gsItems = guideSheetModelArr.toArray();
    var tableRowArray = new Array();
    var nxtVioDueDate = null;
    var nxtVioDueDateStr = null;

    for (var loopi in gsItems) {
        var itemgroup = gsItems[loopi].getGuideType();
        var itemStatus = gsItems[loopi].getGuideItemStatus();
        var itemText = new String(gsItems[loopi].getGuideItemText());
        var itemTextClean = itemText.replace("(", "[");
        var itemTextParsed = itemTextClean.substr(0, itemTextClean.indexOf('['));

        if (itemTextClean.indexOf('[') < 0) {
            //use the full text
            itemTextParsed = itemText;
        }
        var vioDue = "";
        var row = new Array();
        var gsASIArray = new Array();

        //load guidesheet asi               
        gsASIArray = loadGuideSheetItemsWASI(vCapId, inspId, itemgroup, itemText, row);
        thisDueDate = gsASIArray["Violation Due Date"];

        // get the nearest due date to schedule the next inspection
        var thisDueDate;
        if (thisDueDate != null) {
            dtThisDueDate = new Date(thisDueDate);
            if (nxtVioDueDate == null) {
                nxtVioDueDate = dtThisDueDate;
                nxtVioDueDateStr = thisDueDate;
                logDebug("First due date found. Next Due Date: " + nxtVioDueDateStr);
            }
            if (dtThisDueDate < nxtVioDueDate) {
                nxtVioDueDate = dtThisDueDate;
                nxtVioDueDateStr = thisDueDate;
                logDebug("Existing due date < current due eate: " + dtThisDueDate + ">" + nxtVioDueDateStr);
            }
        }
    }
    return nxtVioDueDateStr;
}

function copyFailedGSItemsToASIT(vCapId, guideSheetModelArr, asiTableName, violationReferralRules) {

    var gsItems = guideSheetModelArr.toArray();
    var tableRowArray = new Array();
    var nxtRefDateASI = null;

    for (var loopi in gsItems) {
        var itemgroup = gsItems[loopi].getGuideType();
        var itemStatus = gsItems[loopi].getGuideItemStatus();
        var itemText = new String(gsItems[loopi].getGuideItemText());
        var itemComment = gsItems[loopi].getGuideItemComment() || "";
        var itemTextClean = itemText.replace("(", "[");
        var itemTextParsed = String(itemTextClean.substr(0, itemTextClean.indexOf('[')));
        if (itemTextClean.indexOf('[') < 0) {
            // try with a dash
            itemTextParsed = itemText;
        }

        var vioDue = "";
        var row = new Array();
        logDebug("Checklist Item: " + itemText);
        logDebug("Checklist Item Status: " + itemStatus);

        /* Process the checklist ASI,
            - populate VIOLATIONS ASI table
            - create referral work orders
            - send referral emails
        */
        var gsASIArray = new Array();
        gsASIArray = loadGuideSheetItemsWASI(vCapId, inspId, itemgroup, itemText, row);

        row["Violation"] = new asiTableValObj("Violation", String(itemTextParsed), "Y");
        row["Status"] = new asiTableValObj("Status", String(itemStatus), "Y");
        row["Code"] = new asiTableValObj("Code", String(itemText), "Y");
        row["Inspector Comment"] = new asiTableValObj("Inspector Comment", String(itemComment), "Y");

        vioDue = gsASIArray["Violation Due Date"];
        if (vioDue != null) {
            row["Due Date"] = new asiTableValObj("Due Date", String(gsASIArray["Violation Due Date"]), "Y");
        }
        var origVioDate = gsASIArray["Original Violation Date"];
        logDebug("Original Violation Date: " + origVioDate);

        // execute referral
        if (itemStatus.indexOf("Referral") > -1) {

            var referralDate;
            logDebug("Searching for Violation Referral Rule for: " + itemTextParsed);
            // initialize violation rules
            var thisVioRule = violationReferralRules[itemTextParsed.trim()];
            if (thisVioRule != undefined) {
                var createWorkOrderType = thisVioRule.createWorkOrderType;
                var referralDaysOut = thisVioRule.referralDaysOut;
                if (itemStatus.indexOf("Emergency") > -1) {
                    referralDaysOut = 1;
                    logDebug("Emergency Referral - Overriding referral rules to schedule referral for 1 day out.")
                }
                var emailReferrals = thisVioRule.emailReferrals;

                if (createWorkOrderType && createWorkOrderType != undefined && createWorkOrderType != null) {

                    // set work order schedule date = today + referralDaysOut
                    var thisRefDate = dateAdd(null, referralDaysOut);
                    logDebug("Referral Days Out: " + referralDaysOut);
                    logDebug("Referral Date: " + thisRefDate);

                    logDebug("Work order type: " + createWorkOrderType);

                    // if emergency referral, create work order now
                    // TO DO: Work order will be created by batch for now
                    /*if(thisReferralType=="Work Order" && itemStatus =="Emergency Referral"){
 
                        // TO DO: Create Work Order
 
                        // Copy Custom Fields and APO
                        logDebug("Created work order: " + createWorkOrderType + ". Scheduled on: " + thisRefDate);
                    }*/


                    //var dateFormat = "MM/dd/yyyy";
                    //var thisRefDateString = aa.util.formatDate(thisRefDate, dateFormat);
                    row["Work Order Type"] = new asiTableValObj("Work Order Type", String(createWorkOrderType), "Y");
                    row["Referral Date"] = new asiTableValObj("Referral Date", String(thisRefDate), "N");

                }

                // referral type
                var thisReferralType = "Work Order";
                if (emailReferrals && emailReferrals != undefined && emailReferrals != null) {
                    var thisToEmail;
                    for (er in emailReferrals) {
                        thisReferralType = emailReferrals[er].referralType;
                        thisToEmail = emailReferrals[er].email;
                        logDebug("Sending referral email to: " + thisReferralType + " - " + thisToEmail);
                    }
                }
                row["Referral Type"] = new asiTableValObj("Referral Type", String(thisReferralType), "Y");

            }

            if (vioDue != null && vioDue != undefined) {
                if (nxtRefDateASI == null || (new Date(nxtRefDateASI) > new Date(vioDue)))
                    nxtRefDateASI = vioDue;
            }

        }

        logDebug("-------------------------------------------------");

        // add the row to the VIOLATIONS table array
        tableRowArray.push(row);
    }
    logDebug("Number of Violations: " + tableRowArray.length);
    if (tableRowArray.length > 0) {
        removeASITable(asiTableName, vCapId);
        var asitModel;
        var new_asit;
        new_asit = addASITable(asiTableName, tableRowArray, vCapId);
    }

    // update the next refferal date custom field for batch script to pick up later
    if (nxtRefDateASI != null)
        editAppSpecific("Next Referral Date", nxtRefDateASI, vCapId);

}

function loadGuideSheetItemsWASI(vCapId, inspId, gsGroup, gsItem, row) {
    //
    // Returns an associative array of Guide Sheet Items
    // Optional second parameter, cap ID to load from
    //

    var retArray = new Array();

    var r = aa.inspection.getInspections(vCapId);

    if (r.getSuccess()) {

        var inspArray = r.getOutput();

        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspId) {
                var inspModel = inspArray[i].getInspection();

                var gs = inspModel.getGuideSheets()

                if (gs) {
                    var gsArray = gs.toArray();

                    for (var loopk in gsArray) {

                        var gItems = gsArray[loopk].getItems().toArray();
                        for (gI in gItems) {

                            gsi = gItems[gI];

                            var gsItemGroup = gsi.getGuideType();
                            var gsItemStatus = gsi.getGuideItemStatus();
                            var gsItemText = new String(gsi.getGuideItemText());
                            var gsItemTextClean = gsItemText.replace("(", "[");
                            var gsItemTextParsed = gsItemTextClean.substr(0, gsItemTextClean.indexOf('['));

                            if (gsItemGroup.equals(gsGroup) && gsItemText.equals(gsItem)) {
                                //logDebug("Group: " + gsItemGroup + "  Guidesheet Item: " + gsItemText + "with status of " + gsItemStatus );

                                var itemASISubGroupList = gsi.getItemASISubgroupList();

                                //If there is no ASI subgroup, it will throw warning message.
                                if (itemASISubGroupList != null) {
                                    //logDebug(" has ASIGROUP: ");

                                    var asiSubGroupIt = itemASISubGroupList.iterator();
                                    while (asiSubGroupIt.hasNext()) {
                                        var asiSubGroup = asiSubGroupIt.next();
                                        var asiItemList = asiSubGroup.getAsiList();
                                        if (asiItemList != null) {
                                            var asiItemListIt = asiItemList.iterator();
                                            while (asiItemListIt.hasNext()) {
                                                var asiItemModel = asiItemListIt.next();
                                                //logDebug("        " + asiItemModel.getAsiName() + " = " + asiItemModel.getAttributeValue());
                                                retArray[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
                                            }
                                        }
                                    }

                                } else {
                                    logDebug(" has NO ASIGROUP: ");
                                }
                            }
                        }
                    }
                }
                // if there are guidesheets
                else
                    logDebug("No guidesheets for this inspection");

            } // if this is the right inspection
        } // for each inspection
    } // if there are inspections
    logDebug("loaded " + retArray.length + " guidesheet items");
    return retArray;
}

function cleanFailedGuidesheet(gsModel, gsTypeName) {

    var cleanGuideSheetItemList = aa.util.newArrayList();
    var gGuideSheetModel = gsModel;
    var guideSheetNumber = gGuideSheetModel.getGuidesheetSeqNbr();
    var gGuideSheetItemModels = gGuideSheetModel.getItems();
    if (gGuideSheetItemModels) {
        for (var j = 0; j < gGuideSheetItemModels.size(); j++) {
            var gGuideSheetItemModel = gGuideSheetItemModels.get(j);
            var guideSheetItemNumber = gGuideSheetItemModel.getGuideItemSeqNbr();
            var spc = gGuideSheetItemModel.getServiceProviderCode();
            var gsStatus = gGuideSheetItemModel.getGuideItemStatus();
            var gsStatusGroup = gGuideSheetItemModel.getGuideItemStatusGroupName();

            // clean up fields for copy guidesheet to follow up inspection

            // removing clear guidesheet item status at request of Ben Anderson
            //   so officers can easily see the previous status
            //gGuideSheetItemModel.setGuideItemStatus("");

            //fieldsToClear = "Violation Due Date";
            //var cleanGSItemModel = clearGuideSheetASIFields(gGuideSheetItemModel, fieldsToClear);
            //cleanGuideSheetItemList.add(cleanGSItemModel);
            cleanGuideSheetItemList.add(gGuideSheetItemModel);

        }
        if (gsTypeName) {
            gGuideSheetModel.setGuideType(gsTypeName);
        }
        gGuideSheetModel.setItems(cleanGuideSheetItemList);
        return gGuideSheetModel;
    }


}

// Get failed guideSheet item list from the inspection.
function getFailGuideSheetItemList(vCapID, inspectionID, isCheckGuideItemCarryOverFlag) {

    var guideSheetList = aa.util.newArrayList();
    var guideSheetItemList = aa.util.newArrayList();

    /* CANNOT USE THIS FUNCTION BECAUSE THE FAILED ITEMS COME BACK BLANK
    var itemsResult = aa.guidesheet.getFailGGuideSheetItemsByCapIDAndInspID(vCapID, inspectionID, false);
   if (itemsResult.getSuccess()) {
        guideSheetItemList = itemsResult.getOutput();
    }
    */

    var itemsResult = aa.inspection.getInspections(vCapID);
    if (itemsResult.getSuccess()) {
        var inspectionScriptModels = itemsResult.getOutput();
        for (var k in inspectionScriptModels) {
            if (inspectionScriptModels[k].getIdNumber() == inspectionID) {
                var inspectionModel = inspectionScriptModels[k].getInspection();
                var gGuideSheetModels = inspectionModel.getGuideSheets();
                if (gGuideSheetModels) {
                    for (var i = 0; i < gGuideSheetModels.size(); i++) {
                        var gGuideSheetModel = gGuideSheetModels.get(i);
                        var guideSheetNumber = gGuideSheetModel.getGuidesheetSeqNbr();
                        var gGuideSheetItemModels = gGuideSheetModel.getItems();
                        if (gGuideSheetItemModels) {
                            for (var j = 0; j < gGuideSheetItemModels.size(); j++) {
                                var gGuideSheetItemModel = gGuideSheetItemModels.get(j);
                                var guideSheetItemNumber = gGuideSheetItemModel.getGuideItemSeqNbr();

                                var spc = gGuideSheetItemModel.getServiceProviderCode();
                                var gsStatus = gGuideSheetItemModel.getGuideItemStatus();
                                var gsStatusGroup = gGuideSheetItemModel.getGuideItemStatusGroupName();
                                //Get the result type for the status.
                                var result = aa.guidesheet.getStatusResultType(spc, gsStatusGroup, gsStatus);
                                if (result.getSuccess()) {
                                    var gsStatusType = result.getOutput();
                                    if (gsStatusType == "DENIED") {
                                        guideSheetItemList.add(gGuideSheetItemModel);
                                    }

                                }
                            }
                        }
                    }

                    // add all failed items from all checklists to one new carry over checklist
                    if (guideSheetItemList.size() > 0) {
                        var gGuideSheet = gGuideSheetModels.get(0).clone();
                        gGuideSheet.setItems(guideSheetItemList);
                        guideSheetList.add(gGuideSheet);
                    }
                } else {
                    logDebug("There is no guideSheets from this inspection: " + inspectionID);
                }
            }
        }
    }

    if (guideSheetItemList == null || guideSheetItemList.size() == 0) {
        logDebug("There is no failed guideSheetItems from the cap(" + vCapID + ") inspection(" + inspectionID + ").");
    }
    return gGuideSheet;
}

function clearGuideSheetASIFields(gsItemModel, fieldsToClear) {

    var clearFields = String(fieldsToClear);
    var updGSItemASISubGroupList = aa.util.newArrayList();
    var gGSItemASISubGroupList = gsItemModel.getItemASISubgroupList();
    if (gGSItemASISubGroupList) {
        for (var k = 0; k < gGSItemASISubGroupList.size(); k++) {
            var gGSItemASISubGroupModel = gGSItemASISubGroupList.get(k);

            var updGSItemASIList = aa.util.newArrayList();
            var gGSItemASIList = gGSItemASISubGroupModel.getAsiList();

            if (gGSItemASIList) {
                for (var l = 0; l < gGSItemASIList.size(); l++) {
                    var gGSItemASIModel = gGSItemASIList.get(l);
                    //logDebug("Index of: " + clearFields.indexOf(gGSItemASIModel.getAsiName()));
                    //logDebug("clearFields: " + clearFields);
                    if (clearFields.indexOf(gGSItemASIModel.getAsiName()) > -1) {
                        logDebug("Clearing Checklist ASI value: " + gGSItemASIModel.getAsiName());
                        gGSItemASIModel.setAttributeValue("");
                    }
                    updGSItemASIList.add(gGSItemASIModel);
                    logDebug("new value: " + gGSItemASIModel.getAttributeValue())
                }
                gGSItemASISubGroupModel.setAsiList(updGSItemASIList);
                updGSItemASISubGroupList.add(gGSItemASISubGroupModel);
            }
        }
        gsItemModel.setItemASISubgroupList(updGSItemASISubGroupList);
        return gsItemModel;
    }
}

//Get the capTypeList  according to the guideSheetItem ASI field.
function getRecordTypeListFromGuideSheets(guideSheetList, standardFieldName) {
    var recordTypeList = aa.util.newArrayList();
    if (guideSheetList) {
        for (var i = 0; i < guideSheetList.size(); i++) {
            var gGuideSheetModel = guideSheetList.get(i);
            var gGuideSheetItemList = gGuideSheetModel.getItems();
            if (gGuideSheetItemList) {
                for (var j = 0; j < gGuideSheetItemList.size(); j++) {
                    var gGuideSheetItemModel = gGuideSheetItemList.get(j);
                    var gGSItemASISubGroupList = gGuideSheetItemModel.getItemASISubgroupList();
                    if (gGSItemASISubGroupList) {
                        for (var k = 0; k < gGSItemASISubGroupList.size(); k++) {
                            var gGSItemASISubGroupModel = gGSItemASISubGroupList.get(k);

                            var gGSItemASIList = gGSItemASISubGroupModel.getAsiList();
                            if (gGSItemASIList) {
                                for (var l = 0; l < gGSItemASIList.size(); l++) {
                                    var gGSItemASIModel = gGSItemASIList.get(l);
                                    if (String(standardFieldName) == gGSItemASIModel.getAsiName()) {
                                        var attributeValue = gGSItemASIModel.getAttributeValue();
                                        if (attributeValue) {
                                            if (recordTypeList.size() == 0) {
                                                recordTypeList.add(attributeValue);
                                            } else {
                                                if (!recordTypeList.contains(attributeValue)) {
                                                    recordTypeList.add(attributeValue);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return recordTypeList;
}

//create a child record
function createChildRecord(parentRecordID, recordType) {
    var newRecordID = null;
    if (recordType) {
        var recordTypeArray = recordType.split("/");
        if (recordTypeArray.length == 4) {
            var appCreateResult = aa.cap.createApp(recordTypeArray[0], recordTypeArray[1], recordTypeArray[2], recordTypeArray[3], null);
            if (appCreateResult.getSuccess()) {
                newRecordID = appCreateResult.getOutput();
                // create Detail Record
                capModel = aa.cap.newCapScriptModel().getOutput();
                capDetailModel = capModel.getCapModel().getCapDetailModel();
                capDetailModel.setCapID(newRecordID);
                aa.cap.createCapDetail(capDetailModel);

                //Child record linked parent record
                var linkResult = aa.cap.createAppHierarchy(parentRecordID, newRecordID);
                if (linkResult.getSuccess()) {
                    // Copy Parcels
                    var recordParcelResult = aa.parcel.getParcelandAttribute(parentRecordID, null);
                    if (recordParcelResult.getSuccess()) {
                        var parcels = recordParcelResult.getOutput().toArray();
                        for (var i in parcels) {
                            var newParcel = aa.parcel.getCapParcelModel().getOutput();
                            newParcel.setParcelModel(parcels[i]);
                            newParcel.setCapIDModel(newRecordID);
                            newParcel.setL1ParcelNo(parcels[i].getParcelNumber());
                            newParcel.setParcelNo(parcels[i].getParcelNumber());
                            aa.parcel.createCapParcel(newParcel);
                        }
                    }

                    // Copy Contacts
                    recordContactResult = aa.people.getCapContactByCapID(parentRecordID);
                    if (recordContactResult.getSuccess()) {
                        var contacts = recordContactResult.getOutput();
                        for (var j in contacts) {
                            var newContact = contacts[j].getCapContactModel();
                            newContact.setCapID(newRecordID);
                            aa.people.createCapContact(newContact);
                        }
                    }

                    // Copy Addresses
                    recordAddressResult = aa.address.getAddressByCapId(parentRecordID);
                    if (recordAddressResult.getSuccess()) {
                        var address = recordAddressResult.getOutput();
                        for (var k in address) {
                            var newAddress = address[k];
                            newAddress.setCapID(newRecordID);
                            aa.address.createAddress(newAddress);
                        }
                    }
                    logDebug("Successfully create child record : " + newRecordID);
                } else {
                    logDebug("Failed link new record: " + linkResult.getErrorMessage());
                }

            } else {
                logDebug("Failed creating new record: " + appCreateResult.getErrorMessage());
            }
        } else {
            logDebug("Failed create child record. The Record Type is incorrectly formatted: " + recordType);
        }
    }
    return newRecordID;
}

//get the InspSequenceNumber
function getInspSequenceNumber(vCapID, inspectionID) {
    var inspSequenceNumber = null;
    var inspectionResult = aa.inspection.getInspection(vCapID, inspectionID);
    if (inspectionResult.getSuccess()) {
        var inspectionModel = inspectionResult.getOutput().getInspection();
        var inspectionGroup = inspectionModel.getActivity().getInspectionGroup();
        var inspectionType = inspectionModel.getInspectionType();
        var inspectionTypesResult = aa.inspection.getInspectionType(inspectionGroup, inspectionType);
        if (inspectionTypesResult.getSuccess()) {
            var inspectionTypes = inspectionTypesResult.getOutput();
            if (inspectionTypes) {
                for (var i in inspectionTypes) {
                    var inspectionTypeModel = inspectionTypes[i];
                    if (inspectionTypeModel.getGroupCode().toUpperCase().equals(inspectionGroup.toUpperCase()) &&
                        inspectionTypeModel.getType().toUpperCase().equals(inspectionType.toUpperCase())) {
                        inspSequenceNumber = inspectionTypeModel.getSequenceNumber();
                    }
                }
            }
        } else {
            logDebug("Failed retrieving inspection Type: " + inspectionTypesResult.getErrorMessage());
        }
    }
    return inspSequenceNumber;
}

//creat a new pending inspection
function copyInspAsPendingToNewRecord(vCapID, inspSequenceNumber) {
    var newInspectionID = null;
    var inspectionModel = aa.inspection.getInspectionScriptModel().getOutput().getInspection();
    var activityModel = inspectionModel.getActivity();
    activityModel.setCapIDModel(vCapID);
    activityModel.setInspSequenceNumber(inspSequenceNumber);

    var pendingResult = aa.inspection.pendingInspection(inspectionModel);
    if (pendingResult.getSuccess()) {
        newInspectionID = pendingResult.getOutput();
        logDebug("Successfully create pending inspection: " + newInspectionID);
    } else {
        logDebug("Failed create pending inspection: " + pendingResult.getErrorMessage());
    }
    return newInspectionID;
}

function updateNewEnfIDAndNameForChild(parentCapId, childCapId, childType) {
    var capAldId = childCapId.getCustomID();
    //logDebug("capAldId="+capAldId);
    var parentAltId = parentCapId.getCustomID();
    //logDebug("parentAltId2="+parentAltId);

    var childList = getChildren(childType, parentCapId);

    var year = new Date().getFullYear().toString();
    var count = 1;
    if (childList) {
        count = childList.length;
        //logDebug("Child List ="+childList.length);
    }

    // update the alt id to align with the parent
    var newAltId = parentAltId + "-" + count;
    updateCapAltID(childCapId, newAltId);

    // update the record name to note the visit number
    var newAppName = "Visit #" + count;
    editAppName(newAppName, childCapId);

    return newAltId;
}

function updateCapAltID(vCapId, newAltId) {
    if (newAltId) {
        var result = aa.cap.updateCapAltID(vCapId, newAltId).getOutput();
        if (result) {
            logDebug("Update Alt ID Succesfully to: " + newAltId);
        } else {
            logDebug("Update Alt ID Failed.");
        }
    } else {
        logDebug("newAltId is null, cannot update record id.");
    }
}


function getJSONRulesForInspResult(rules, recordType, inspType) {

    logDebug("Params - Rules: " + rules + ", inspType: " + inspType + " typeof(recordType): " + typeof (recordType));
    if (rules && inspType) {
        logDebug("Did I get here?")
        if (typeof (recordType) == "object") {
            var appTypeArray = recordType.split("/");
            var thisRule;

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
            var thisRule = rules[appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
            var thisRule = rules[appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
            var thisRule = rules[appTypeArray[0] + "/*/*/" + appTypeArray[3]];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
            var thisRule = rules[appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
            thisRule = rules[appTypeArray[0] + "/*/" + appTypeArray[2] + "/*"];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
            thisRule = rules[appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*"];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
            thisRule = rules[appTypeArray[0] + "/" + appTypeArray[1] + "/*/*"];
            if (thisRule && thisRule[inspType]) return thisRule[inspType];

            logDebug("Searching for JSON Rules for " + appTypeArray[0] + "/*/*/*");
            thisRule = rules[appTypeArray[0] + "/*/*/*"];
            if (thisRule[inspType]) return thisRule[inspType];

        }
    }
}

/*===========================================
 
Title : getNextSequence
 
Purpose : gets the next number from the sequence generator
 
Author: Deanna Hoops        
 
Functional Area : sequences
 
Description : gets the next value from the sequence generator for the specified sequence and mask
 
Reviewed By: DMH
 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
 
General Purpose/Client Specific : General
 
Client developed for :
 
Parameters:
    seqType - type of sequence. i.e. agency
    seqName - name of sequence
    maskName - name of mask
 
=========================================== */
function getNextSequence(seqType, seqName, maskName) {
    try {
        var agencySeqBiz = aa.proxyInvoker.newInstance("com.accela.sg.AgencySeqNextBusiness").getOutput();
        var params = aa.proxyInvoker.newInstance("com.accela.domain.AgencyMaskDefCriteria").getOutput();
        params.setAgencyID(aa.getServiceProviderCode());
        params.setMaskName(maskName);
        params.setRecStatus("A");
        params.setSeqType(seqType);
        params.setSeqName(seqName);

        var seq = agencySeqBiz.getNextMaskedSeq("ADMIN", params, null, null);

        return seq;
    } catch (err) {
        return null;
    }
}

/** 
 * addRecordToMailerSet(recordIdObject,setPrefix,setType,setStatus);
 */
function addRecordToMailerSetCustom(recordIdObject, setPrefix, setType, setStatus) {
    // search for an open mailer set, if it doesn't exist, create a new one
    logDebug("Executing function: addRecordToMailerSetCustom...")
    var setId;
    var setHeaderSearch = aa.set.getSetHeaderScriptModel().getOutput();
    setHeaderSearch.setSetID(setPrefix);
    setHeaderSearch.setRecordSetType(setType);
    setHeaderSearch.setSetStatus(setStatus);
    var setSearchResult = aa.set.getSetHeaderListByModel(setHeaderSearch);
    if (setSearchResult.getSuccess) {
        var setArray = setSearchResult.getOutput();
        if (setArray) {
            setArray = setArray.toArray();
            logDebug("Sets found: " + setArray.length);
            for (s in setArray) {
                logDebug("setArray: " + setArray[s]);
                var thisSetHeader = setArray[s];
                setId = thisSetHeader.getSetID();
                logDebug("setId: " + setId);
                logDebug("setType: " + thisSetHeader.getSetType());
                logDebug("setRecordSetType: " + thisSetHeader.getRecordSetType());
                logDebug("setStatus: " + thisSetHeader.getSetStatus());
                continue;
            }
        } else {
            logDebug("No existing mailer sets found. Creating a new one. Set ID: " + setId);
        }
    }

    //if setId is null at this point then create a new set, else get the set that was found
    if (!setId) {
        var yy = startDate.getFullYear().toString();
        var mm = (startDate.getMonth() + 1).toString();
        if (mm.length < 2)
            mm = "0" + mm;
        var dd = startDate.getDate().toString();
        if (dd.length < 2)
            dd = "0" + dd;

        setId = setPrefix + "_" + mm + "/" + dd + "/" + yy;
    }

    // get or create the set and add the record to the set
    var mailerSet = new capSet(setId);
    if (mailerSet.empty) {
        // This is a new set that needs to be updated with informaiton
        mailerSet.type = setType;
        mailerSet.status = setStatus;
        mailerSet.comment = "Renewal mailer set created by renewal batch script process.";
        mailerSet.update();
        mailerSet.add(recordIdObject);
    } else {
        // This is an existing set so we will add the new record to it
        mailerSet.add(recordIdObject);
    }
    return true;
}