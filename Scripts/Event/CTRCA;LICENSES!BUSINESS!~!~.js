if (appMatch('Licenses/Business/General/Application') ) {
	createChildTempRecord(capId, "Licenses/Business/Restaurant/Application","Restaurant Business License Application")
}

if (appMatch('Licenses/Business/General/Application') ) {
	createChildTempRecord(capId, "Building/Commercial/Alteration/NA","Commercial Alteration Permit")
}


function createChildTempRecord(vCapId, recordTypeString, newRecordName) // optional groups to ignore
{
    var childId = null;
    var groupsIgnoreArray;
    if (arguments.length > 0) {
        groupsIgnoreArray = arguments[1];
    }

    // add check for existing reg record
    var cTypeArray = recordTypeString.split("/");
    ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
    ctm.setGroup(cTypeArray[0]);
    ctm.setType(cTypeArray[1]);
    ctm.setSubType(cTypeArray[2]);
    ctm.setCategory(cTypeArray[3]);
    var childId;
    var createChildResult = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE EST");
    if (createChildResult.getSuccess()) {
        childId = createChildResult.getOutput();
        logDebug("New Record ID: " + childId.getCustomID());
    } else {
        logDebug("ERROR Creating child temp record: " + createChildResult.getErrorMessage());
        return false;
    }
    var capId;
    var holdId = capId;
    capId=childId;
    //logDebug("updated record name: " + newRecordName)
    editAppName(newRecordName); 
    capId=holdId;

    // copy capModel with updated created by
    var capModel = aa.cap.getCap(vCapId).getOutput().getCapModel();
    var capCreatedBy = capModel.getCreatedBy();
    //logDebug("Copying created by: " + capCreatedBy);

    var childCapModel = aa.cap.getCap(childId).getOutput().getCapModel();
    childCapModel.setCreatedBy(capCreatedBy);
    childCapModel.setCreatedByACA("Y");

    var capUpdResult = aa.cap.editCapByPK(childCapModel);
    if(capUpdResult.getSuccess()==true){
        capUpdResult.getOutput();
        logDebug("Successfully updated created by to: " + capCreatedBy);
    }
    else {
        logDebug("**ERROR** Updating cap model: " + capUpdResult.getErrorMessage());
    }

    // Copy Cap Detail
    aa.cap.copyCapDetailInfo(vCapId, childId);

	//Copy Work Description Field
	aa.cap.copyCapWorkDesInfo(vCapId, childId);

    //copyAdditionalInfo(vCapId, childId);
    copyASIFields(vCapId, childId, null);

    // copy asit
    copyASITables(vCapId,childId);

    //copy contacts
    copyContacts(vCapId, childId);
    // copy licensed professionals
	copyLicensedProf(vCapId,childId);
    copyParcels(vCapId, childId);
    copyAddresses(vCapId, childId);
    copyOwnerLocal(vCapId, childId);
    copyDocuments(vCapId,childId);

    return childId;
}

//Function will copy all owners from source CAP (sCapID) to target CAP (tCapId)
function copyOwnerLocal(sCapID, tCapID)
{ 
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
        var ownrObj = ownrReq.getOutput();

        if(ownrObj !=null && typeof(ownrObj) != "undefined"){
			for (xx in ownrObj)
			{
				ownrObj[xx].setCapID(tCapID);
				aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
				logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
			}
		}else{
			logDebug("Warning: Error Copying Owner :: ownrObj = " + ownrObj);
		}
	}else{ 
		logDebug("Warning: No owners exist to copy");
	}
}

function copyDocuments(pFromCapId, pToCapId) {
    
          //Copies all attachments (documents) from pFromCapId to pToCapId
            var vFromCapId = pFromCapId;
            var vToCapId = pToCapId;
    
        var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
        if(capDocResult.getSuccess())
        {
          if(capDocResult.getOutput().size() > 0)
          {
            for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
              var documentObject = capDocResult.getOutput().get(docInx);
    
                        // download the document content
                        var useDefaultUserPassword = true;
                        //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                        var EMDSUsername = null;
                        var EMDSPassword = null;
    
                        var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                        if(downloadResult.getSuccess())
                        {
                            var path = downloadResult.getOutput();
                            var fileNames = new Array();
                            fileNames[0] = path;
                            //Send Email.
                            logDebug("path=" + path);
                        }
    
                        var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
                        documentObject.setDocumentNo(null);
                        documentObject.setCapID(vToCapId)
                        documentObject.setEntityID(tmpEntId);
    
                        // Open and process file
                        try
                        {
                            // put together the document content
                            var newContentModel = aa.document.newDocumentContentModel().getOutput();
                            inputstream = new java.io.FileInputStream(path);
                            newContentModel.setDocInputStream(inputstream);
                            documentObject.setDocumentContent(newContentModel);
    
                            var newDocResult = aa.document.createDocument(documentObject);
                            if (newDocResult.getSuccess())
                            {
                                newDocResult.getOutput();
                                logDebug("Successfully copied document: " + documentObject.getFileName());
                            }
                            else {
                                logDebug("Failed to copy document: " + documentObject.getFileName());
                                logDebug(newDocResult.getErrorMessage());
                            }
    
                        }
                        catch (err)
                        {
                            logDebug("Error copying document: " + err.message);
                            return false;
                        }
    
                    }
          }
        }
      }