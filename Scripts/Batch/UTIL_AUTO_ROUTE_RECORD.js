/**
 * this script to for Auto route service request task
 *
 * - Osama Matkari 10/2/2018 - Applying new logic:
 * 	1. use Street/Intersection asset when the AV record doesn't have a valid address (Applies only to records created in back office)
 *  2. copy assets to new record
 */
//// sample json
////
/*"ServiceRequest/Building Permit Complaint/Building Permits/NA": {
"criteria": [
{
"records": {
"Enforcement/Property Maintenance/Case/NA": "Open"
},
"customFields": {
"Location High Weeds": "Private Property"
},
"relationship": "parent",
"Fire_ASA_Event": true,
"routeToDept": "C&R Property Maintenance Enforcement",
"newInspectionGroup": "ENF_PM",
"newInspectionType": "New Complaint",
"newInspectionPending": false,
"followUpRecordType": "Enforcement/Property Maintenance/Site Visit/NA",
"followUpRecordStatus": "Scheduled",
"followUpInspectionGroup": "ENF_PM",
"followUpInspectionType": "Follow-Up",
"followUpInspectionPending": false,
"inspectDaysAhead": 3
}
]
},
 */
//showDebug = true;
var jsonName = "CONF_AUTO_ROUTE_SERVICE_REQUEST";
AutoRouteServiceRequest(jsonName);

function AutoRouteServiceRequest(Json) {
	var cfgJsonStr = getScriptText(Json);
	var cfgJsonObj = JSON.parse(cfgJsonStr);

	var jsonRule = cfgJsonObj[appTypeString];
	if (!jsonRule) {
		logDebug("WARNING: No rules defined in CONF_AUTO_ROUTE_SERVICE_REQUEST for Record Type: " + appTypeString + ". Record ID: " + capId.getCustomID());
		return false;
	}
	var criteria;
	if (!jsonRule.criteria) {
		logDebug("ERROR: criteria array is not defined in CONF_AUTO_ROUTE_SERVICE_REQUEST for Record Type: " + appTypeString);
		return false;
	}

	criteria = jsonRule.criteria;

	for (var cix in criteria) {
		if (isCustomFieldsMatchJson(criteria[cix].customFields) && isWorkFlowMatchJson(criteria[cix].workFlow)) {
			logDebug("Custom field matched, check for record on address.");
			//checkAndCreateRecordExistsOnAddress(criteria[cix]);
			executeByAddressOrAsset(criteria[cix]);
		}
	}
}

function executeByAddressOrAsset(vRules) {
	var routeRules = vRules;
	for (var r in routeRules.records) {
		// cast rules into variables
		var jsonRecordType = r;
		var jsonRecordStatus = routeRules.records[r];

		var validAddressFound = false;
		var validAssetFound = false;

		// 1- Check if there are valid addresses to work with
		addrArray = aa.address.getAddressByCapId(capId).getOutput();
		if (addrArray != null && addrArray.length > 0) {
			for (pa in addrArray) {
				if (addrArray[pa].getHouseNumberStart() == null || addrArray[pa]["streetName"] == "NA")
					continue;

				validAddressFound = true;
				logDebug("Searching for records on address: " + addrArray[pa]["streetName"] + ", " + addrArray[pa]["houseNumberStart"] + ", " + addrArray[pa]["streetSuffix"] + ", " + addrArray[pa]["streetDirection"]);
				relatedAddressCapsArr = getRelatedCapsByAddressAttributes(addrArray[pa]["streetName"], addrArray[pa]["houseNumberStart"], addrArray[pa]["streetSuffix"], addrArray[pa]["streetDirection"]);

				// Execute old logic
				checkAndCreateRecordExistsOnAddress(jsonRecordType, jsonRecordStatus, routeRules, relatedAddressCapsArr);
			}
		}

		// 2- if record is created from "back office" and no valid address exists check if there is Street/Intersection asset
		if (!validAddressFound && cap.getCapModel().getCreatedByACA() == "N") {
			var capAssetsListRes = aa.asset.getAssetListByWorkOrder(capId, null);
			if (capAssetsListRes.getSuccess() && capAssetsListRes.getOutput() != null && capAssetsListRes.getOutput().length > 0) {
				var capAssetsList = capAssetsListRes.getOutput();
				for (asIdx in capAssetsList) {
					var assetMasterModel = capAssetsList[asIdx].getAssetMasterModel();
					//Should create work order regardless of asset group or type.
					//if (assetMasterModel.getG1AssetGroup() == "Street" && assetMasterModel.getG1AssetType() == "Intersection") {
						validAssetFound = true;
						var woList = [];
						// get related caps by asset.
						var woListRes = aa.asset.getWorkOrderListByAsset(assetMasterModel.getAssetPK(), null);
						if (woListRes.getSuccess() && woListRes.getOutput() != null && woListRes.getOutput().length > 0) {
							woList = woListRes.getOutput();
						} else {
							logDebug("**Error getWorkOrderListByAsset " + getWorkOrderListByAsset.getErrorMessage());
						}

						// Execute old logic
						checkAndCreateRecordExistsOnAddress(jsonRecordType, jsonRecordStatus, routeRules, woList);
					//}
				}
			} else {
				logDebug("**Error getAssetListByWorkOrder " + capAssetsListRes.getErrorMessage());
			}
		}

		// if no valid addresses or no valid assets, abort...
		if (!validAddressFound && !validAssetFound) {
			logDebug("No valid address or valid asset found for this record.")
		}
	}
}

function checkAndCreateRecordExistsOnAddress(jsonRecordType, jsonRecordStatus, routeRules, capIdsArray) {
	var relation = routeRules.relationship;
	var routeToDept = routeRules.routeToDept;
	var Fire_ASA_Event = routeRules.Fire_ASA_Event;
	var newInspectionGroup = routeRules.newInspectionGroup;
	var newInspectionType = routeRules.newInspectionType;
	var newInspectionPending = routeRules.newInspectionPending;
	var followUpRecordType = routeRules.followUpRecordType;
	var followUpRecordStatus = routeRules.followUpRecordStatus;
	var followUpInspectionGroup = routeRules.followUpInspectionGroup;
	var followUpInspectionType = routeRules.followUpInspectionType;
	var followUpInspectionPending = routeRules.followUpInspectionPending;
	var inspectDaysAhead = routeRules.inspectDaysAhead;

	logDebug("jsonRecordType: " + jsonRecordType);
	logDebug("jsonRecordStatus: " + jsonRecordStatus);
	logDebug("relation: " + relation);
	logDebug("routeToDept: " + routeToDept);
	logDebug("Fire_ASA_Event: " + Fire_ASA_Event);
	logDebug("newInspectionGroup: " + newInspectionGroup);
	logDebug("newInspectionType: " + newInspectionType);
	logDebug("newInspectionPending: " + newInspectionPending);
	logDebug("followUpRecordType: " + followUpRecordType);
	logDebug("followUpRecordStatus: " + followUpRecordStatus);
	logDebug("followUpInspectionGroup: " + followUpInspectionGroup);
	logDebug("followUpInspectionType: " + followUpInspectionType);
	logDebug("followUpInspectionPending: " + followUpInspectionPending);
	logDebug("inspectDaysAhead: " + inspectDaysAhead);

	var isRecordTypeExists = false;

	// if no records on address, no match found
	// AARON: DISABLED DUPLICATE CHECK FOR EMERGENCY DEMO ISSUE
	//if (capIdsArray == null || capIdsArray.length <= 0) {
	if (true) {

		// no records does exist at this address, create a new one
		isRecordTypeExists = false;
	} else {
		// records exist on this address, loop through and filter by type and status
		// do configuration for when we have existing records
		for (ca in capIdsArray) {
			var capIdValue = capIdsArray[ca].getCapID();
			var CurrentCap = aa.cap.getCap(capIdValue).getOutput();
			var CurrentCapType = CurrentCap.getCapType().toString();
			var CurrentCapStatus = CurrentCap.getCapStatus();

			//logDebug("Found existing record at this address: " + capIdValue.getCustomID() + ", " + CurrentCapType + ", " + CurrentCapStatus);

			if (String(jsonRecordType) == String(CurrentCapType) && String(jsonRecordStatus) == CurrentCapStatus) {
				isRecordTypeExists = true;
				if (!checkRelationRecordExists(jsonRecordType, relation))
					break;
				if (relation == "parent") {
					aa.cap.createAppHierarchy(capIdValue, capId);
					logDebug("Record already exists, linked this Request as a parent to the existing record: " + capIdValue + ", " + CurrentCapStatus);
				} else if (relation == "child") {
					var result = aa.cap.createAppHierarchy(capId, capIdValue);
					logDebug("Record already exists, linked this Request as a child to the existing record: " + capIdValue + ", " + CurrentCapStatus);
				}
				copyContacts(capId, capIdValue);

				updateAppStatus(jsonRecordStatus, "By AUTO_ROUTE_SERVICE_REQUEST script", capIdValue);


				// OMATKARI skip following block if followUpRecordType is not configured
				if(followUpRecordType == null || followUpRecordType == undefined || followUpRecordType == '')
					continue;
				// get child follow up records
				// TO DO: config followUpRecordType
				var followUpRecordSearch = getChildren(followUpRecordType, capIdValue);
				for (f in followUpRecordSearch) {
					var followUpCapId = followUpRecordSearch[f];
					var followUpCap = aa.cap.getCap(followUpCapId).getOutput();
					var holdId = capId;
					capId = followUpCapId;

					// find the follow up record by followUpRecordStatus
					if (followUpCap.getCapStatus() == followUpRecordStatus) {
						logDebug("Found a matching record: " + followUpCapId.getCustomID() + ", " + followUpRecordType + ", " + followUpRecordStatus);
						// check if there is already a scheduled new inspection
						inspId = getScheduledInspId(newInspectionType);
						if (inspId) {
							logDebug("There's already a new inspection scheduled.")
							break;
						}

						// look for a scheduled follow up inspection
						inspId = getScheduledInspId(followUpInspectionType);

						logDebug("Inspection Search: " + inspId);

						if (inspId) {
							// copy the follow up inspection to a new inspection and auto schedule
							logDebug("Found existing follow up inspection, copy to new and cancel.");
							var thisInspScript = aa.inspection.getInspection(followUpCapId, inspId).getOutput();
							var thisInspModel = thisInspScript.getInspection();
							thisInspModel.setInspectionType(newInspectionType);

							var copyResult = aa.inspection.copyInspectionWithGuideSheet(followUpCapId, followUpCapId, thisInspModel);
							if (copyResult.getSuccess()) {
								logDebug("Successfully copied and scheduled followup inspection to a new inspection: " + newInspectionType);
							} else {
								logDebug("ERROR: Could not copy follow up inspection to new inspection: " + copyResult.getErrorMessage());
							}

							// cancel the follow up inspection
							var cancelResult = aa.inspection.cancelInspection(followUpCapId, inspId);
							if (cancelResult.getSuccess()) {
								logDebug("Successfully cancelled existing inspection: " + followUpInspectionType + ", " + inspId);
							} else {
								logDebug("ERROR: Error canceling existing inspection: " + followUpInspectionType + ", " + inspId);
							}
						} else {
							logDebug("No existing new or follow up inspections, scheduling a new one. " + followUpInspectionType);
							// catch all - schedule a new inspection if all else fails
							if (newInspectionPending && newInspectionType) {
								createPendingInspection(newInspectionGroup, newInspectionType, newId, "Auto Routed from 311.");
								inspId = getPendingInspId(newInspectionType);
								logDebug("Successfully created pending inspection: " + newInspectionType + ":" + inspId);
							} else {
								var schedDaysAhead = inspectDaysAhead || 0;
								scheduleInspection(newInspectionType, schedDaysAhead, currentUserID);
								inspId = getScheduledInspId(newInspectionType);
								logDebug("Successfully created scheduled inspection: " + newInspectionType + ":" + inspId);
							}
						}

						if (inspId) {
							autoScheduleInspection(followUpCapId, inspId, new Date());
							logDebug("Successfully auto assigned inspection: " + newInspectionType);
						}
					}
					capId = holdId;
				}
			}
		}
	}
	// no existing records
	// do configuration for when there are no existing records
	if (!isRecordTypeExists) {
		// check if we already have a relationship to eliminate duplicates when we don't have an address
		//if (!checkRelationRecordExists(jsonRecordType, relation))
		//	return;

		logDebug("No existing Record: " + jsonRecordType + ", " + jsonRecordStatus);
		var recordArray = jsonRecordType.split("/");
		var appCreateResult = aa.cap.createApp(recordArray[0], recordArray[1], recordArray[2], recordArray[3], "");

		if (appCreateResult.getSuccess()) {
			var newId = appCreateResult.getOutput();
			if (relation == "child") {
				aa.cap.createAppHierarchy(capId, newId);
				logDebug("create child record " + newId);
			} else if (relation == "parent") {
				aa.cap.createAppHierarchy(newId, capId);
				logDebug("create Parent record " + newId);
			}

			updateAppStatus(jsonRecordStatus, "By AUTO_ROUTE_SERVICE_REQUEST script", newId);

			// Added by Osama Matkari 10/2/2018
			copyAssets(cap.getCapModel(), newId);

			copyContacts(capId, newId);
			copyAddresses(capId, newId);
			copyParcels(capId, newId);
			copyOwner(capId, newId);
			copyAppSpecific(newId);

			var descOfWork = workDescGet(capId);

			updateWorkDesc(descOfWork, newId);

			// Update parent record's app name
			var capScriptModel = aa.cap.getCap(newId);
			if(capScriptModel.getSuccess()){
				capType = capScriptModel.getOutput().getCapType();
				capTypeAlias = capType.alias;
			}
			editAppName(capTypeAlias, newId);

			// Route to department
			if (routeToDept) {
				// assign initial workflow task to department
				assignCapToDept(routeToDept, newId);
			}

			// execute ASA for record
			if (Fire_ASA_Event) {
				runASAForCapId(newId);
			}

			/* Removing this on new record, this should live in ASA if a new record is created

			// Create inspections and auto assign
			holdId = capId;
			capId = newId;
			logDebug("newInspectionPending: " + newInspectionPending);
			logDebug("newInspectionGroup: " + newInspectionGroup);
			logDebug("newInspectionType: " + newInspectionType);
			logDebug("inspectDaysAhead: " + inspectDaysAhead);

			if (newInspectionPending && newInspectionType) {
			createPendingInspection(newInspectionGroup, newInspectionType, newId, "Auto Routed from 311.");
			inspId = getPendingInspId(newInspectionType);
			logDebug("inspId: " + inspId);
			} else {
			var schedDaysAhead = inspectDaysAhead || 0;

			scheduleInspection(newInspectionType, schedDaysAhead, currentUserID);
			inspId = getScheduledInspId(newInspectionType);
			logDebug("inspId: " + inspId);

			}
			if (inspId) {
			autoScheduleInspection(newId, inspId, new Date());
			logDebug("Successfully created inspection on the Enforcement case: " + newInspectionType);
			}

			capId = holdId;

			 */
		}
	}
}

/**
 * Copy (Clone) Assets
 * @param sourceCapModel source record, accepts CAP Model Only
 * @param targetCapIdModel target record, accepts CapID Model Only
 * @returns boolean False on error
 */
function copyAssets(sourceCapModel, targetCapIdModel) {
	var cloneRes = aa.asset.cloneAssets(sourceCapModel, targetCapIdModel);
	if (!cloneRes.getSuccess()) {
		logDebug("**Error cloning assets : " + cloneRes.getErrorMessage());
		return false;
	}
	logDebug("Assets copied successfully...");
	return true;
}

function isCustomFieldsMatchJson(customFieldsJson) {

	//no contact rules in JSON
	if (!customFieldsJson) {
		return true;
	}
	var customFieldMatched = true;
	for (var cf in customFieldsJson) {
		var customFieldsValues = customFieldsJson[cf].split("|");
		for (var cfv in customFieldsValues) {

			var recordValue = GetASIValue(cf);
			logDebug("Comparing Custom Field Value Criteria: " + customFieldsValues[cfv] + " = " + recordValue + "<br><br>");
			// this to handle in case the field is check box and we need to check if its un checked
			// Accela always returns null in case of the check box is not checked.
			if (recordValue == null && customFieldsValues[cfv] == "UNCHECKED") {
				customFieldMatched = true;
				break;
			} else if (!customFieldsValues[cfv].equals(recordValue) && !customFieldsValues[cfv].equals("!Null") && !customFieldsValues[cfv].equals("!0")) {
				customFieldMatched = false;
			} else if (customFieldsValues[cfv].equals("!Null") && (recordValue == null || recordValue == "")) {
				customFieldMatched = false;
			} else if (customFieldsValues[cfv].equals("!0") && (recordValue == 0)) {
				customFieldMatched = false;
			} else {
				customFieldMatched = true;
				break;
			}
		}
		if (!customFieldMatched)
			break;
	}
	return customFieldMatched;
}

function GetASIValue(asiFieldName) {
	if (controlString == "ApplicationSubmitBefore") {
		return AInfo[asiFieldName];
	} else if (publicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return getFieldValue(asiFieldName, asiGroups);
	} else {
		return AInfo[asiFieldName];
	}
}

function isWorkFlowMatchJson(wfRules) {
	var status = true;
	var results = [];
	if (wfRules == null || wfRules == "")
		return status;
	for (i in wfRules) {

		var currentTask = i;
		var splitedStatus = {};
		splitedStatus = wfRules[i].split("|");
		for (x in splitedStatus) {
			if (!isTaskStatus(currentTask, splitedStatus[x])) {
				results[currentTask] = false;
			} else {
				results[currentTask] = true;
				break;
			}
		}
	}

	for (y in results) {
		if (results[y] == false) {
			status = false;
		}
	}
	return status;

}

/**
 * this function to get the related records that linked to the same address that linked to the current cap
 * @param StreetName
 * @param HouseNumberStart
 * @param StreetSuffix
 * @param StreetDirection
 * @returns array of capIdScriptModel
 */
function getRelatedCapsByAddressAttributes(StreetName, HouseNumberStart, StreetSuffix, StreetDirection) {
	var retArr = new Array();

	if (isNaN(HouseNumberStart) || HouseNumberStart == null || HouseNumberStart == "") {
		HouseNumberStart = 0;
	} else {
		HouseNumberStart = parseInt(HouseNumberStart)
	}

	capAddResult = aa.cap.getCapListByDetailAddress(StreetName, HouseNumberStart, StreetSuffix, null, StreetDirection, null);
	if (capAddResult.getSuccess()) {
		var capIdArray = capAddResult.getOutput();
	} else {
		logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
		return false;
	}

	// loop through related caps
	for (cappy in capIdArray) {
		retArr.push(capIdArray[cappy]);

	} // loop through related caps

	if (retArr.length > 0)
		return retArr;

}

/**
 * get list of Child records, related to Current capId
 * @param recordType
 * @returns array of CapIdModel
 */
function getChilds(recordType) {
	var caps = aa.cap.getChildByMasterID(capId);
	if (caps.getSuccess()) {
		caps = caps.getOutput();
	} else {
		logDebug("**INFO: getChilds returned an error: " + caps.getErrorMessage());
		return null;
	}

	if (!caps.length) {
		logDebug("**INFO: getChilds function found no children");
		return null
	}

	var recordTypeArray = null;
	var resultArray = new Array();

	for (c in caps) {
		//All
		if (recordType == null || recordType.equals("")) {
			resultArray.push(caps[c].getCapID());
		} else if (caps[c].getCapType().toString().equals(recordType)) {
			resultArray.push(caps[c].getCapID());
		} //recordTypeArray !null
	} //for all childs
	return resultArray;
}

function checkRelationRecordExists(CapType, relation) {
	var valid = true;
	if (relation == "parent") {
		var currentParentsRecords = getCapRelatedParents(CapType);
		if (currentParentsRecords != null && currentParentsRecords.length > 0)
			valid = false;

	} else if (relation == "child") {
		var currentChildsRecords = getChildren(CapType, capId);
		if (currentChildsRecords != null && currentChildsRecords.length > 0)
			valid = false;

	}
	return valid;
}

/**
 * function to get parents based on the cap type.
 * @param pAppType
 */
function getCapRelatedParents(pAppType) {
	var parents = aa.cap.getProjectByChildCapID(capId, "", "").getOutput();
	var parentsArray = new Array();
	for (p in parents) {
		var pCapId = parents[p].getProjectID();
		var CurrentCap = aa.cap.getCap(pCapId).getOutput();
		var CurrentCap = aa.cap.getCap(pCapId).getOutput();
		var CurrentCapType = CurrentCap.getCapType().toString();

		if (CurrentCapType.equalsIgnoreCase(pAppType)) {
			parentsArray.push(pCapId);
		}
	}
	return parentsArray;
}

/**
 *  Assign a record to a department
 *  @param assignId - Department Name
 *  @param [capId] - Optional CapIdModel
 *  @return boolean true/false
 */
function assignCapToDept(deptName) // option CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args
		var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
		return false;
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return false;
	}
	cd = cdScriptObj.getCapDetailModel();
	var deptKey;
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt) {
		var m = dpt[thisdpt]
			//exploreObject(m);
			if (deptName.equals(m.getDeptName())) {
				deptKey = m.departmentModel;
				cd.setAsgnDept(deptKey);
				cdWrite = aa.cap.editCapDetail(cd)
					if (cdWrite.getSuccess()) {
						logDebug("Assigned record to department: " + deptName)
					} else {
						logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage());
						return false;
					}
			}
	}
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
	if (typeof(partialCap) !== "undefined") {
		ppartialCap = partialCap;
	} else {
		ppartialCap = null;
	}
	var pparentCapId;
	if (typeof(parentCapId) !== "undefined") {
		pparentCapId = parentCapId;
	} else {
		pparentCapId = null;
	}
	var pCreatedByACA;
	if (typeof(CreatedByACA) !== "undefined") {
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
