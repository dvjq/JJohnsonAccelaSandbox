if (wfTask == "Reporting" && wfStatus == "Accepted") {
    feeSchedule = "LIC_TOT_APP";
    parentId = getParent();
    // get amounts paid on each fee on the parent
    saveCapId = capId; capId = parentId;
    TOT_020_Amt = feeAmount("TOT_020", "INVOICED");
    TOT_031_Amt = feeAmount("TOT_031", "INVOICED");
    TOT_030_Amt = feeAmount("TOT_030", "INVOICED");
    TOT_060_Amt = feeAmount("TOT_060", "INVOICED");
    TOT_065_Amt = feeAmount("TOT_065", "INVOICED");
    TOT_020_Paid = feeAmount("TOT_020", "INVOICED") - feeBalance("TOT_020");
    TOT_055_Paid = feeAmount("TOT_055", "INVOICED") - feeBalance("TOT_055");
    TOT_031_Paid = feeAmount("TOT_031", "INVOICED") - feeBalance("TOT_031");
    TOT_030_Paid = feeAmount("TOT_030", "INVOICED") - feeBalance("TOT_030");
    TOT_050_Paid = feeAmount("TOT_050", "INVOICED") - feeBalance("TOT_050");
    TOT_040_Paid = feeAmount("TOT_040", "INVOICED") - feeBalance("TOT_040");
    TOT_060_Paid = feeAmount("TOT_060", "INVOICED") - feeBalance("TOT_060");
    TOT_065_Paid = feeAmount("TOT_065", "INVOICED") - feeBalance("TOT_065");
    TOT_080_Paid = feeAmount("TOT_080", "INVOICED") - feeBalance("TOT_080");
    TOT_070_Paid = feeAmount("TOT_070", "INVOICED") - feeBalance("TOT_070");
    capId = saveCapId;


    tax = AInfo["Tax"];
    overCollectedTax = AInfo["Overcollected Tax"];
    atid = AInfo["ATID"];
    if (atid && (atid == "Yes" || atid == "Y")) {
        totType = AInfo["TOT Type"];
        switch ("" + totType) {
            case "Hotel":
                if (tax || overCollectedTax) {
                    // 6-6 Fee Amt is not impacted by amt paid. It is the new fee minus the old fee
                    feeAmt = ((parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0))  - TOT_020_Amt;
                    addFee("TOT_020", feeSchedule, "FINAL", feeAmt, "Y");
                }
                break;
            case "Online Travel Companies":
                amt = AInfo["Online Travel Company Tax"];
                if (amt && parseFloat(amt) > 0)
                    addFee("TOT_055", feeSchedule, "FINAL", amt - feeAmount("TOT_065", "INVOICED"), "Y");
                break;
            case "Short-Term Rental":
                if (tax || overCollectedTax) {
                    feeAmt = ((parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0)) - TOT_031_Amt;
                    addFee("TOT_031", feeSchedule, "FINAL", feeAmt, "Y");
                }
                break;
            case "Timeshare":
                if (tax || overCollectedTax) {
                    feeAmt = ((parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0)) - TOT_030_Amt;
                    addFee("TOT_030", feeSchedule, "FINAL", feeAmt, "Y");
                }
                break;
            default:
                logDebug("Unknown TOT type :" + totType);
        }  
    }
    interest = AInfo["Interest"];
    if (interest && parseFloat(interest) > 0)
        addFee("TOT_050", feeSchedule, "FINAL", parseFloat(interest) - TOT_050_Paid, "Y");
    penalty = AInfo["Penalty"];
    if (penalty && parseFloat(penalty) > 0)
            addFee("TOT_040", feeSchedule, "FINAL", parseFloat(penalty) - TOT_040_Paid, "Y");
    atidAssessment = AInfo["ATID Assessment"];
    atidOverCollected = AInfo["ATID Overcollected"];
    if (atidAssessment || atidOverCollected) {
        sum = ((parseFloat(atidAssessment)*1 || 0) + (parseFloat(atidOverCollected)*1 || 0)) - TOT_060_Amt;
        addFee("TOT_060", feeSchedule, "FINAL", sum, "Y");
    }
    otcATID = AInfo["Online Travel Companies ATID"];
    if (otcATID && parseFloat(otcATID) > 0)
        addFee("TOT_065", feeSchedule, "FINAL", parseFloat(otcATID) - TOT_065_Amt, "Y");
    atidInterest = AInfo["ATID Interest"];
    if (atidInterest && parseFloat(atidInterest) > 0)
        addFee("TOT_080", feeSchedule, "FINAL", parseFloat(atidInterest) - TOT_080_Paid, "Y");  
    atidPenalty = AInfo["ATID Penalty"];
    if (atidPenalty && parseFloat(atidPenalty) > 0)
            addFee("TOT_070", feeSchedule, "FINAL", parseFloat(atidPenalty) - TOT_070_Paid, "Y"); 
}