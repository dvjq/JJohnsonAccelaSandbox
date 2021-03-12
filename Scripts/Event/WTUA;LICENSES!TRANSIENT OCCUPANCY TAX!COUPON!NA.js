if (wfTask == "Reporting" && wfStatus == "Accepted") {
    feeSchedule = "LIC_TOT_APP";

    tax = AInfo["Tax"];
    overCollectedTax = AInfo["Overcollected Tax"];
    atid = AInfo["ATID"];
	amtOTC = AInfo["OTC"];
	totType = AInfo["TOT Type"];
	switch ("" + totType) {
		case "Hotel":
			if (tax || overCollectedTax) {
				addFee("TOT_020", feeSchedule, "FINAL", (parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0), "Y");
			}
			if (amtOTC) {
				addFee("TOT_055", feeSchedule, "FINAL", (parseFloat(amtOTC)*1 || 0), "Y");
			}
			break;
		case "Online Travel Companies":
			if (amtOTC || overCollectedTax) {
				addFee("TOT_055", feeSchedule, "FINAL", (parseFloat(amtOTC)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0), "Y");
			}
			break;
		case "Short-Term Rental":
			if (tax || overCollectedTax) {
				addFee("TOT_031", feeSchedule, "FINAL", (parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0), "Y");
			}
			if (amtOTC) {
				addFee("TOT_055", feeSchedule, "FINAL", (parseFloat(amtOTC)*1 || 0), "Y");
			}
			break;
		case "Timeshare":
			if (tax || overCollectedTax) {
				addFee("TOT_030", feeSchedule, "FINAL", (parseFloat(tax)*1 || 0) + (parseFloat(overCollectedTax)*1 || 0), "Y");
			}
			if (amtOTC) {
				addFee("TOT_055", feeSchedule, "FINAL", (parseFloat(amtOTC)*1 || 0), "Y");
			}
			break;
		default:
			logDebug("Unknown TOT type :" + totType);
	}
    interest = AInfo["Interest"];
    if (interest && parseFloat(interest) > 0)
        addFee("TOT_050", feeSchedule, "FINAL", parseFloat(interest), "Y");
    penalty = AInfo["Penalty"];
    if (penalty && parseFloat(penalty) > 0)
            addFee("TOT_040", feeSchedule, "FINAL", parseFloat(penalty), "Y");
    atidAssessment = AInfo["ATID Assessment"];
    atidOverCollected = AInfo["ATID Overcollected"];
    if (atidAssessment || atidOverCollected) {
        sum = (parseFloat(atidAssessment)*1 || 0) + (parseFloat(atidOverCollected)*1 || 0);
        if (sum > 0)
            addFee("TOT_060", feeSchedule, "FINAL", sum, "Y");
    }
    otcATID = AInfo["OTC ATID"];
    if (otcATID && parseFloat(otcATID) > 0)
        addFee("TOT_065", feeSchedule, "FINAL", parseFloat(otcATID), "Y");
    atidInterest = AInfo["ATID Interest"];
    if (atidInterest && parseFloat(atidInterest) > 0)
        addFee("TOT_080", feeSchedule, "FINAL", parseFloat(atidInterest), "Y");  
    atidPenalty = AInfo["ATID Penalty"];
    if (atidPenalty && parseFloat(atidPenalty) > 0)
            addFee("TOT_070", feeSchedule, "FINAL", parseFloat(atidPenalty), "Y"); 
}