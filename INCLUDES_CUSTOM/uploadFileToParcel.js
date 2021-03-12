function uploadFileToParcel(parcelId, filePath, fileName){
    var inStream = new com.accela.io.AutoDestoryFileInputStream(filePath);
    var docHelper = new com.accela.av360.commons.document.DocumentHelper();
    var edmsSource = "ADS";
    var ads = docHelper.getAdaptor(edmsSource,lookup("EDMS",edmsSource));
    var fileLen = inStream.available();
    var fileType = docHelper.getMimeTypeByFileName(fileName);
    if(!fileType){
        fileType = "application/octet-stream";
    }
    var parcelModel = new com.accela.v360.document.EntityModel(aa.getServiceProviderCode(),parcelId,"PARCEL");
    var documentModel = new com.accela.aa.ads.ads.DocumentModel();

    if(fileLen <= 0){
        return new com.accela.aa.emse.dom.ScriptResult(false,"","Upload failed. Unable to get file contents.",null);
    }

    documentModel.setServiceProviderCode(aa.getServiceProviderCode());
    documentModel.setRecFulNam(aa.getAuditID() || "SYSTEM");
    documentModel.setFileName(fileName);
    documentModel.setDocName(fileName);
    documentModel.setDocType(fileType);
    documentModel.setDocCategory("");
    documentModel.setDocDescription("");
    documentModel.setSourceName(edmsSource);
    try{
        var retDoc = ads.doUpload(parcelModel, documentModel,"",inStream,false);
        return new com.accela.aa.emse.dom.ScriptResult(true,"","",retDoc);
    }
    catch(err){
        return new com.accela.aa.emse.dom.ScriptResult(false,"","Upload failed. ",err);
    }
    
}

function lookup(stdChoice,stdValue){
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
}

function logDebug(msg){
    aa.print(msg);
}