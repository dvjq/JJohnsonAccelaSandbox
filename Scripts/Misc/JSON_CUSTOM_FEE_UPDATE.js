/**
 * Pre, Post, Custom Scripts
 * Story Number: NA
 * Developer: Accela - jtu@accela.com
 * 
 * Date: March 22, 2018
 */
/**
 *@namespace Accela
 *@description This is used for pre, post and custom scripts used by the standard JSON scripts.
 *
 */

 //Record Name: Record Automation (Business Licensing)
 //Story ID: 1-4
 if (appMatch("Licenses/Alcoholic Beverage/Annual/Application") || appMatch("Licenses/Alcoholic Beverage/Annual/Renewal")) {
    var openDate = getAppSpecific("Desired Open Date");
    var locProcType = getAppSpecific("Location Processing Type");
	var addrResult = aa.address.getAddressByCapId(capId);
	var addrArray = addrResult.getOutput();
	var addrZip = addrArray[0].getZip();
    var expMonth = parseInt(lookup("ABC_ZIP_CODES", addrZip)) + 1;
    var todayDate = new Date();
	var vDay = todayDate.getDate();
	var vMonth = todayDate.getMonth() + 1;
    var vYear = todayDate.getFullYear();
    var numOfDays = 0;
    logDebug("addrZip: " + addrZip);
    logDebug("expMonth: " + expMonth);
    logDebug("vMonth: " + vMonth);
	logDebug("vYear: " + vYear);
	logDebug("Location Processing Type: " + locProcType);
    var myTable = loadASITable("ENDORSEMENT INFO");

    for(i=0; i<myTable.length; i++) {
        var endType = myTable[i]["Endorsement Type"];
        var numOfEnd = myTable[i]["Number of Endorsements"];
        var feeCode = lookup("LIC_ABC_ENDORSEMENT_TYPE", endType);

        if(locProcType == "Zip Code") {
            if(expMonth <= vMonth) {
                var expDate = new Date(vYear + 1, expMonth, 0);
            } else {
                var expDate = new Date(vYear, expMonth, 0);
            }

            numOfDays = moment(expDate).diff(moment(openDate), 'days');
        } else if(locProcType == "August 31") {
            if((vMonth == 8 && vDay == 31) || (vMonth <= 8)) {
                var expDate = new Date(vYear, 8, 0);
            } else {
                var expDate = new Date(vYear + 1, 8, 0);
            }

            numOfDays = moment(expDate).diff(moment(openDate), 'days');
        } else {
            if((vMonth == 7 && vDay == 31) || (vMonth <= 7)) {
                var expDate = new Date(vYear, 7, 0);
            } else {
                var expDate = new Date(vYear + 1, 7, 0);
            }

            numOfDays = moment(expDate).diff(moment(openDate), 'days');
        }

        if(numOfDays <= 180 && appMatch("Licenses/Alcoholic Beverage/Annual/Application")) {
            numOfEnd = numOfEnd / 2;
        }
        logDebug("numOfEnd: " + numOfEnd);
        logDebug("openDate: " + openDate);
	    logDebug("expDate: " + expDate);

        updateFee(feeCode, "LIC_ABA", "FINAL", numOfEnd, "Y");
    }
 }


 //Record Name: Record Automation (Business Licensing)
 //Story ID: 5
 if (appMatch("Licenses/Adult Entertainment/Business/Application")) {
    var todayDate = new Date();
	var vDay = todayDate.getDate();
	var vMonth = todayDate.getMonth() + 1;
    var vYear = todayDate.getFullYear();
    var numOfMonths = 0;

    if((vMonth == 6 && vDay == 30) || (vMonth <= 6)) {
        var expDate = new Date(vYear, 6, 0);
    } else {
        var expDate = new Date(vYear + 1, 6, 0);
    }

    numOfMonths = moment(expDate).diff(moment(todayDate), 'months');

    updateFee("AEA_010", "LIC_AEA", "FINAL", numOfMonths, "Y");
 }


 //Record Name: Record Automation (APCD)
 //Story ID: 2-4
 if (appMatch("APCD/Asbestos/Permit/NA")) {
    var friWoGb = getAppSpecific("Friable w/o Glovebags Increments");
    var gbIncrements = getAppSpecific("Glovebags Increments");
    var mFees = feeAmountExcept(capId, "ASB_030", "ASB_090", "ASB_110");
    var aFees = feeAmountExcept(capId, "ASB_010", "ASB_020", "ASB_040", "ASB_050", "ASB_060", "ASB_070", "ASB_080");
    var qtyAdjFee = 0;

    if(isEmpty(friWoGb) == false) {
        updateFee("ASB_050", "ENV_ASB", "FINAL", friWoGb, "Y");
    }

    if(isEmpty(gbIncrements) == false) {
        updateFee("ASB_070", "ENV_ASB", "FINAL", friWoGb, "Y");
    }

    qtyAdjFee = mFees - aFees;
    updateFee("ASB_100", "ENV_ASB", "FINAL", qtyAdjFee, "Y");
 }


 //Record Name: Record Automation (Planning)
 //Story ID: 11
 if (appMatch("Planning/Conditional Use Permit/Conditional Use Permit/Formal")) {
    var pmtType = getAppSpecific("Conditional Use Permit Type");

    if(pmtType != "Accessory Apartment" && pmtType != "Duplex Dwelling Unit" && pmtType != "Bed and Breakfast Inns" && pmtType != "Home Occupations" && pmtType != "Short Term Rental (Not primary address)") {
        updateFee("CUP_010", "PLN_CUP", "FINAL", 1000, "Y");
    }
}


 //Record Name: Record Automation (Planning)
 //Story ID: 17 & 19
 if (appMatch("Planning/Subdivision/Minor Subdivision Plat/NA")) {
    var pltType = getAppSpecific("Minor Plat Type");
    var wavPltReq = getAppSpecific("Waiver of Minor Plat Requirement");

    if(pltType == "Standard Minor Plat" && wavPltReq == null) {
        updateFee("MIN_010", "PLN_MIN_PLT", "FINAL", 200, "Y");
    } else if(pltType == "Standard Minor Plat" && wavPltReq == "CHECKED") {
        updateFee("MIN_010", "PLN_MIN_PLT", "FINAL", 270, "Y");
    }
}


//Record Name: Record Automation (Planning)
 //Story ID: 21
 if (appMatch("Planning/Landscape/Landscape Plan/NA")) {
    var lndPlan = getAppSpecific("Landscape Plan");
    var vehUseArea = getAppSpecific("Vehicular Use Area");
    var feeAmt = 0;

    if(lndPlan == "CHECKED") {
        feeAmt = (vehUseArea - 6000) / 1000 * 5;
    
        if(feeAmt <= 0) {
            feeAmt = 160;
        } else {
            feeAmt = feeAmt + 160;
        }
        
        updateFee("LPTP_020", "PLN_LSCP_PLN", "FINAL", feeAmt, "Y");
    }
}


 //Record Name: Record Automation (Planning)
 //Story ID: 22 - 31
 if (appMatch("Planning/Zoning/Change in Zoning-Form District/Formal")) {
    var zonDisProp = getAppSpecific("Zoning District Proposed");
    var acres = getAppSpecific("Acres to be Rezoned");
    var feeAmt = 0;
    var isEqual = false;
    var zonDisPropChk = ["R-5B Residential Two Family District", "R-R Rural Residential District", "R-E Residential Estate District", "R-1 Residential Single Family District", "R-2 Residential Single Family District", "R-3 Residential Single Family District", "R-4 Residential Single Family District", "R-5 Residential Single Family District", "U-N Urban Neighborhood District", "PRD Planned Residential Development District"];

    for(i=0; i<=zonDisPropChk.length; i++) {
        if(zonDisProp == zonDisPropChk[i]) {
            if(acres < 2) {
                feeAmt = 600;
            } else if(acres >= 2 && acres < 5) {
                feeAmt = 1200;
            } else if(acres > 5) {
                feeAmt = 2400;
            }

            isEqual = true;
            break;
        } else {
            if(acres < .25) {
                feeAmt = 600;
            } else if(acres >= .25 && acres < .5) {
                feeAmt = 1000;
            } else if(acres >= .5 && acres < 1) {
                feeAmt = 1500;
            } else if(acres >= 1 && acres < 2) {
                feeAmt = 2100;
            } else if(acres >= 2 && acres < 5) {
                feeAmt = 3000;
            } else if(acres >= 5 && acres < 10) {
                feeAmt = 4000;
            } else if(acres >= 10) {
                var addtlAcres = acres - 10;

                feeAmt = 4000 + (addtlAcres * 100);

                if(feeAmt > 7000) {
                    feeAmt = 7000;
                }
            }
        }
    }

    logDebug("zonDisProp " + zonDisProp);
	logDebug("acres " + acres);
    logDebug("feeAmt " + feeAmt);
    
    if(isEqual == true) {
        updateFee("CZFD_010", "PLN_CZ_FD", "FINAL", feeAmt, "Y");
    } else {
        updateFee("CZFD_020", "PLN_CZ_FD", "FINAL", feeAmt, "Y");
    }
}


 //Record Name: Record Automation (ROW)
 //Story ID: 1
 if (appMatch("PublicWorks/ROW/Encroachment/Permit")) {
    var lnCls = getAppSpecific("Lane Closure");
    var sdwlkCls = getAppSpecific("Sidewalk Closure");
    var rdCls = getAppSpecific("Road Closure");
    var ovrszLd = getAppSpecific("Oversized Load");
    var othMobFac = getAppSpecific("Other Mobile Facilities");
    var cbCt = getAppSpecific("Curb Cut");
    var devpmt = getAppSpecific("Development");
    var numNoPkSgs = getAppSpecific("Number of No Parking Signs");
    var hrsCarr = getAppSpecific("Horse-Drawn Carriages");
    var exvt = getAppSpecific("Excavation");
    var stWkDate = getAppSpecific("Start Work Date");
    var edWkDate = getAppSpecific("End Work Date");
    var numDays = Math.ceil(dateDiff(stWkDate, edWkDate));
	var numWeeks = Math.ceil(numDays / 7);

    logDebug("numDays: " + numDays);
	logDebug("numWeeks: " + numWeeks);
    

    if(lnCls == "CHECKED") {
        updateFee("PW_ENC_040", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(sdwlkCls == "CHECKED") {
        updateFee("PW_ENC_050", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(rdCls == "CHECKED") {
        updateFee("PW_ENC_070", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(ovrszLd == "CHECKED") {
        updateFee("PW_ENC_060", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(othMobFac == "CHECKED") {
        updateFee("PW_ENC_130", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(cbCt == "CHECKED") {
        updateFee("PW_ENC_100", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(devpmt == "CHECKED") {
        updateFee("PW_ENC_110", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(numNoPkSgs > 0) {
        updateFee("PW_ENC_090", "PW_ENCROACHMENT", "FINAL", numNoPkSgs * numWeeks, "Y");
    }

    if(hrsCarr == "CHECKED") {
        updateFee("PW_ENC_120", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }

    if(exvt == "CHECKED") {
        updateFee("PW_ENC_040", "PW_ENCROACHMENT", "FINAL", numWeeks, "Y");
    }
}


 //Record Name: Record Automation (ROW)
 //Story ID: 4 - 7
 if (appMatch("PublicWorks/ROW/Loading Zone/Application") || appMatch("PublicWorks/ROW/Loading Zone/Renewal")) {
    var ldZnLoc = getAppSpecific("Loading Zone Location");
    var lngthLdZn = getAppSpecific("Length of Loading Zone");
    var todayDate = new Date();
    var vMonth = parseInt(todayDate.getMonth() + 1);
	var feeYearAmt = lngthLdZn;
	var feePerMonthAmt = feeYearAmt / 12;
	var numMths = (13 - vMonth);
	var totFeeAmt = feePerMonthAmt * numMths;
    
    if(appTypeArray[3] == 'Application') {
	    if(ldZnLoc == "Outside Central Business District") {
	    	updateFee("PW_LZ_020", "PW_LOADINGZONE", "FINAL", totFeeAmt, "Y");
	    } else if(ldZnLoc == "Within Central Business District") {
	    	updateFee("PW_LZ_010", "PW_LOADINGZONE", "FINAL", totFeeAmt, "Y");
        }
    } else {
        if(ldZnLoc == "Outside Central Business District") {
	    	updateFee("PW_LZ_020", "PW_LOADINGZONE", "FINAL", lngthLdZn, "Y");
	    } else if(ldZnLoc == "Within Central Business District") {
	    	updateFee("PW_LZ_010", "PW_LOADINGZONE", "FINAL", lngthLdZn, "Y");
        }
    }
 }


 //Record Name: Record Automation (ROW)
 //Story ID: 8 & 10
 if (appMatch("PublicWorks/ROW/Outdoor Seating/Application") || appMatch("PublicWorks/ROW/Outdoor Seating/Renewal")) {
    var numTbl = getAppSpecific("Number of Tables");
    var numPlt = getAppSpecific("Number of Planters");
    var numUbl = getAppSpecific("Number of Umbrellas");
    var numBch = getAppSpecific("Number of Benches");
    var numBkRk = getAppSpecific("Number of Bike Racks");
    var numNewsInfo = getAppSpecific("Number of News and Information Distribution Boxes or Corrals");
    var numRptl = getAppSpecific("Number of Refuse Receptacles");
    var numOtr = getAppSpecific("Number of Other Pieces of Furniture");
 
    if(numTbl > 0) {
        if(numTbl <= 4) {
            var feeAmt = numTbl * 50;
        } else if(numTbl > 4 && numTbl <= 6) {
            var feeAmt = numTbl * 51;
        } else if(numTbl > 6 && numTbl <= 8) {
            var feeAmt = numTbl * 52;
        } else if(numTbl > 8 && numTbl <= 10) {
            var feeAmt = numTbl * 53;
        } else if(numTbl > 10) {
            var feeAmt = numTbl * 54;
        }
        updateFee("ROW_SF_020", "LIC_ROW_SF", "FINAL", feeAmt, "Y");
        logDebug("Fee amount for Number of Tables/Chairs is: " + feeAmount("ROW_SF_020"));
    }

    if(numPlt > 0) {
        updateFee("ROW_SF_030", "LIC_ROW_SF", "FINAL", numPlt, "Y");
        logDebug("Fee amount for Number of Planters is: " + feeAmount("ROW_SF_030"));
    }

    if(numUbl > 0) {
        updateFee("ROW_SF_040", "LIC_ROW_SF", "FINAL", numUbl, "Y");
        logDebug("Fee amount for Number of Umbrellas is: " + feeAmount("ROW_SF_040"));
    }

    if(numBch > 0) {
        updateFee("ROW_SF_050", "LIC_ROW_SF", "FINAL", numBch, "Y");
        logDebug("Fee amount for Number of Benches is: " + feeAmount("ROW_SF_050"));
    }

    if(numBkRk > 0) {
        updateFee("ROW_SF_060", "LIC_ROW_SF", "FINAL", numBkRk, "Y");
        logDebug("Fee amount for Number of Bike Racks is: " + feeAmount("ROW_SF_060"));
    }

    if(numNewsInfo > 0) {
        updateFee("ROW_SF_070", "LIC_ROW_SF", "FINAL", numNewsInfo, "Y");
        logDebug("Fee amount for Number of Boxes or Corrals is: " + feeAmount("ROW_SF_070"));
    }

    if(numRptl > 0) {
        updateFee("ROW_SF_080", "LIC_ROW_SF", "FINAL", numRptl, "Y");
        logDebug("Fee amount for Number of Refuse Receptacles is: " + feeAmount("ROW_SF_080"));
    }

    if(numOtr > 0) {
        updateFee("ROW_SF_090", "LIC_ROW_SF", "FINAL", numOtr, "Y");
        logDebug("Fee amount for Number of Other Furniture is: " + feeAmount("ROW_SF_090"));
    }
}


 //Record Name: Record Automation (ROW)
 //Story ID: 9
 if (appMatch("PublicWorks/ROW/Pod or Dumpster/NA")) {
    var stWkDate = getAppSpecific("Start Work Date");
    var edWkDate = getAppSpecific("End Work Date");
    var numDays = Math.ceil(dateDiff(stWkDate, edWkDate));
    var numWeeks = Math.ceil(numDays / 7);
    
    updateFee("WEEK", "PW_DUMPSTER", "FINAL", numWeeks, "Y");
 }


 //Record Name: Inspection Automation (Building)
 //Story ID: 1
 if (appMatch("Building/Electrical/*/*")) {
    var addInsp = getAppSpecific("Number of Additional Inspections");
    
    if(isEmpty(addInsp) == false) {
        updateFee("ELC_050", "BLD_COM_ELC", "FINAL", addInsp, "Y");
    }
 }