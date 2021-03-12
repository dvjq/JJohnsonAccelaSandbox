/**
 * Workflow automation for all Enforcement
 * @namespace WTUA:ENFORCEMENT///
 * @requires INCLUDES_CRM
 */

eval(getScriptText("INCLUDES_CRM", null, false));

logDebug("*** BEGIN process_WF_JSON_Rules for CRM (ENFORCEMENT) ***");
// execute workflow propagation rules
process_WF_JSON_Rules(capId, wfTask, wfStatus);
logDebug("*** FINISH process_WF_JSON_Rules for CRM (ENFORCEMENT) ***");

if (appMatch('Enforcement/Zoning/Case/Case') && wfTask == "Collections" && wfStatus == "Civil Penalty Issued") {
	addFee("C_R_ENF_10", "ENF_ZONING", "FINAL", 1, "Y");
}

if (appMatch('Enforcement/Property Maintenance/Case/Case') && wfTask == "Collections" && wfStatus == "Sanitation Lien") {
	addStdCondition("Property", "Lien");
}



if(wfTask=="Abatement" && wfStatus.indexOf("Corrected") > -1){
    addRecordToMailerSet(capId, "ENF_INVOICE_1ST_NOTICE", "Invoice", "Open");
}

if(wfTask=="Appeal and Hearing" && wfStatus.indexOf("Hearing Held") > -1){
    addRecordToMailerSet(capId, "ENF_INVOICE_1ST_NOTICE", "Invoice", "Open");
}

 /** 
     * addRecordToMailerSet(recordIdObject,setPrefix,setType,setStatus);
     */
    function addRecordToMailerSet(recordIdObject, setPrefix, setType, setStatus) {
        // search for an open mailer set, if it doesn't exist, create a new one
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
