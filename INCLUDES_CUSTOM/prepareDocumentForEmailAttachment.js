/**
 * find a document on record and download it on disk, preparing it to be used on email attachment.
 * at least documentType or documentFileName should be passed, search priority for documentType.
 * 
 * @param itemCapId capId for record
 * @param documentType {String} document type to find on record, pass null or empty to ignore
 * @param documentFileName {String} file name of the document to find, pass null or empty to ignore
 * 
 * @returns {String} full path of the document if found, otherwise null
 */
function prepareDocumentForEmailAttachment(itemCapId, documentType, documentFileName) {

	if ((!documentType || documentType == "" || documentType == null) && (!documentFileName || documentFileName == "" || documentFileName == null)) {
		logDebug("**WARN at least docType or docName should be provided, abort...!");
		return null;
	}

	var documents = aa.document.getCapDocumentList(itemCapId, aa.getAuditID());

	if (!documents.getSuccess()) {
		logDebug("**WARN get cap documents error:" + documents.getErrorMessage());
		return null;
	} //get docs error

	documents = documents.getOutput();

	//sort (from new to old)
	documents.sort(function (d1, d2) {
		if (d1.getFileUpLoadDate().getTime() > d2.getFileUpLoadDate().getTime())
			return -1;
		else if (d1.getFileUpLoadDate().getTime() < d2.getFileUpLoadDate().getTime())
			return 1;
		else
			return 0;
	});

	//find doc by type or name
	var docToPrepare = null;
	for (var d in documents) {
		var catt = documents[d].getDocCategory();
		var namee = documents[d].getFileName();

		if (documentType && documentType != null && documentType != "" && documentType == catt) {
			docToPrepare = documents[d];
			break;
		}

		if (documentFileName && documentFileName != null && documentFileName != "" && namee.indexOf(documentFileName) > -1) {
			docToPrepare = documents[d];
			break;
		}
	} //for all docs

	//download to disk
	if (docToPrepare == null) {
		logDebug("**WARN No documents of type or name found");
		return null;
	} //no docs of type or name

	var thisCap = aa.cap.getCap(itemCapId).getOutput();
	var moduleName = thisCap.getCapType().getGroup();

	var toClear = docToPrepare.getFileName();
	toClear = toClear.replace("/", "-").replace("\\", "-").replace("?", "-").replace("%", "-").replace("*", "-").replace(":", "-").replace("|", "-").replace('"', "").replace("'", "").replace("<", "-").replace(">", "-").replace(" ", "_");
	docToPrepare.setFileName(toClear);

	var downloadRes = aa.document.downloadFile2Disk(docToPrepare, moduleName, "", "", true);
	if (downloadRes.getSuccess() && downloadRes.getOutput()) {
		return downloadRes.getOutput().toString();
	} else {
		logDebug("**WARN document download failed, " + docToPrepare.getFileName());
		logDebug(downloadRes.getErrorMessage());
		return null;
	} //download failed

	return null;
}