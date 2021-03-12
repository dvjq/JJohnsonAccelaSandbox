if (wfTask == "Application Acceptance" && wfStatus == "Accepted") {
		
	//PRJAUT-2017-00204 US #26 (Yazan Barghouth)
	//Event: //Event: ASA;LICENSES!TRANSIENT OCCUPANCY TAX!NA!NA
	try {
		var busOpenDate = AInfo["Business Opened Date"];
		if (busOpenDate) {
			var busOpenDateAry = busOpenDate.split("/");
			var openMonth = busOpenDateAry[0] * 1;

			var busOpenDays = dateDiff(busOpenDate, aa.util.now());
			var busOpenMonths = Math.floor(busOpenDays / 30);

			var childrentAltIdsAry = new Array();
			var loopCount = 0;
			for (var f = 0; f < busOpenMonths; f++) {
				if (f > 0){
					var tmpNextDateAry = dateNextOccur((openMonth + f), 1, busOpenDate).split("/");
				}
				else{
					var tmpNextDateAry = busOpenDate.split("/");
				}
				var nextMonthFormatted = tmpNextDateAry[0].length == 1 ? "0" + tmpNextDateAry[0] : tmpNextDateAry[0];
				childrentAltIdsAry.push(tmpNextDateAry[2] + "-" + nextMonthFormatted);
				loopCount++;
				if (loopCount>100) {
					logDebug("exceeded max month count");
					break;
				}
			}
			loopCount = 0;
			logDebug("Creating coupons: " + childrentAltIdsAry.length);
			for (m in childrentAltIdsAry) {
				logDebug("creating coupon for : " + childrentAltIdsAry[m]);
				var newCapId = createAssociateTempRecord("Licenses", "Transient Occupancy Tax", "Coupon", "NA",childrentAltIdsAry[m],"Coupon " + childrentAltIdsAry[m],capId);
				var currAltId = newCapId.getCustomID();
				currAltId = currAltId.split("-");
				var newAltId = currAltId[0] + "-" + childrentAltIdsAry[m] + "-" + currAltId[1];
				aa.cap.updateCapAltID(newCapId, newAltId);
				//set ASI field for month and year
				editAppSpecific("TOT_Return_Year_month", childrentAltIdsAry[m],newCapId);

				loopCount++;
				if (loopCount>100) {
					logDebug("exceeded max record creation count");
					break;
				}
			}
		} else {
			logDebug("**WARN 'Business Opened Date' empty or null, ASA:" + appTypeString);
		}
	} catch (ex) {
		logDebug("**WARN in script ASA:" + appTypeString + " ex:" + ex);
	}
}



function createAssociateTempRecord(grp,typ,stype,cat,desc,appName,pCapId) 
//
// creates the new application and returns the capID object
//
{
	var capModel = aa.cap.newCapScriptModel().getOutput();
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (capModel){
        //pcontTypeArray = new Array
        contTypeArray = new Array()
		// create capTypeModel
        var capTypeMod = capModel.getCapType()

        capTypeMod.setGroup(grp)
        capTypeMod.setType(typ)
        capTypeMod.setSubType(stype)
        capTypeMod.setCategory(cat)
        
        appCreateResult = aa.cap.createSimplePartialRecord(capTypeMod, appName, "INCOMPLETE EST")
        logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat); 

        if(appCreateResult.getSuccess())
            {
		    var newId = appCreateResult.getOutput();
            logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

            // create Detail Record
            capDetailModel = capModel.getCapModel().getCapDetailModel();
		    capDetailModel.setCapID(newId);
            aa.cap.createCapDetail(capDetailModel);
			//Set description
			updateWorkDesc(desc,newId);
			
			//create relationship to parent
			aa.cap.createAmendmentCap(pCapId,newId,true);
			
            return newId;
        }
	}
}