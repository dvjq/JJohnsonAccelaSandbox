/*------------------------------------------------------------------------------------------------------/
| Program : DPR_PRINT_SET_COMPLETE.js
| Event   : N/A
|
| Usage   : Called from API_DPR_SEND_NOTIFICATION when a printset is completed that was requested by the  
|           DPR service account.  Used to reconcile printsets and send emails to the customer
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/

// docId, docType variables populated with the created print set
eval(getScriptText("INCLUDES_DPR_LIBRARY"));

// reconcile approve plans if need be
/*
var approvedPlansType = "";
var approvedPlans = new Array();
var bizDomScriptResult = aa.bizDomain.getBizDomain("DPR_PRINTSET_TYPES");
if (bizDomScriptResult.getSuccess()) {
    var bizDomScript = bizDomScriptResult.getOutput();
    for (var i = 0; i < bizDomScript.size(); i++) {
        var sc = bizDomScript.get(i);
        if (sc.getAuditStatus() != "A") {
            continue;
        }
        var scValue = sc.getBizdomainValue();
        var scValueDesc = sc.getDescription();
        if (scValueDesc.indexOf("aca=yes") > -1) {
        	approvedPlansType = scValue;
        	break;

        } 
    }

    if (approvedPlansType != "") {
    	approvedPlans = Dpr.getPrintSets();
	    if (approvedPlans.length > 0) {
		    aa.debug("DPR","Approved Set" + ":" + docId + ":" + docType + ":" + userId);
		    for (var ap in approvedPlans) {
		    	if (docType.toUpperCase() == approvedPlans[ap].type.toUpperCase()) {
		    		if (parseInt(docId) != parseInt(approvedPlans[ap].file)) {
		    			Dpr.deletePrintSet(approvedPlans[ap].id);
		    			aa.debug("DPR","Print set deleted" + ": " + approvedPlans[ap].file);
		    		}
		    	}
		    }	    	
	    }
    } else {
    	aa.debug("DPR","No approved print set type configured");
    }    

} else {
    aa.debug("DPR","Unable to retrieve printset type configuration from standard choice");
}
*/

// Emailing approved plans email
// only send email if plans print set approved
if (docType == "Approved Plans") {
    var notificationObj = {};
    notificationObj.notificationId = "PLAN_REVIEW_COMPLETE_APPROVED";
    Dpr.sendDprEmailNotification(notificationObj);     
}
             
aa.debug("DPR","DPR_PRINT_SET_COMPLETE" + ":" + docId + ":" + docType + ":" + userId);				
