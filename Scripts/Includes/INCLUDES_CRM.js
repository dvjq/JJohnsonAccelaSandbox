//@ts-check
/**
 * CRM to Core SR integration scripts, executed when a new SR is created via construct.
 * 
 * @namespace WTUA:ServiceRequest/CRM/CRM/NA
 */

/**
 * 
 * 
 * @param {any} shadowIdObj 
 * @param {any} wfTaskId 
 * @param {any} wfStatusId 
 * @param {any} wfCommentText 
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * @returns 
 */
function processShadowRecord(shadowIdObj, wfTaskId, wfStatusId, wfCommentText) {
    var functionTitle = "processShadowRecord: ";

    // get JSON Config for CRM to Core Integration Rules
    eval(getScriptText("CONF_CRM_INTEGRATION_RULES", null, false));
    if (typeof rules == 'undefined') {
        logDebug(functionTitle + "Unable to retrieve rules from CONF_CRM_INTEGRATION_RULES script.");
        return;
    } else {
        logDebug(functionTitle + "Configuration CONF_CRM_INTEGRATION_RULES processed.");
    }

    try {
        // automation on Workflow Work Order / Work Order
        if (wfTaskId == "Investigation" && wfStatusId == "Work Order") {
            var newCoreCapId = autoCreateRecordFromCRM(shadowIdObj, rules);
            if (newCoreCapId) {
                logDebug(functionTitle + "New record id: " + newCoreCapId);
            } else {
                logDebug(functionTitle + "Function autoCreateRecordFromCRM(" + shadowIdObj + ")");
                logDebug(functionTitle + "didn't return a core CRM record ID. Exiting function.");
                return;
            }
        } else {
            logDebug(functionTitle + "Wrong Workflow Task/Status to create core record.");
            logDebug(functionTitle + "(WFT: " + wfTaskId + "; WFS: " + wfStatusId + ")");
            //return;
        }

        // add comment to records related to CRM shadow record
        if (wfTaskId == "Investigation" && wfStatusId == "Comment") {
            var childRecs = getRelatedRecdsDown("ServiceRequest/*/*/*", shadowIdObj);
            if (childRecs.length == 0) {
                logDebug(functionTitle + "No child records found for the shadow record " + shadowIdObj);
            }

            for (var c in childRecs) {
                var thisChildId = childRecs[c];
                createCapComment(wfCommentText, thisChildId);
                logDebug(functionTitle + "Successfully added comment to CRM Core Record " + thisChildId);
            }

        }
    } catch (err) {
        logDebug(functionTitle + "Error executing script. Error: " + err);
    }
}

/**
 * 
 * 
 * @param {any} parentChildArr 
 * @param {any} rulesArr 
 * @param {any} originalCapID 
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 */
function propogateRule(parentChildArr, rulesArr, originalCapID) {
    if (parentChildArr && rulesArr && originalCapID) {
        for (var x in parentChildArr) {
            var y = parentChildArr[x];
            var altId = y.getCustomID();
            logDebug("Propogating rules to record: " + altId);
            var c = aa.cap.getCapID(altId).getOutput();
            logDebug("c: " + c);
            if (c) {
                capId = c;


                var params = aa.util.newHashtable();
                addPropogationParams(params,c);

                for (var PropRule in rulesArr) {
                    var pr = rulesArr[PropRule];
                    if (pr.Task) {
                        if (pr.Activate_Task) {
                            activateTask(pr.Task);
                            logDebug("Task Activated: " + pr.Task);
                        }

                        if (pr.Assign_Task) {
                            assignTask(pr.Task, pr.Assign_Task);
                            logDebug("Task Assigned: Task: " + pr.Task + " User: " + pr.Assign_Task);
                        }

                        var comms = pr.Set_Comment_Static;
                        if (pr.Add_Standard_Comments) {
                            for (c in pr.Add_Standard_Comments) {
                                var add_StComment = pr.Add_Standard_Comments[c];
                                //get standard comment from group/type/commentid
                                var stdComment = getStandardComment(add_StComment.Type, add_StComment.Comment_ID);
                                if (stdComment != "") {
                                    if (comms != "") {
                                        comms += "<br />";
                                    }
                                    comms += stdComment;
                                }
                            }
                        }

                        comms = setParams(comms, params);

                        if (comms) {
                            if (comms != "") {
                                //editTaskComment(pr.Task, comms);
                                //logDebug("Comments Added To Workflow Task: " + pr.Task);
                                //logDebug("Comments Added: " + comms);
                                if (pr.Copy_To_Record_Comments) {
                                    createCapComment(comms, capId);
                                    logDebug("CapComment Created");
                                }
                            }
                        }

                        if (pr.Set_Status) {
                            if (pr.Disposition) {
                                switch (pr.Disposition.toString().toUpperCase()) {
                                    case "UPDATE":
                                        updateTask(pr.Task, pr.Set_Status, comms, "");
                                        logDebug("Task Status Updated: " + pr.Task + "/" + pr.Set_Status + ": " + comms);
                                        break;
                                    case "CLOSE":
                                        closeTask(pr.Task, pr.Set_Status, comms, "");
                                        logDebug("Task Closed: " + pr.Task + "/" + pr.Set_Status + ": " + comms);
                                        break;
                                    case "LOOP":
                                        loopTask(pr.Task, pr.Set_Status, comms, "");
                                        logDebug("Loop Task: " + pr.Task + "/" + pr.Set_Status + ": " + comms);
                                        break;
                                    case "BRANCH":
                                        branchTask(pr.Task, pr.Set_Status, comms, "");
                                        logDebug("Branching Task: " + pr.Task + "/" + pr.Set_Status + ": " + comms);
                                        break;
                                }
                            }
                        }
                    }

                    if (pr.Send_Notifications) {
                        propogationNotification(pr.Send_Notifications, c, params);
                    }

                    if (pr.Fire_WTUA_Event) {
                        runWTUAForWFTaskWFStatus(pr.Task, pr.WF_Process, pr.Set_Status, c, wfComment);
                    }
                }
            }
        }
        capId = originalCapID;
    }
    capId = originalCapID;
}

/**
 * 
 * 
 * @param {any} rules 
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 */
function process_WF_JSON_Rules(capIdObj, wfTask, wfStatus) {
    //get the app type array from the passed in cap object
    var capObj = aa.cap.getCap(capIdObj).getOutput();
    var appTypeArray = capObj.capType.toString().split("/");
    var rules = getScriptText("CONF_" + appTypeArray[0].toUpperCase() + "_WORKFLOW_RULES");
    rules = JSON.parse(rules);

    logDebug("process_WF_JSON_Rules: MODULE: " + appTypeArray[0].toUpperCase());
    logDebug("process_WF_JSON_Rules: INPUT: wfTask: " + wfTask);
    logDebug("process_WF_JSON_Rules: INPUT: wfStatus: " + wfStatus);
    logDebug("process_WF_JSON_Rules: INPUT: record: " + capIdObj.customID);

    //check to see if there are rules set for this group. If not, exit
    if (rules === undefined) {
        logDebug("*** There are no rules defined for this module. ***");
        return;
    }

    if (rules) {
        if (typeof (appTypeArray) == "object") {
            logDebug("Processing WF JSON Rules for */*/*/*");
            process_WF_JSON_Rules_Real(rules, "*/*/*/*", wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for */*/*/*");

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/*/*/*");
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/*/*/*", wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/*/*/*");

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/" + appTypeArray[1] + "/*/*", wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*", wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/*/" + appTypeArray[2] + "/*", wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3], wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/*/*/" + appTypeArray[3], wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/*/*/" + appTypeArray[3]);

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3], wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);

            logDebug("Processing WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
            process_WF_JSON_Rules_Real(rules, appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3], wfTask, wfStatus);
            logDebug("Processed WF JSON Rules for " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
        }
    }
}

/**
 * 
 * 
 * @param {any} rules 
 * @param {any} RecordTypeAlias 
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 */
function process_WF_JSON_Rules_Real(rules, RecordTypeAlias, task, status) {
    logDebug("Processing Rules...");
    logDebug("INPUT:RecordTypeAlias: " + RecordTypeAlias);
    logDebug("INPUT:Task: " + task);
    logDebug("INPUT:Status: " + status);
    var originalCapID = capId;

    if (typeof task == "undefined") {
        task = null;
    }

    if (typeof status == "undefined") {
        status = null;
    }

    if (rules) {
        var rule = rules[RecordTypeAlias];
        if (rule) {
            logDebug("We Have Rules For This Record Type: " + RecordTypeAlias);

            for (var i in rule) {
                var r = rule[i];

                if (!r.Task) {
                    r.Task = task;
                }
                if (!r.Status) {
                    r.Status = status;
                }

                logDebug("r.Task:" + r.Task);
                logDebug("r.Status:" + r.Status);

                if (task.toString().toUpperCase() == r.Task.toString().toUpperCase() && status.toString().toUpperCase() == r.Status.toString().toUpperCase()) {
                    logDebug("We Have Rules For This Task & Status : Task='" + r.Task.toString() + "' Status='" + r.Status.toString() + "'");
                    if (r.Propogation_Rules_Current_Record) {
                        logDebug("We Have Propogation Rules For The Current Record");
                        var singleArrayOfCap = [originalCapID];
                        propogateRule(singleArrayOfCap, r.Propogation_Rules_Current_Record, originalCapID);
                    }

                    if (r.Propogation_Rules_Other_Records) {
                        for (var pr in r.Propogation_Rules_Other_Records) {
                            var z = r.Propogation_Rules_Other_Records[pr];

                            if (z.Record_Type && z.Propogation_Rules) {
                                logDebug("We Have A Record Type & Propogation Rules");

                                var parents = getParentsWithExclusions(z.Record_Type, z.Record_Types_Excluded);
                                propogateRule(parents, z.Propogation_Rules, originalCapID);


                                var children = getChildrenWithExclusions(z.Record_Type, capId, z.Record_Types_Excluded);
                                propogateRule(children, z.Propogation_Rules, originalCapID);
                            }
                        }
                    }

                    var params = aa.util.newHashtable();
                    addPropogationParams(params,originalCapID);

                    //Add Record Comments
                    if (r.Add_Record_Comments) {
                        logDebug("Record Comments");
                        for (var c in r.Add_Record_Comments) {
                            var co = r.Add_Record_Comments[c];
                            if (co.Record_Types) {
                                var comm = getStandardComment(co.Type, co.Comment_ID, params);
                                if (comm != "") {
                                    logDebug("We have Comments to Add to Record");
                                    for (var rt in co.Record_Types) {
                                        var RecType = co.Record_Types[rt];
                                        var coParents = getParents(RecType);
                                        var coChildren = getChildren(RecType);

                                        if (coParents) {
                                            logDebug("Rents....");
                                            addRecordComments(coParents, comm, null);
                                            logDebug("Record Comment Added To Parents");
                                        }
                                        if (coChildren) {
                                            addRecordComments(coChildren, comm, null);
                                            logDebug("Record Comment Added To Children");
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //Send Notifications
                    if (r.Send_Notifications) {
                        propogationNotification(r.Send_Notifications, capId, params);
                    }

                    //Update ASI Mapping
                    if (r.Update_ASI) {
                        logDebug("Update ASI");
                        for (var v in r.Update_ASI) {
                            var zz = r.Update_ASI[v];

                            if (zz) {
                                var rType = zz.Source_Record_Type;
                                if (rType) {
                                    if (zz.Push_All_ASI_To_Record_Types) {
                                        for (var m in zz.Push_All_ASI_To_Record_Types) {
                                            var n = zz.Push_All_ASI_To_Record_Types[m];

                                            //Check Match On Parents
                                            var p = getParents(n);
                                            for (var l in p) {
                                                var b = p[l];
                                                copyASIFields(capId, getApplication(b.getCustomID()));
                                                logDebug("Pushed All ASI To Parent");
                                            }

                                            //Check Match On Children
                                            var cc = getChildren(n);
                                            for (var f in cc) {
                                                var d = cc[f];
                                                copyASIFields(capId, getApplication(d.getCustomID()));
                                                logDebug("Pushed All ASI To Children");
                                            }
                                        }
                                    }

                                    if (zz.Updates) {
                                        for (var k in zz.Updates) {
                                            var source = zz.Updates[k];

                                            var s_ASI_Value = source.Static_Value;
                                            if (!s_ASI_Value) {
                                                s_ASI_Value = getAppSpecific(source.ASI_Group + ":" + source.ASI_Field);
                                            }

                                            if (s_ASI_Value) {
                                                if (source.Update_To) {
                                                    for (var t in source.Update_To) {
                                                        var u = source.Update_To[t];

                                                        //Check Match On Parents
                                                        var pp = getParents(rType);
                                                        editASI(pp, u.ASI_Group, u.ASI_Field, s_ASI_Value);
                                                        logDebug("Parent ASI Updated");

                                                        //Check Match On Children
                                                        var ccc = getChildren(rType);
                                                        editASI(ccc, u.ASI_Group, u.ASI_Field, s_ASI_Value);
                                                        logDebug("Child ASI Updated");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
}

/**
 * Checks to see if the passed in string is empty or not.
 * 
 * @param {any} str 
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * @returns {boolean} true or false if the string is empty or not.
 */
function isEmpty(str) {
    return (!str || 0 === str.length);
}

/**
 * Auto create service request, work order or enforcement record from new CRM shadow record
 * @example The "Foreign Association" record type mapping must be configured on the CRM Request Type. 
 * The integration saves the foreign association record type on the CRM shadow record custom field: Workorder Record Type
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * 
 * @param {any} crmRecordObj Shadow record Object 
 * @param {any} rules 
 * @returns {string} Core Record Id
 */
function autoCreateRecordFromCRM(crmRecordObj, rules) {
    var functionTitle = "autoCreateRecordFromCRM: ";
    logDebug(functionTitle + "Shadow Record ID: " + crmRecordObj);
    try {
        // Get target core record type from shadow record CustomField.Workorder Record Type
        var crmReqType = getAppSpecific("Request Type");
        var coreRecType = getAppSpecific("Workorder Record Type");
        logDebug(functionTitle + "Shadow Record Workorder Record Type: " + coreRecType);

        if (isEmpty(coreRecType)) {
            logDebug(functionTitle + "The Core Record Type could not be created.");
            logDebug(functionTitle + "No record type has been mapped.");
            logDebug(functionTitle + "Check Request Type Foreign Association config in CRM: " + crmReqType);
            logDebug(functionTitle + "Exiting.");
            return false;
        } else {
            logDebug(functionTitle + "Begin");
            //check if the shadow record has already created a core SR record (otherwise it will create dups)
            var coreRecordID = getAppSpecific("Core Request ID");
            if (!isEmpty(coreRecordID)) {
                logDebug(functionTitle + "Core record already exists: " + coreRecordID);
                logDebug(functionTitle + "Exiting.");
                return;
            }

            //update contact types from individual to "Complainant"
            editContactType("individual", "Complainant");

            //create the core record as a child of the CRM shadow record
            var coreReqTypeArr = coreRecType.split("/");

            coreReqTypeArr.forEach(function (str) {
                logDebug("Core Request Type part: " + str);
            });
            logDebug("CRM Req Type: " + crmReqType);

            var coreRecordObj = createChild(coreReqTypeArr[0], coreReqTypeArr[1], coreReqTypeArr[2], coreReqTypeArr[3], crmReqType);
            if (coreRecordObj) {
                //var crmRecordObj = getApplication(crmCapId);

                //update the Core Request ID on the CRM shadow record custom fields
                coreRecordID = coreRecordObj.getCustomID();
                logDebug(functionTitle + "Core Request ID: " + coreRecordID);
                editAppSpecific("Core Request ID", coreRecordID);

                // update location and request type on target core record
                var location = getAppSpecific("Location");
                logDebug(functionTitle + "Shadow Record Custom Field - Location: " + location);
                createASIField(crmRecordObj, coreRecordObj, "Location","CRM Location", location);
                //editAppSpecific("Location", location, coreRecordObj);
                logDebug(functionTitle + "Shadow Record Custom Field - Request Type: " + crmReqType);
                createASIField(crmRecordObj, coreRecordObj, "Request Type", "CRM Request Type", crmReqType);
                //editAppSpecific("Request Type", crmReqType, coreRecordObj);

                //copy the CRM request description to the core record description

                var crmRequestDesc = workDescGet(crmRecordObj);
                logDebug(functionTitle + "Shadow Record Description: " + crmRequestDesc);
                editRecordDescription(crmRequestDesc, coreRecordObj);

                //update Core SR custom fields from CRM
                copyCustomFieldsFromCRM(crmRecordObj, coreRecordObj, rules);
                logDebug(functionTitle + "Copied Custom Fields from Shadow Record to Core Record.");

                //copy any comments from CRM shadow record to the Core SR
                copyRecordComments(crmRecordObj, coreRecordObj);
                logDebug(functionTitle + "Copied Comments from Shadow Record to Core Record.");

                //copy attachments from CRM shadow record
                copyDocuments(crmRecordObj, coreRecordObj);
                logDebug(functionTitle + "Copied Documents from Shadow Record to Core Record.");

                //link contacts to ref
                createRefContactsFromCapContactsAndLink(coreRecordObj, null, null, false, false, comparePeopleStandard);
                logDebug(functionTitle + "Linked Core Record Contacts to Reference Contacts.");

                //validate CRM address before creating child
                var validateAddress = validateCRMAddress(crmRecordObj, coreRecordObj);

                logDebug("validateAddress: " + validateAddress);

                if (validateAddress) {

                    //copy the address from the shadow record to the core record
                    copyAddresses(crmRecordObj, coreRecordObj);

                    //get the parcel and owner for the validated address
                    copyParcels(crmRecordObj, coreRecordObj);

                    copyOwner(crmRecordObj, coreRecordObj);

                }




                // get rules
                var crmChildTypeRules = findRecordTypeRule(rules, coreReqTypeArr);


                logDebug(functionTitle + "CRM Address: " + validateAddress);
                //if the address is not validated, update SR workflow = "Address Validation Required"
                if (!validateAddress) {
                    var crmAddress = getAppSpecific("Location", crmRecordObj);
                    //logDebug(functionTitle + "CRM Child Type Rules: " + )
                    var initialWfTask;
                    try {
                        initialWfTask = crmChildTypeRules.Propogation_Rules.Initial_Task;
                    } catch (err) {
                        initialWfTask = "Intake";
                    } //for backward compatibility
                    logDebug(functionTitle + "Initial Workflow Task: " + initialWfTask);
                    updateTask(initialWfTask, "Address Validation Required", "Address could not be validated: " + crmAddress, "Updated via script", "", coreRecordObj);
                    logDebug(functionTitle + "Address Not Validated. WFT set to 'Address Validation Required'.");
                } else {
                    //propogate workflow based on JSON rules
                    updateCoreSRWorkflow(crmRecordObj, coreRecordObj, rules);
                    logDebug(functionTitle + "Workflow Propogation based on CONF_SR_WORKFLOW_RULES.");

                    if (crmChildTypeRules.Propogation_Rules.Fire_ASA_Event) {

                        runASAForCapId(coreRecordObj);

                    }
                }
            }
            return coreRecordObj;
        }
    } catch (err) {
        logDebug("Error creating core SR type from CRM: " + err);
    }
}

/**
 * Gets all children records.
 * 
 * @param {any} recType - can be "* / * / * / *" (without the spaces)
 * @param {object} recordIdObj - the Record ID Object
 * @returns 
 */
function getRelatedRecdsDown(recType, recordIdObj) {
    try {
        var itemCap = recordIdObj;
        if (arguments.length == 2) {
            itemCap = arguments[1]; // use cap ID specified in args
        }
        var relArr = getChildren(recType, itemCap);
        var allKids = [];
        var cnt = 0;
        var i = 0;
        var m = 0;
        for (var r in relArr) {
            logDebug("kid added: " + relArr[r].getCustomID());
            allKids[cnt] = relArr[r];
            cnt++;
        }
        while (allKids[m]) {
            var thisCapId = allKids[m];
            var hierArr = getChildren(recType, thisCapId);
            for (var x in hierArr) {
                var childAlreadyThere = false;
                for (var mm in allKids)
                    if (allKids[mm] == hierArr[x]) childAlreadyThere = true;
                if (!childAlreadyThere) {
                    allKids[cnt] = hierArr[x];
                    cnt++;
                }
            }
            m++;
        }
        return allKids;
    } catch (err) {
        logDebug("getRelatedRecdsDown: Error Message: " + err.message);
        logDebug(err.stack);
    }
}

/**
 * Updates the Core SR workflow based on rules defined in CONF_CRM_INTEGRATION_RULES
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * @example 
    var rules = {
    "ServiceRequest///": {
        "Propogation_Rules": {
            "Update_Core_WF": true,
            "Task": "Intake",
			"Set_Status": "Investigation",
			"Initial_Task":"Intake",
            "Fire_WTUA_Event": true,
            "Fire_ASA_Event":true
        }
    }
    var coreReqCapId = createChild(...)
    updateCoreSRWorkflow(capId, coreReqCapId);
 *  @param crmCapId - capId of the CRM shadow record
 *  @param coreCapId - capId of the Core Service Request
 */
function updateCoreSRWorkflow(crmRecordObj, coreRecordObj, rules) {

    //get CRM to core custom field map from CONF_CRM_INTEGRATION_RULES
    var coreRecType = getAppSpecific("Workorder Record Type", crmRecordObj);
    var coreRecTypeArr = coreRecType.split("/");
    var coreRecTypeString = coreRecTypeArr[0] + "/" + coreRecTypeArr[1] + "/" + coreRecTypeArr[2] + "/" + coreRecTypeArr[3];
    if (!rules) {
        logDebug("WARNING: CRM rules have not been defined. Configure the CONF_CRM_INTEGRATION_RULES JSON to configure the CRM to Core Integration.");
        return;
    }

    var rule = findRecordTypeRule(rules, coreRecTypeArr);
    if (rule.Update_Core_WF) {
        logDebug("Updating core record workflow.");
        if (rule.Set_Status) {
            var holdObj = capId;
            capId = coreRecordObj;
            closeTask(rule.Task, rule.Set_Status, "Auto routed request from CRM.", "Updated via script.");
            capId = holdObj;
        }
        if (rule.Fire_WTUA_Event) {
            runWTUAForWFTaskWFStatus(rule.Task, null, rule.Set_Status, coreRecordObj, '');
        }
    }
}


function createASIField(vSourceCapId, vTargetCapId, vSourceFieldName, vTargetFieldName, vFieldValue) {

    var targetCapId = vTargetCapId;
    var targetCap = aa.cap.getCap(vTargetCapId).getOutput();
    var targetCapType = targetCap.getCapType();
    var targetCapTypeString = targetCapType.toString();
    var targetCapTypeArray = targetCapTypeString.split("/");

    var sourceASIResult = aa.appSpecificInfo.getByCapID(vSourceCapId)

    if (sourceASIResult.getSuccess()) {
        var sourceASI = sourceASIResult.getOutput();
    } else {
        logDebug("**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
        return false
    }

    for (ASICount in sourceASI) {
        thisASI = sourceASI[ASICount];
        if (vSourceFieldName == thisASI.getCheckboxDesc()) {
            thisASI.setPermitID1(targetCapId.getID1())
            thisASI.setPermitID2(targetCapId.getID2())
            thisASI.setPermitID3(targetCapId.getID3())
            thisASI.setPerType(targetCapTypeArray[1])
            thisASI.setPerSubType(targetCapTypeArray[2])
            thisASI.setCheckboxDesc(vTargetFieldName)
            thisASI.setChecklistComment(vFieldValue);
            aa.cap.createCheckbox(thisASI)
            logDebug("Successfully updated custom field: " + vTargetFieldName + "=" + vFieldValue);
        }
    }
}



/**
 * Updates Core SR custom fields from the shadow record custom list CRM INFO-CUSTOM
 * CRM SR custom field names must match Core SR custom field names exactly in order to sync
 * @example 
    var rules = 
    {
      "ServiceRequest/Graffiti/Graffiti/NA": {
        "customFieldMap": {
          "Where in the Public Right of Way?": "Location ROW"
        }
      }
    };
    var coreReqCapId = createChild(...)
    copyCustomFieldsFromCRM(capId, coreReqCapId);
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * @param crmCapId - capId of the CRM shadow record
 * @param coreCapId - capId of the Core Service Request
 * @param rules - the CRM Integration rule set
 */
function copyCustomFieldsFromCRM(crmCapId, coreCapId, rules) {
    var functionTitle = "copyCustomFieldsFromCRM: ";
    try {

        // validate parameters
        if (!crmCapId) {
            logDebug(functionTitle + "Error in function updateCustomFieldsFromCRM(): CRM CapId Object is required: " + crmCapId);
            return false;
        }
        if (!coreCapId) {
            logDebug(functionTitle + "Error in function updateCustomFieldsFromCRM(): Core CapId Object is required: " + coreCapId);
            return false;
        }

        //get CRM to core custom field map from CONF_CRM_INTEGRATION_RULES
        var coreRecType = getAppSpecific("Workorder Record Type", crmCapId);
        var coreRecTypeArr = coreRecType.split("/");
        var coreRecTypeString = coreRecTypeArr[0] + "/" + coreRecTypeArr[1] + "/" + coreRecTypeArr[2] + "/" + coreRecTypeArr[3];
        if (!rules) {
            logDebug(functionTitle + "WARNING: CRM rules have not been defined. Configure the CONF_CRM_INTEGRATION_RULES JSON to configure the CRM to Core Integration.");
        }
        var crmRules = findRecordTypeRule(rules, coreRecTypeArr);
        var customFieldMap;
        if (crmRules) {
            customFieldMap = crmRules.Custom_Field_Map;
        }

        //copy Core SR custom fields from the shadow record custom list CRM INFO-CUSTOM.
        var crmCustomFieldArray = loadASITable("CRM INFO-CUSTOM", crmCapId);
        for (var row in crmCustomFieldArray) {
            // get the value from ASIT to compare
            var crmFieldName = crmCustomFieldArray[row].Name; //logDebug("crmFieldName: " + crmFieldName);
            var crmFieldVal = crmCustomFieldArray[row].Value; //logDebug("crmFieldVal: " + crmFieldVal);

            //if a custom field mapping exists use the custom mapping, 
            //else update the Core SR custom fields that match the CRM custom fields
            var coreFieldName = crmFieldName;
            if (customFieldMap && customFieldMap[crmFieldName]) {
                coreFieldName = customFieldMap[crmFieldName];
                logDebug(functionTitle + "coreFieldName from map: " + coreFieldName);
            } else {
                logDebug(functionTitle + "attempt to map exact match");
            }
            // update the Core SR custom fields that match the CRM custom fields
            editAppSpecific(coreFieldName, crmFieldVal, coreCapId);
        }
    } catch (err) {
        logDebug(functionTitle + "**ERROR updating custom fields from CRM shadow record. " + err);
    }
}

/**
 * Checks for a valid address created from CRM. 
 * If no address was validated, try to perform a fuzzy search with the CRM full address string.
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 */
function validateCRMAddress(crmRecordObj, coreRecordObj) {
    var functionTitle = "validateCRMAddress: ";
    var addressValidated = false;
    var addressValidatedLog;

    //first check if there is already a valid address, else try to validate again
    var addresses = getRecordAddresses();
    if (addresses && addresses.length > 0) { // if there is an address on the shadow record (it was validated by CRM integration)
        logDebug(functionTitle + "Address was validated by the CRM Integration.");
        addressValidated = true;
    } else { // else if no address on shadow record (it could not be validated, so we will try harder)

        var crmAddressString = getAppSpecific("Location"); //crm address saved in shadow custom field.Location
        var searchAddresses = parseAndSearchAddrFromCRM(crmAddressString, true); // enable fuzzy search because google maps doesn't match ArcGIS

        // TO DO: if the search returned 0 OR multiple matches, flag it for human validation
        if (searchAddresses.indexOf("WARNING") > -1) { //
            addressValidatedLog = searchAddresses;
            logDebug(functionTitle + ": " + addressValidatedLog);
            createCapComment(addressValidatedLog, coreRecordObj);

            return false;
        }

        // if ONE valid address found
        if (searchAddresses) { //
            var refAddress = searchAddresses[0];
            refAddress.setPrimaryFlag("Y");


            var addressModel = warpRefAddressModelToAddressModel(refAddress);
            var newAddrResult = aa.address.createAddressWithAPOAttribute(capId, addressModel);
            if (newAddrResult.getSuccess()) {
                var newAddr = newAddrResult.getOutput();
                logDebug(functionTitle + "Successfully added address to record: " + newAddr);
                //get parcel for the validate address
                var addrUID = refAddress.getUID();

                //logDebug("Attributes: ");
                var addrAttributes = refAddress.getAttributes();
                var addrAttrArray = addrAttributes.toArray()

                // get the parcel and owner using address data
                addParceAndOwnerByAddress(capId, refAddress.houseNumberStart, refAddress.houseNumberEnd, refAddress.streetDirection, refAddress.streetName, refAddress.streetSuffix, refAddress.unitStart, refAddress.unitEnd, refAddress.city);
                copyParcelGisObjects();

                addressValidated = true;
            } else {
                logDebug(functionTitle + "ERROR creating record address from reference address. " + newAddrResult.getErrorMesssage());
            }
        }
    }
    return addressValidated;
}

function warpRefAddressModelToAddressModel(vRefAddressModel) {


    // create an address model so we can use aa.address.createAddressWithAPOAttribute(capId, address model)
    var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
    //newAddressModel.setRefAddressModel(refAddress);

    //exploreObject(newAddressModel)

    newAddressModel.setFullAddress(vRefAddressModel.getFullAddress());
    newAddressModel.setAddressLine1(vRefAddressModel.getAddressLine1());
    newAddressModel.setAddressLine2(vRefAddressModel.getAddressLine2());
    newAddressModel.setCounty(vRefAddressModel.getCounty());
    newAddressModel.setHouseNumberStart(vRefAddressModel.getHouseNumberStart());
    newAddressModel.setHouseNumberEnd(vRefAddressModel.getHouseNumberEnd());
    newAddressModel.setHouseNumberAlphaStart(vRefAddressModel.getHouseNumberAlphaStart());
    newAddressModel.setHouseNumberAlphaEnd(vRefAddressModel.getHouseNumberAlphaEnd());
    newAddressModel.setLevelPrefix(vRefAddressModel.getLevelPrefix());
    newAddressModel.setLevelNumberStart(vRefAddressModel.getLevelNumberStart());
    newAddressModel.setLevelNumberEnd(vRefAddressModel.getLevelNumberEnd());
    newAddressModel.setValidateFlag(vRefAddressModel.getValidateFlag());
    newAddressModel.setStreetDirection(vRefAddressModel.getStreetDirection());
    newAddressModel.setStreetPrefix(vRefAddressModel.getStreetPrefix());
    newAddressModel.setStreetName(vRefAddressModel.getStreetName());
    newAddressModel.setStreetSuffix(vRefAddressModel.getStreetSuffix());
    newAddressModel.setUnitType(vRefAddressModel.getUnitType());
    newAddressModel.setUnitStart(vRefAddressModel.getUnitStart());
    newAddressModel.setUnitEnd(vRefAddressModel.getUnitEnd());
    //newAddressModel.setStreetSuffixdirection(vRefAddressModel.getStreetSuffixDirection()); 
    newAddressModel.setCountryCode(vRefAddressModel.getCountryCode());
    newAddressModel.setCity(vRefAddressModel.getCity());
    newAddressModel.setState(vRefAddressModel.getState());
    newAddressModel.setZip(vRefAddressModel.getZip());
    //newAddressModel.setRefAddressId(vRefAddressModel.getAddressID()); 
    newAddressModel.setAuditStatus("A");
    newAddressModel.setAuditID("ADMIN");
    newAddressModel.setAuditDate(aa.util.now());
    newAddressModel.setAddressType(vRefAddressModel.getAddressType()); // doesn't work, have to set it below. 
    newAddressModel.setPrimaryFlag("Y");
    newAddressModel.setAttributes(vRefAddressModel.getAttributes());

    return newAddressModel;

}

function addParceAndOwnerByAddress(vCapId, vAddressStart, vAddressEnd, vDirection, vStreetName, vSuffix, vUnitStart, vUnitEnd, vCity) {
    var parcel = null;
    var addressStart = vAddressStart || null;
    var addressEnd = vAddressEnd || null;
    var direction = vDirection || null;
    var streetName = vStreetName || null;
    var suffix = vSuffix || null;
    var unitStart = vUnitStart || null;;
    var unitEnd = vUnitEnd || null;
    var city = vCity || null;
    var ownerName = null;

    var getParcelResult = aa.parcel.getParceListForAdmin(parcel, addressStart, addressEnd, direction, streetName, suffix, unitStart, unitEnd, city, ownerName);
    if (getParcelResult.getSuccess()) {

        var parcelArray = getParcelResult.getOutput();
        if (parcelArray.length > 0) {

            logDebug("Found parcel count: " + parcelArray.length);

            for (par in parcelArray) {
                var thisParcel = parcelArray[par];
                var thisParcelModel = thisParcel.getParcelModel();
                //var thisOwnerModel = thisParcel.getOwnerModel();

                /*exploreObject(thisParcel);
                exploreObject(thisParcelModel);
                exploreObject(thisOwnerModel);*/

                var capParModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(vCapId, thisParcelModel).getOutput()

                var createPMResult = aa.parcel.createCapParcel(capParModel);
                if (createPMResult.getSuccess())
                    logDebug("created CAP Parcel");
                else {
                    logDebug("**WARNING: Failed to create the cap Parcel " + createPMResult.getErrorMessage());
                }
            }

            // Now get the owners for each parcel that was added to the record
            var parcelListResult = aa.parcel.getParcelDailyByCapID(vCapId, null);
            if (parcelListResult.getSuccess())
                var parcelList = parcelListResult.getOutput();
            else {
                logDebug("**ERROR: Failed to get Parcel List " + parcelListResult.getErrorMessage());
                return false;
            }

            for (var thisP in parcelList) {
                var ownerListResult = aa.owner.getOwnersByParcel(parcelList[thisP]);
                if (ownerListResult.getSuccess())
                    var ownerList = ownerListResult.getOutput();
                else {
                    logDebug("**ERROR: Failed to get Owner List " + ownerListResult.getErrorMessage());
                    return false;
                }

                for (var thisO in ownerList) {
                    ownerList[thisO].setCapID(vCapId);
                    createOResult = aa.owner.createCapOwnerWithAPOAttribute(ownerList[thisO]);

                    if (createOResult.getSuccess())
                        logDebug("Created CAP Owner");
                    else {
                        logDebug("**WARNING: Failed to create CAP Owner " + createOResult.getErrorMessage());
                    }
                }
            }
        }
    }
}

/**
 * Parses a CRM formatted address into distinct elements and searches for a Core reference address by house number and street name.
 * @memberof WTUA:ServiceRequest/CRM/CRM/NA
 * @example 
 var crmFormattedAddress = "316 Petaluma Boulevard North, Petaluma, CA, United States";
 var addrResults = 
 * @param {string} crmAddress CRM formatted address string
 * @param {boolean} enableFuzzySearch - flag to enable/disable fuzzy searching. Default is 'false'.
 */
function parseAndSearchAddrFromCRM(crmAddress, enableFuzzySearch) {
    var functionTitle = "parseAndSearchAddrFromCRM";
    //set enable fuzzy search to pass on to getRefAddressByHouseNbrStreetName()
    var addressSearch;
    var searchAddressLog = "";
    if (!enableFuzzySearch) {
        enableFuzzySearch = false;
    }

    logDebug(functionTitle + "CRMADDRESS: " + crmAddress);

    //split string on commas for different parts of address
    var addrParts = crmAddress.split(',');

    //split first address part on whitespace for street address parts
    var strAddrParts = addrParts[0].split(' ');
    var strAddrIndex = 1;
    var hseNum = 0;
    var firstAddrPart = strAddrParts[0];

    //get house number
    if (isNaN(firstAddrPart)) {
        strAddrIndex = 0;
    } else {
        hseNum = strAddrParts[0] || '';
    }
    logDebug(functionTitle + " hseNum: " + hseNum);

    //get street name
    var strName = '';
    for (var i = strAddrIndex; i < strAddrParts.length - 1; i++) {
        strName += strAddrParts[i] + ' ';
    }
    strName = strName.trim();
    logDebug(functionTitle + " strName: " + strName);

    //get city
    var city = addrParts[1] || '';
    logDebug(functionTitle + " city: " + city);

    //get state
    var state = addrParts[2] || '';
    logDebug(functionTitle + " state: " + state);

    //get ZIP code
    var zip = addrParts[3] || '';
    logDebug(functionTitle + " ZIP: " + zip);

    //get country
    var country = addrParts[4] || '';
    logDebug(functionTitle + " country: " + country);

    if (strName != '') {
        searchAddressLog += "\r\nAddress Search 1: " + hseNum + " " + strName;
        logDebug(functionTitle + ": " + searchAddressLog);
        try {
            addressSearch = getRefAddressByHouseNbrStreetName(hseNum, strName, enableFuzzySearch);
        } catch (err) {
            logDebug(functionTitle + "Error searching for address.");
            logDebug(functionTitle + "Message: " + err);
        }
    } else {
        logDebug(functionTitle + "Unable to search without a street name.");
    }

    // if no match found, try parsing the address differently
    // get hse nbr from part one, and street name from part 3
    // to support google addresses like: 444 S 5th, when the agency data uses 444 5th
    if (!addressSearch) {
        logDebug(functionTitle + " Attempting second with different address parse.");
        logDebug(functionTitle + " hseNum: " + hseNum);

        //get street name
        var strName = '';
        strName = strAddrParts[2] + ' ';
        strName = strName.trim();
        logDebug(functionTitle + " strName: " + strName);
        searchAddressLog += "\r\nAddress Search 2: " + hseNum + " " + strName;
        logDebug(functionTitle + ": " + searchAddressLog);
        try {
            addressSearch = getRefAddressByHouseNbrStreetName(hseNum, strName, enableFuzzySearch);
        } catch (err) {
            logDebug(functionTitle + "Error searching for address.");
            logDebug(functionTitle + "Message: " + err);
        }
    } else {
        logDebug(functionTitle + "Unable to search without a street name.");
    }

    if (!addressSearch) {
        searchAddressLog += "\r\nWARNING: Address Validation Required. No ref address could be found for: " + crmAddress;
        return searchAddressLog;
    }
    if (addressSearch.length > 1) {
        searchAddressLog += "\r\nWARNING: Address Validation Required. Multiple addresses found for: " + crmAddress;
        searchAddressLog += "\r\n\r\nPotential matches: \r\n";
        for (var ra in addressSearch) {
            refAddress = addressSearch[ra];
            searchAddressLog += "\r\n" + refAddress.getHouseNumberStart() + " " + refAddress.getStreetName() + ", Unit: " + refAddress.getUnitStart() + ", " + refAddress.getCity();
        }
        return searchAddressLog;
    }

    return addressSearch;
}

/**
 * test for class
 * 
 * @param {string} title 
 * @param {[string]} arrayset 
 * @param {string} frog 
 * @returns string
 */
function testForClass(title, arrayset, frog) {
    var retVal = "";

    retVal = title;
    for (var i = 0; i < arrayset.length; i++) {
        retVal += title + arrayset + frog;
    }

    return retVal;
}

/**
 * 
 * 
 * @param {any} rules 
 * @param {any} coreRecTypeArr 
 * @returns {any} specific record type rule
 */
function findRecordTypeRule(rules, coreRecTypeArr) {
    //only return the first match
    var rule;

    rule = rules["*/*/*/*"];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/*/*/*"];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/" + coreRecTypeArr[1] + "/*/*"];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/" + coreRecTypeArr[1] + "/" + coreRecTypeArr[2] + "/*"];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/*/" + coreRecTypeArr[2] + "/*"];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/*/" + coreRecTypeArr[2] + "/" + coreRecTypeArr[3]];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/*/*/" + coreRecTypeArr[3]];
    if (rule) {
        return rule;
    }

    rule = rules[coreRecTypeArr[0] + "/" + coreRecTypeArr[1] + "/*/" + coreRecTypeArr[3]];
    if (rule) {
        return rule;
    }

    rule = rules[appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]];
    if (rule) {
        return rule;
    }
    return rule;
}

/**
 * 
 * 
 * @param {any} text 
 * @param {any} params 
 * @returns 
 */
function setParams(text, params) {
    if (text) {
        var keySet = params.keySet().toArray();
        for (var x in keySet) {
            var k = keySet[x];
            var key = k;
            var value = params.get(key);
            text = text.toString().replace(key, value);
        }
        logDebug("Comment = " + text);
    } else {
        text = "";
    }
    return text;
}

/**
 * 
 * 
 * @param {any} type 
 * @param {any} commentID 
 * @param {any} params 
 * @returns 
 */
function getStandardComment(type, commentID, params) {
    var comment = "";
    var scBusResult = aa.proxyInvoker.newInstance("com.accela.aa.aamain.review.StandardCommentBusiness");
    if (scBusResult.getSuccess()) {
        var scBus = scBusResult.getOutput();

        var scs = scBus.getStandardCommentByType(aa.getServiceProviderCode(), type);
        if (scs) {
            var a = scs.toArray();
            for (var b in a) {
                var c = a[b];
                if (c.getDispDocumentID().toString().toUpperCase() == commentID.toUpperCase()) {
                    comment = c.getDispComment().toString();
                    //replace variables
                    if (params) {
                        comments = setParams(comments, params);
                    }
                    break;
                }
            }
        }
    }
    return comment;
}

/**
 * 
 * 
 * @param {any} parentChildArr 
 * @param {any} ASI_Group 
 * @param {any} ASI_Field 
 * @param {any} s_ASI_Value 
 */
function editASI(parentChildArr, ASI_Group, ASI_Field, s_ASI_Value) {
    for (var x in parentChildArr) {
        var y = parentChildArr[x];
        editAppSpecific(ASI_Group + ":" + ASI_Field, s_ASI_Value, getApplication(y.getCustomID()));
    }
}

/**
 * 
 * 
 * @param {any} parentChildArr 
 * @param {any} comment 
 * @param {any} params 
 */
function addRecordComments(parentChildArr, comment, params) {
    for (var x in parentChildArr) {
        var y = parentChildArr[x];

        //replace variables
        if (params) {
            comment = setParams(comment, params);
        }

        createCapComment(comment, getApplication(y.getCustomID()));
    }
}

/**
 * 
 * 
 * @param {any} pCapType 
 * @param {any} pParentCapId 
 * @param {any} excludArr 
 * @returns 
 */
function getChildrenWithExclusions(pCapType, pParentCapId, excludArr) {
    var children = [];
    var g_children = getChildren(pCapType, pParentCapId);
    for (var c in g_children) {
        var child = g_children[c];
        if (!checkIfCapTypeInCapTypeArray(child, excludArr)) {
            children.push(child);
        }
    }
    return children;
}

/**
 * 
 * 
 * @param {any} pAppType 
 * @param {any} excludArr 
 * @returns 
 */
function getParentsWithExclusions(pAppType, excludArr) {
    var parents = [];
    var g_parents = getParents(pAppType);
    for (var p in g_parents) {
        var parent = g_parents[p];
        if (!checkIfCapTypeInCapTypeArray(parent, excludArr)) {
            parents.push(parent);
        }
    }
    return parents;
}

/**
 * 
 * 
 * @param {any} c 
 * @param {any} arr 
 * @returns 
 */
function checkIfCapTypeInCapTypeArray(c, arr) {
    if (c) {
        var _c = aa.cap.getCap(c.getID1(), c.getID2(), c.getID3()).getOutput();
        if (_c) {
            var ct = _c.capType;
            if (ct) {
                for (var a in arr) {
                    var x = arr[a];
                    if (ct.toString.toUpperCase() == x.toString().toUpperCase()) {
                        return true;
                    }
                }
            }
        }

    }
    return false;
}

/**
 * 
 * 
 * @param {any} params 
 */
function addPropogationParams(params, pCapId) {

    logDebug("Adding param $$appTypeString$$: " + appTypeString);
    addParameter(params, "$$appTypeString$$", appTypeString);
    logDebug("Adding param $$capStatus$$: " + capStatus);
    addParameter(params, "$$capStatus$$", capStatus)
    //logDebug("Adding param $$parentCapId$$: " + parentCapId);
    //addParameter(params, "$$parentCapId$$", parentCapId);


    logDebug("Getting additional notification template params for record: " + pCapId.getCustomID());
    getRecordParams4Notification(params,pCapId);
    getPrimaryAddressLineParam4Notification(params,pCapId);
    getPrimaryOwnerParams4Notification(params,pCapId);
}

/**
 * 
 * 
 * @param {any} notifications 
 * @param {any} c 
 * @param {any} params 
 */
function propogationNotification(notifications, c, params) {
    var _capID = capId;
    if (c) {
        capId = c;
    }
    for (var x in notifications) {
        var n = notifications[x];
        var from = n.From;
        var temp = n.Notification_Template;
        var cc = n.CC;
        var to = "";

        if (!params) {
            params = aa.util.newHashtable();
            addPropogationParams(params,c);
        }

        for (var t in n.To_ContactTypes) {
            var ct = n.To_ContactTypes[t];
            logDebug("ct:" + ct);
            var par = params;
            getContactParams4Notification(par, ct);
            to = params.get("$$" + ct.toLowerCase() + "Email$$");
            logDebug("to:" + to);
            if (to) {
                sendNotification(from, to, cc, temp, par, null);
            }
            to = "";
        }
    }
    capId = _capID;
}

/**
 * returns true if value matches any of the following arguments
 * 
 * @param {any} eVal 
 * @param {any} argArray 
 * @returns 
 */
function _matches(eVal, argArray) {
    for (var i in argArray) {
        var x = argArray[i];
        if (x == eVal) {
            return true;
        }
    }
    return false;
}

/**
 * This function is designed to run the WorkflowTaskUpdateAfter (WTUA) script actions for the CapId provided.
 * 
 * @example runWTUAForWFTaskWFStatus('PRMT_TRADE','Application Acceptance','Accepted',capId)
 * 
 * @param {string} vTaskName - Name of task to run the event for.
 * @param {string} vProcessCode - Workflow process that contains the task
 * @param {string} vStatus - Status to rqun the event for
 * @param {object} vCapId - CapId object
 * @param {string} vComment - Comment text.
 * @returns 
 */
function runWTUAForWFTaskWFStatus(vTaskName, vProcessCode, vStatus, vCapId, vComment) {

    //Set Variables
    //Save the existing system variables so that they can be reset after the function
    var pvScriptName = vScriptName;
    var pvEventName = vEventName;
    var pprefix = ((typeof prefix === 'undefined') ? null : prefix);
    var pcapId = capId;
    var pcap = cap;
    var pcapIDString = capIDString;
    var pappTypeResult = appTypeResult;
    var pappTypeString = appTypeString;
    var pappTypeArray = appTypeArray;
    var pcapName = capName;
    var pcapStatus = capStatus;
    var pfileDateObj = fileDateObj;
    var pfileDate = fileDate;
    var pfileDateYYYYMMDD = fileDateYYYYMMDD;
    var pparcelArea = parcelArea;
    var pestValue = estValue;
    var pbalanceDue = balanceDue;
    var phouseCount = houseCount;
    var pfeesInvoicedTotal = feesInvoicedTotal;
    var pcapDetail = capDetail;
    var pAInfo = AInfo;
    var ppartialCap;
    if (typeof (partialCap) !== "undefined") {
        ppartialCap = partialCap;
    } else {
        ppartialCap = null;
    }
    var pparentCapId;
    if (typeof (parentCapId) !== "undefined") {
        pparentCapId = parentCapId;
    } else {
        pparentCapId = null;
    }
    var pCreatedByACA;
    if (typeof (CreatedByACA) !== "undefined") {
        pCreatedByACA = CreatedByACA;
    } else {
        CreatedByACA = 'N';
    }

    //WTUA Specific variables.
    var pwfTask = ((typeof wfTask === 'undefined') ? null : wfTask);
    var pwfTaskObj = ((typeof wfTaskObj === 'undefined') ? null : wfTaskObj);
    var pwfStatus = ((typeof wfStatus === 'undefined') ? null : wfStatus);
    var pwfDate = ((typeof wfDate === 'undefined') ? null : wfDate);
    var pwfDateMMDDYYYY = ((typeof wfDateMMDDYYYY === 'undefined') ? null : wfDateMMDDYYYY);
    var pwfProcessID = ((typeof wfProcessID === 'undefined') ? null : wfProcessID);
    var pwfStep = ((typeof wfStep === 'undefined') ? null : wfStep);
    var pwfComment = ((typeof wfComment === 'undefined') ? null : wfComment);
    var pwfNote = ((typeof wfNote === 'undefined') ? null : wfNote);
    var pwfDue = ((typeof wfDue === 'undefined') ? null : wfDue);
    var pwfHours = ((typeof wfHours === 'undefined') ? null : wfHours);
    var pwfProcess = ((typeof wfProcess === 'undefined') ? null : wfProcess);
    var pwfObj = ((typeof wfObj === 'undefined') ? null : wfObj);
    var pwfStaffUserID = ((typeof wfStaffUserID === 'undefined') ? null : wfStaffUserID);
    var ptimeAccountingArray = ((typeof timeAccountingArray === 'undefined') ? null : timeAccountingArray);
    var pwfTimeBillable = ((typeof wfTimeBillable === 'undefined') ? null : wfTimeBillable);
    var pwfTimeOT = ((typeof wfTimeOT === 'undefined') ? null : wfTimeOT);
    var ptimeLogModel = ((typeof timeLogModel === 'undefined') ? null : timeLogModel);
    var ptimeLogSeq = ((typeof timeLogSeq === 'undefined') ? null : timeLogSeq);
    var pdateLogged = ((typeof dateLogged === 'undefined') ? null : dateLogged);
    var pstartTime = ((typeof startTime === 'undefined') ? null : startTime);
    var pendTime = ((typeof endTime === 'undefined') ? null : endTime);
    var ptimeElapsedHours = ((typeof timeElapsedHours === 'undefined') ? null : timeElapsedHours);
    var ptimeElapsedMin = ((typeof timeElapsedMin === 'undefined') ? null : timeElapsedMin);

    //Run simulate the WTUA event for the child record
    logDebug("<br>***************************************")
    logDebug("***Begin WTUA Sim");

    vScriptName = "function: runWTUAForWFTaskWFStatus";
    vEventName = "WorkflowTaskUpdateAfter";

    prefix = 'WTUA';

    //Clear global variables so that they can be set with the supplied
    capId = null;
    cap = null;
    capIDString = "";
    appTypeResult = null;
    appTypeString = "";
    appTypeArray = [];
    capName = null;
    capStatus = null;
    fileDateObj = null;
    fileDate = null;
    fileDateYYYYMMDD = null;
    parcelArea = 0;
    estValue = 0;
    balanceDue = 0;
    houseCount = 0;
    feesInvoicedTotal = 0;
    capDetail = "";
    AInfo = [];
    partialCap = false;
    parentCapId = null;
    CreatedByACA = 'N';

    //Clear event specific variables;
    //wfTask = null;
    wfTaskObj = null;
    wfStatus = null;
    wfDate = null;
    wfDateMMDDYYYY = null;
    wfProcessID = null;
    wfStep = null;
    wfComment = null;
    wfNote = null;
    wfDue = null;
    wfHours = null;
    wfProcess = null;
    wfObj = null;
    wfStaffUserID = null;
    timeAccountingArray = null;
    wfTimeBillable = null;
    wfTimeOT = null;
    timeLogModel = null;
    timeLogSeq = null;
    dateLogged = null;
    startTime = null;
    endTime = null;
    timeElapsedHours = null;
    timeElapsedMin = null;

    //Set capId to the vCapId variable provided
    var holdId = capId;
    capId = vCapId;
    //Update global variables based on child capId
    if (capId !== null) {
        parentCapId = pcapId;
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        if (appTypeArray[0].substr(0, 1) != "_") {
            var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput();
            if (currentUserGroupObj)
                currentUserGroup = currentUserGroupObj.getGroupName();
        }
        capName = cap.getSpecialText();
        capStatus = cap.getCapStatus();
        partialCap = !cap.isCompleteCap();
        fileDateObj = cap.getFileDate();
        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
        var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
        if (valobj.length) {
            estValue = valobj[0].getEstimatedValue();
            calcValue = valobj[0].getCalculatedValue();
            feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
        }

        var capDetailObjResult = aa.cap.getCapDetail(capId);
        if (capDetailObjResult.getSuccess()) {
            capDetail = capDetailObjResult.getOutput();
            houseCount = capDetail.getHouseCount();
            feesInvoicedTotal = capDetail.getTotalFee();
            balanceDue = capDetail.getBalance();
        }
        loadAppSpecific(AInfo);
        loadTaskSpecific(AInfo);
        loadParcelAttributes(AInfo);
        loadASITables();

        CreatedByACA = 'N';

        logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
        logDebug("capId = " + capId.getClass());
        logDebug("cap = " + cap.getClass());
        logDebug("currentUserID = " + currentUserID);
        logDebug("currentUserGroup = " + currentUserGroup);
        logDebug("systemUserObj = " + systemUserObj.getClass());
        logDebug("appTypeString = " + appTypeString);
        logDebug("capName = " + capName);
        logDebug("capStatus = " + capStatus);
        logDebug("fileDate = " + fileDate);
        logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
        logDebug("sysDate = " + sysDate.getClass());
        logDebug("parcelArea = " + parcelArea);
        logDebug("estValue = " + estValue);
        logDebug("calcValue = " + calcValue);
        logDebug("feeFactor = " + feeFactor);

        logDebug("houseCount = " + houseCount);
        logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
        logDebug("balanceDue = " + balanceDue);
    }

    //set WTUA specific variables
    wfTask = vTaskName; // Workflow Task Triggered event
    wfStatus = vStatus; // Status of workflow that triggered event
    wfComment = vComment;
    wfDate = sysDate.getYear() + '-' + sysDate.getMonth() + '-' + sysDate.getDayOfMonth(); // date of status of workflow that triggered event
    wfDateMMDDYYYY = wfDate.substr(5, 2) + "/" + wfDate.substr(8, 2) + "/" + wfDate.substr(0, 4); // date of status of workflow that triggered event in format MM/DD/YYYY
    // Go get other task details
    wfObj = aa.workflow.getTasks(capId).getOutput();
    for (var i in wfObj) {
        fTask = wfObj[i];
        //if (fTask.getTaskDescription() == wfTask && fTask.getProcessID() == vProcessID && fTask.getStepNumber() == vStepNum) {
        logDebug("fTask.getTaskDescription():" + fTask.getTaskDescription());
        logDebug("fTask.getProcessCode():" + fTask.getProcessCode());
        if (fTask.getTaskDescription().toString().toUpperCase() == wfTask.toString().toUpperCase()) {
            wfStep = fTask.getStepNumber();
            wfProcess = fTask.getProcessCode();
            wfProcessID = fTask.getProcessID();
            //wfComment = fTask.getDispositionComment();
            wfNote = fTask.getDispositionNote();
            wfDue = fTask.getDueDate();
            wfHours = fTask.getHoursSpent();
            wfTaskObj = fTask;
        }
    }
    if (!wfTaskObj) {
        logDebug("WARNING: Could not find WF Task: " + wfTask + " on the record: " + capIDString);
        return false;
    }
    logDebug("wfTask = " + wfTask);
    logDebug("wfTaskObj = " + wfTaskObj.getClass());
    logDebug("wfStatus = " + wfStatus);
    logDebug("wfDate = " + wfDate);
    logDebug("wfDateMMDDYYYY = " + wfDateMMDDYYYY);
    logDebug("wfStep = " + wfStep);
    logDebug("wfComment = " + wfComment);
    logDebug("wfProcess = " + wfProcess);
    logDebug("wfProcessID = " + wfProcessID);
    logDebug("wfNote = " + wfNote);

    /* Added for version 1.7 */
    wfStaffUserID = aa.env.getValue("StaffUserID");
    timeAccountingArray = [];
    if (aa.env.getValue("TimeAccountingArray") != "") {
        timeAccountingArray = aa.env.getValue("TimeAccountingArray");
    }
    wfTimeBillable = aa.env.getValue("Billable");
    wfTimeOT = aa.env.getValue("Overtime");

    logDebug("wfStaffUserID = " + wfStaffUserID);
    logDebug("wfTimeBillable = " + wfTimeBillable);
    logDebug("wfTimeOT = " + wfTimeOT);
    logDebug("wfHours = " + wfHours);

    if (timeAccountingArray != null || timeAccountingArray != '') {
        for (var j = 0; j < timeAccountingArray.length; j++) {
            timeLogModel = timeAccountingArray[j];
            timeLogSeq = timeLogModel.getTimeLogSeq();
            dateLogged = timeLogModel.getDateLogged();
            startTime = timeLogModel.getStartTime();
            endTime = timeLogModel.getEndTime();
            timeElapsedHours = timeLogModel.getTimeElapsed().getHours();
            timeElapsedMin = timeLogModel.getTimeElapsed().getMinutes();

            logDebug("TAtimeLogSeq = " + timeLogSeq);
            logDebug("TAdateLogged = " + dateLogged);
            logDebug("TAstartTime = " + startTime);
            logDebug("TAendTime = " + endTime);
            logDebug("TAtimeElapsedHours = " + timeElapsedHours);
            logDebug("TAtimeElapsedMin = " + timeElapsedMin);
        }
    }
    //

    //Run WTUA scripts for the variables provided
    doScriptActions();

    //Reset global variables to the original records
    vScriptName = pvScriptName;
    vEventName = pvEventName;
    prefix = pprefix;
    capId = pcapId;
    cap = pcap;
    capIDString = pcapIDString;
    appTypeResult = pappTypeResult;
    appTypeString = pappTypeString;
    appTypeArray = pappTypeArray;
    capName = pcapName;
    capStatus = pcapStatus;
    fileDateObj = pfileDateObj;
    fileDate = pfileDate;
    fileDateYYYYMMDD = pfileDateYYYYMMDD;
    parcelArea = pparcelArea;
    estValue = pestValue;
    feesInvoicedTotal = pfeesInvoicedTotal;
    balanceDue = pbalanceDue;
    houseCount = phouseCount;
    feesInvoicedTotal = pfeesInvoicedTotal;
    capDetail = pcapDetail;
    AInfo = pAInfo;
    partialCap = ppartialCap;
    parentCapId = pparentCapId;
    CreatedByACA = pCreatedByACA;

    //Reset WTUA Specific variables.
    wfTask = pwfTask;
    wfTaskObj = pwfTaskObj;
    wfStatus = pwfStatus;
    wfDate = pwfDate;
    wfDateMMDDYYYY = pwfDateMMDDYYYY;
    wfProcessID = pwfProcessID;
    wfStep = pwfStep;
    wfComment = pwfComment;
    wfNote = pwfNote;
    wfDue = pwfDue;
    wfHours = pwfHours;
    wfProcess = pwfProcess;
    wfObj = pwfObj;
    wfStaffUserID = pwfStaffUserID;
    timeAccountingArray = ptimeAccountingArray;
    wfTimeBillable = pwfTimeBillable;
    wfTimeOT = pwfTimeOT;
    timeLogModel = ptimeLogModel;
    timeLogSeq = ptimeLogSeq;
    dateLogged = pdateLogged;
    startTime = pstartTime;
    endTime = pendTime;
    timeElapsedHours = ptimeElapsedHours;
    timeElapsedMin = ptimeElapsedMin;
    capId = holdId;
    logDebug("***End WTUA Sim");
    logDebug("<br>***************************************")


}

//new functions not yet part of the standard installation

/**
 * Returns an array of address objects for the record.
 * 
 * @returns {array} address object array or false if no addresses.
 */
function getRecordAddresses() {
    var itemCap = capId;
    if (arguments.length > 1)
        itemCap = arguments[1]; // use cap ID specified in args
    var addResult = aa.address.getAddressByCapId(itemCap);
    if (addResult.getSuccess()) {
        var addArray = addResult.getOutput();
        return addArray;
    } else {
        logDebug("Could not return address: " + addResult.getErrorMessage());
        return false;
    }
    logDebug("Could not find an address of type: " + aType);
    return false;
}

/**
 * Updates the record description of the current record.
 * @example
    editRecordDescription(crmRequestDesc, coreReqCapId);
 * @memberof INCLUDES_CUSTOM
 *  @param description - Enter the updated record description.
 *  @param capId - Optional capId object
 * @return {boolean} - flag indicating success or failure.
 */
function editRecordDescription(description) {

    var itemCap = capId;
    if (arguments.length > 1) itemCap = arguments[1];

    var coreWorkDescScriptModel = aa.cap.getCapWorkDesByPK(itemCap).getOutput();
    var coreWorkDescModel = coreWorkDescScriptModel.getCapWorkDesModel();
    coreWorkDescModel.setDescription(description);
    var editCoreDescResult = aa.cap.editCapWorkDes(coreWorkDescModel);
    if (editCoreDescResult.getSuccess()) {
        logDebug("Successfully updated core SR description: " + description);
        return true;
    } else {
        logDebug("Failed to update core SR description: " + editCoreDescResult.getErrorMessage());
        return false;
    }
}


/**
 *  Copies all record comments from source to target record.
 *  @memberof INCLUDES_CUSTOM
 *  @param vCapId - capIdModel of the source record 
 *  @param vTargetId - capIdModel of the target record
 */
function copyRecordComments(vCapId, vTargetId) {

    try {
        //create commentScriptModel to get existing comments
        var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
        capCommentScriptModel.setCapIDModel(vCapId);
        capCommentScriptModel.setCommentType("APP LEVEL COMMENT");
        var capCommentModel = capCommentScriptModel.getCapCommentModel();

        // get comments from source capId
        var getCommentResult = aa.cap.getCapComment(capCommentModel);
        if (getCommentResult.getSuccess()) {
            var comments = getCommentResult.getOutput();
            for (var c in comments) {
                var comment = comments[c];
                logDebug("Comment Text: " + comment.getText());
                logDebug("Comment Audit User: " + comment.getAuditUser());
                logDebug("Comment Audit Date: " + comment.getAuditDate());

                //copy the comment to the target record
                capCommentModel = capCommentScriptModel.getCapCommentModel();
                //exploreObject(capCommentModel);
                capCommentModel.setCapIDModel(vTargetId);
                capCommentModel.setCommentType("APP LEVEL COMMENT");
                capCommentModel.setSynopsis("");
                capCommentModel.setText(comment.getText());
                capCommentModel.setAuditUser(comment.getAuditUser());
                capCommentModel.setAuditStatus("A");

                capCommentModel.setAuditDate(convertDate(comment.getAuditDate()));
                var copyCommentResult = aa.cap.createCapComment(capCommentModel);
                if (copyCommentResult.getSuccess()) {
                    logDebug("Comment copied successfully");
                } else {
                    logDebug("Error copying comment: " + copyCommentResult.getErrorMessage());
                    return false;
                }
            }
        }

    } catch (err) {
        logDebug("**ERROR in copyRecordComments(): " + err);
        return false;
    }
}


/**
 *  Copies all attachments between two records.
 *  @memberof INCLUDES_CUSTOM
 *  @param pFromCapId - capIdModel of the source record
 *  @param pToCapId - capIdModel of the target record
 */
function copyDocuments(pFromCapId, pToCapId) {

    //Copies all attachments (documents) from pFromCapId to pToCapId
    var vFromCapId = pFromCapId;
    var vToCapId = pToCapId;
    var categoryArray = new Array();

    // third optional parameter is comma delimited list of categories to copy.
    if (arguments.length > 2) {
        categoryList = arguments[2];
        categoryArray = categoryList.split(",");
    }

    var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
    if (capDocResult.getSuccess()) {
        if (capDocResult.getOutput().size() > 0) {
            for (var docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
                var documentObject = capDocResult.getOutput().get(docInx);
                currDocCat = "" + documentObject.getDocCategory();
                if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
                    // download the document content
                    var useDefaultUserPassword = true;
                    //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                    var EMDSUsername = null;
                    var EMDSPassword = null;
                    var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                    if (downloadResult.getSuccess()) {
                        var path = downloadResult.getOutput();
                        //logDebug("path=" + path);
                    }
                    var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
                    documentObject.setDocumentNo(null);
                    documentObject.setCapID(vToCapId)
                    documentObject.setEntityID(tmpEntId);

                    // Open and process file
                    try {
                        // put together the document content - use java.io.FileInputStream
                        var newContentModel = aa.document.newDocumentContentModel().getOutput();
                        inputstream = new java.io.FileInputStream(path);
                        newContentModel.setDocInputStream(inputstream);
                        documentObject.setDocumentContent(newContentModel);
                        var newDocResult = aa.document.createDocument(documentObject);
                        if (newDocResult.getSuccess()) {
                            newDocResult.getOutput();
                            logDebug("Successfully copied document: " + documentObject.getFileName());
                        } else {
                            logDebug("Failed to copy document: " + documentObject.getFileName());
                            logDebug(newDocResult.getErrorMessage());
                        }
                    } catch (err) {
                        logDebug("Error copying document: " + err.message);
                        return false;
                    }
                }
            } // end for loop
        }
    }
}

/**
 * This function will now check for the presence of a standard choice 
 * "REF_CONTACT_CREATION_RULES". 
 * This setting will determine if the reference contact will be created, as well
 *  as the contact type that the reference contact will be created with.  If 
 * this setting is configured, the contactTypeArray parameter will be ignored.   
 * 
 * The "Default" in this standard choice determines the default action of all 
 * contact types.   Other types can be configured separately.   
 * Each contact type can be set to "I" (create ref as individual), "O" (create 
 * ref as organization), "F" (follow the indiv/org flag on the cap contact), "D" 
 * (Do not create a ref contact), and "U" (create ref using transaction contact type).
 * 
 * @param {any} pCapId 
 * @param {any} contactTypeArray is either null (all), or an array or contact 
 * types to process
 * @param {any} ignoreAttributeArray is either null (none), or an array of 
 * attributes to ignore when creating a REF contact
 * @param {any} replaceCapContact not implemented yet
 * @param {any} overwriteRefContact -  if true, will refresh linked ref 
 * contact with CAP contact data
 * @param {any} refContactExists is a function for REF contact comparisons.
 */
function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists) {
    var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";

    var ingoreArray = [];
    if (arguments.length > 1) ignoreArray = arguments[1];

    var defaultContactFlag = lookup(standardChoiceForBusinessRules, "Default");

    var c = aa.people.getCapContactByCapID(pCapId).getOutput()
    var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput() // must have two working datasets

    for (var i in c) {
        var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
        var con = c[i];

        var p = con.getPeople();

        var contactFlagForType = lookup(standardChoiceForBusinessRules, p.getContactType());

        if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
        {
            if (contactTypeArray && !exists(p.getContactType(), contactTypeArray))
                continue; // not in the contact type list.  Move along.
        }

        if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
        {
            ruleForRefContactType = defaultContactFlag;
        }

        if (contactFlagForType) // explicit contact type is indicated
        {
            ruleForRefContactType = contactFlagForType;
        }

        if (ruleForRefContactType.equals("D"))
            continue;

        var refContactType = "";

        switch (ruleForRefContactType) {
            case "U":
                refContactType = p.getContactType();
                break;
            case "I":
                refContactType = "Individual";
                break;
            case "O":
                refContactType = "Organization";
                break;
            case "F":
                if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
                    refContactType = "Organization";
                else
                    refContactType = "Individual";
                break;
        }

        var refContactNum = con.getCapContactModel().getRefContactNumber();

        if (refContactNum) // This is a reference contact.   Let's refresh or overwrite as requested in parms.
        {
            if (overwriteRefContact) {
                p.setContactSeqNumber(refContactNum); // set the ref seq# to refresh
                p.setContactType(refContactType);

                var a = p.getAttributes();

                if (a) {
                    var ai = a.iterator();
                    while (ai.hasNext()) {
                        var xx = ai.next();
                        xx.setContactNo(refContactNum);
                    }
                }

                var r = aa.people.editPeopleWithAttribute(p, p.getAttributes());

                if (!r.getSuccess())
                    logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
                else
                    logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
            }

            if (replaceCapContact) {
                // To Be Implemented later.   Is there a use case?
            }

        } else // user entered the contact freehand.   Let's create or link to ref contact.
        {
            var ccmSeq = p.getContactSeqNumber();

            var existingContact = refContactExists(p); // Call the custom function to see if the REF contact exists

            var p = cCopy[i].getPeople(); // get a fresh version, had to mangle the first for the search

            if (existingContact) // we found a match with our custom function.  Use this one.
            {
                refPeopleId = existingContact;
            } else // did not find a match, let's create one
            {

                var a = p.getAttributes();

                if (a) {
                    //
                    // Clear unwanted attributes
                    var ai = a.iterator();
                    while (ai.hasNext()) {
                        var xx = ai.next();
                        if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(), ignoreAttributeArray))
                            ai.remove();
                    }
                }

                p.setContactType(refContactType);
                var r = aa.people.createPeopleWithAttribute(p, a);

                if (!r.getSuccess()) {
                    logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage());
                    continue;
                }

                //
                // createPeople is nice and updates the sequence number to the ref seq
                //

                var p = cCopy[i].getPeople();
                var refPeopleId = p.getContactSeqNumber();

                logDebug("Successfully created reference contact #" + refPeopleId);

                // Need to link to an existing public user.

                var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                    var userModel = getUserResult.getOutput();
                    logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

                    if (refPeopleId) {
                        logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
                        aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
                    }
                }
            }

            //
            // now that we have the reference Id, we can link back to reference
            //

            var ccm = aa.people.getCapContactByPK(pCapId, ccmSeq).getOutput().getCapContactModel();

            ccm.setRefContactNumber(refPeopleId);
            r = aa.people.editCapContact(ccm);

            if (!r.getSuccess()) {
                logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage());
            } else {
                logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);
            }


        } // end if user hand entered contact 
    } // end for each CAP contact
}

/**
 * This function will be passed as a parameter to the 
 * createRefContactsFromCapContactsAndLink function. The function takes a single
 * peopleModel as a parameter, and will return the sequence number of the first
 * G6Contact result returns null if there are no matches
 * 
 * Best Practice Template (BPT) version uses the following algorithm:
 * 1. Match on SSN/FEIN if either exist
 * 2. else, match on Email Address if it exists
 * 3. else, match on First, Middle, Last Name combined with birthdate if all exist
 * 
 * This function can use attributes if desired
 * 
 * @param {object} peop people model object
 * @returns {int} contact sequence number.
 */
function comparePeopleStandard(peop) {
    if (peop.getSocialSecurityNumber() || peop.getFein()) {
        var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

        logDebug("we have a SSN " + peop.getSocialSecurityNumber() + " or FEIN, checking on that");
        qryPeople.setSocialSecurityNumber(peop.getSocialSecurityNumber());
        qryPeople.setFein(peop.getFein());

        var r = aa.people.getPeopleByPeopleModel(qryPeople);

        if (!r.getSuccess()) {
            logDebug("WARNING: error searching for people : " + r.getErrorMessage());
            return;
        }

        var peopResult = r.getOutput();

        if (peopResult.length > 0) {
            logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
            return peopResult[0].getContactSeqNumber();
        }
    }

    if (peop.getEmail()) {
        var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

        qryPeople.setServiceProviderCode(aa.getServiceProviderCode());

        logDebug("we have an email, checking on that");
        qryPeople.setEmail(peop.getEmail());

        var r = aa.people.getPeopleByPeopleModel(qryPeople);

        if (!r.getSuccess()) {
            logDebug("WARNING: error searching for people : " + r.getErrorMessage());
            return;
        }

        var peopResult = r.getOutput();

        if (peopResult.length > 0) {
            logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
            return peopResult[0].getContactSeqNumber();
        }
    }

    if (peop.getBirthDate() && peop.getLastName() && peop.getFirstName()) {
        var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
        logDebug("we have a name and birthdate, checking on that");
        qryPeople.setBirthDate(peop.getBirthDate());
        qryPeople.setLastName(peop.getLastName());
        qryPeople.setFirstName(peop.getFirstName());
        qryPeople.setMiddleName(peop.getMiddleName());

        var r = aa.people.getPeopleByPeopleModel(qryPeople);

        if (!r.getSuccess()) {
            logDebug("WARNING: error searching for people : " + r.getErrorMessage());
            return;
        }

        var peopResult = r.getOutput();

        if (peopResult.length > 0) {
            logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber());
            return peopResult[0].getContactSeqNumber();
        }
    }

    logDebug("ComparePeople did not find a match");
    return;
}

/**
 * Search for reference addresses by house number and street name
 * @memberof INCLUDES_CRM
 * @param {string} pHseNum Address house number to search for. 
 * @param {*} pStrName Address street name to search for
 * @param {boolean} [enableFuzySearch] Optional parameter to search by first word in street name with a wildcard. Example 5th% will match 5th Avenue.
 */
function getRefAddressByHouseNbrStreetName(pHseNum, pStrName) {
    var strName = pStrName;
    var enableFuzzySearch = false;
    if (arguments.length == 3) {
        enableFuzzySearch = arguments[2];
    }
    if (enableFuzzySearch) {
        strName = strName + "%";
    }
    var refAddressesResult = aa.address.getRefAddressByHouseRangeStreetName(parseInt(pHseNum), parseInt(pHseNum), strName.toString());
    if (refAddressesResult.getSuccess()) {
        refAddresses = refAddressesResult.getOutput();
        if (refAddresses) {
            logDebug("Found matching reference address for: " + pHseNum + " " + strName + ". Count: " + refAddresses.length);
            return refAddresses; //returns only the first address found
        } else {
            logDebug("No matching reference address found for: " + pHseNum + " " + strName);
        }
    } else {
        logDebug("ERROR Getting Address: " + refAddressesResult.getErrorMessage());
    }
    return false;
}

function runASAForCapId(vCapId) {

    //Set Variables
    //Save the existing system variables so that they can be reset after the function
    var pvScriptName = vScriptName;
    var pvEventName = vEventName;
    var pprefix = ((typeof prefix === 'undefined') ? null : prefix);
    var pcapId = capId;
    var pcap = cap;
    var pcapIDString = capIDString;
    var pappTypeResult = appTypeResult;
    var pappTypeString = appTypeString;
    var pappTypeArray = appTypeArray;
    var pcapName = capName;
    var pcapStatus = capStatus;
    var pfileDateObj = fileDateObj;
    var pfileDate = fileDate;
    var pfileDateYYYYMMDD = fileDateYYYYMMDD;
    var pparcelArea = parcelArea;
    var pestValue = estValue;
    var pbalanceDue = balanceDue;
    var phouseCount = houseCount;
    var pfeesInvoicedTotal = feesInvoicedTotal;
    var pcapDetail = capDetail;
    var pAInfo = AInfo;
    var ppartialCap;
    if (typeof (partialCap) !== "undefined") {
        ppartialCap = partialCap;
    } else {
        ppartialCap = null;
    }
    var pparentCapId;
    if (typeof (parentCapId) !== "undefined") {
        pparentCapId = parentCapId;
    } else {
        pparentCapId = null;
    }
    var pCreatedByACA;
    if (typeof (CreatedByACA) !== "undefined") {
        pCreatedByACA = CreatedByACA;
    } else {
        CreatedByACA = 'N';
    }

    //Run simulate the WTUA event for the child record
    logDebug("<br>***************************************")
    logDebug("***Begin ASA Sim");

    vScriptName = "function: runASAForCapId";
    vEventName = "ApplicationSubmitAfter";

    prefix = 'ASA';

    //Clear global variables so that they can be set with the supplied
    capId = null;
    cap = null;
    capIDString = "";
    appTypeResult = null;
    appTypeString = "";
    appTypeArray = [];
    capName = null;
    capStatus = null;
    fileDateObj = null;
    fileDate = null;
    fileDateYYYYMMDD = null;
    parcelArea = 0;
    estValue = 0;
    balanceDue = 0;
    houseCount = 0;
    feesInvoicedTotal = 0;
    capDetail = "";
    AInfo = [];
    partialCap = false;
    parentCapId = null;
    CreatedByACA = 'N';

    //Set capId to the vCapId variable provided
    var holdId = capId;
    capId = vCapId;
    //Update global variables based on child capId
    if (capId !== null) {
        parentCapId = pcapId;
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        if (appTypeArray[0].substr(0, 1) != "_") {
            var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput();
            if (currentUserGroupObj)
                currentUserGroup = currentUserGroupObj.getGroupName();
        }
        capName = cap.getSpecialText();
        capStatus = cap.getCapStatus();
        partialCap = !cap.isCompleteCap();
        fileDateObj = cap.getFileDate();
        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
        var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
        if (valobj.length) {
            estValue = valobj[0].getEstimatedValue();
            calcValue = valobj[0].getCalculatedValue();
            feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
        }

        var capDetailObjResult = aa.cap.getCapDetail(capId);
        if (capDetailObjResult.getSuccess()) {
            capDetail = capDetailObjResult.getOutput();
            houseCount = capDetail.getHouseCount();
            feesInvoicedTotal = capDetail.getTotalFee();
            balanceDue = capDetail.getBalance();
        }
        loadAppSpecific(AInfo);
        loadTaskSpecific(AInfo);
        loadParcelAttributes(AInfo);
        loadASITables();

        CreatedByACA = 'N';

        logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
        logDebug("capId = " + capId.getClass());
        logDebug("cap = " + cap.getClass());
        logDebug("currentUserID = " + currentUserID);
        logDebug("currentUserGroup = " + currentUserGroup);
        logDebug("systemUserObj = " + systemUserObj.getClass());
        logDebug("appTypeString = " + appTypeString);
        logDebug("capName = " + capName);
        logDebug("capStatus = " + capStatus);
        logDebug("fileDate = " + fileDate);
        logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
        logDebug("sysDate = " + sysDate.getClass());
        logDebug("parcelArea = " + parcelArea);
        logDebug("estValue = " + estValue);
        logDebug("calcValue = " + calcValue);
        logDebug("feeFactor = " + feeFactor);

        logDebug("houseCount = " + houseCount);
        logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
        logDebug("balanceDue = " + balanceDue);
    }

    //Run WTUA scripts for the variables provided
    doScriptActions();

    //Reset global variables to the original records
    vScriptName = pvScriptName;
    vEventName = pvEventName;
    prefix = pprefix;
    capId = pcapId;
    cap = pcap;
    capIDString = pcapIDString;
    appTypeResult = pappTypeResult;
    appTypeString = pappTypeString;
    appTypeArray = pappTypeArray;
    capName = pcapName;
    capStatus = pcapStatus;
    fileDateObj = pfileDateObj;
    fileDate = pfileDate;
    fileDateYYYYMMDD = pfileDateYYYYMMDD;
    parcelArea = pparcelArea;
    estValue = pestValue;
    feesInvoicedTotal = pfeesInvoicedTotal;
    balanceDue = pbalanceDue;
    houseCount = phouseCount;
    feesInvoicedTotal = pfeesInvoicedTotal;
    capDetail = pcapDetail;
    AInfo = pAInfo;
    partialCap = ppartialCap;
    parentCapId = pparentCapId;
    CreatedByACA = pCreatedByACA;

    logDebug("***End ASA Sim");
    logDebug("<br>***************************************")


}