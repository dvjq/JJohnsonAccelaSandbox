function runReportsAttach4Email(iCapId, deleteDuplicates, attach, customDescription, emailHashTable, notificationTemplateName, ccEmail, rptHashTable, rptName) {
    /*runReportsAttach4Email.js
     * iCapId: CapId that the report and email get attached to if appropriate parameters are passed in. Duplicate Docs also get removed from this
     *         record if appropriate parameters are passed in.
     * deleteDuplicates: Delete duplicates attachments on a record based on the file name. True: Yes; False: No;
     * attach: Attach newly generated report to the Record.  True: Yes; False: No, the report is still generated and attached to the
     *         record momentarily until a couple lines of code down where it is then removed.
     * customDescription: Used if a custom document description is desired instead of the default which is: primary contact first name
     *                    last name report engine name.  Example: Bob Jones License Certificate
     * emailHashTable: Hash Table of Notification Email Template parameters.
     * notificationTemplateName: Name of the notification template that will be sent out in email.
     * ccEmail: String of emails to be cc'd on the email.
     * rptHashTable: Hash Map of report parameters.
     * rptName: Name of the Report Engine that will be executed.
     *
     * This function is setup to run multiple reports if they are passed in. Just add more rptHastTable and rptName parameters to the end of
     * your function call.
     * Example runReportsAttach4Email(iCapId,deleteDuplicates,attach,customDescription,emailHashTable,notificationTemplateName,ccEmail,rptHashTable,
     *                                  rptName, rptHashTable,rptName). This will run 2 different Reports.
     */

    aa.print('-- BEGIN runReportsAttach4Email() --' + br);

    var iCap = aa.cap.getCap(iCapId).getOutput();
    var moduleName = null;
    if(iCap.getCapModel().getModuleName()) {
      moduleName = iCap.getCapModel().getModuleName();
    } else {
      moduleName = "";
      slackDebug(iCapId.getCustomID() + " : runReportsAttach4Email() : WARNING - Module is NULL.");
    }

    var contObj = getPrimaryContact(iCapId);
    var user = currentUserID; // Setting the User Name
    var rptFiles = [];
    var rtnDocs = [];
    var fileDescription = '';

    if (contObj) {
        if (contObj['firstName'] == null) contObj['firstName'] = '';
        if (contObj['lastName'] == null) contObj['lastName'] = '';
        if (contObj['businessName'] == null) contObj['businessName'] = '';

        fileDescription = contObj['firstName'] + ' ' + contObj['lastName'] == ' ' || contObj['firstName'] + ' ' + contObj['lastName'] == "null null" ? contObj['businessName'] : contObj['firstName'] + ' ' + contObj['lastName'];
    }

    aa.print('fileDescrip ' + fileDescription + br);

    //generate reports
    var rptCounter = 8;
    var rptHashTableCounter = 7;
    while (rptCounter < arguments.length) {
        var report = aa.reportManager.getReportInfoModelByName(arguments[rptCounter]);
        report = report.getOutput();
        report.setModule(moduleName);
        report.setCapId(iCapId.getID1() + "-" + iCapId.getID2() + "-" + iCapId.getID3());
        report.setReportParameters(arguments[rptHashTableCounter]);
        report.getEDMSEntityIdModel().setAltId(iCapId.getCustomID());

        if (aa.reportManager.hasPermission(arguments[rptCounter], user).getOutput().booleanValue()) {
            var reportResult = aa.reportManager.getReportResult(report);
            if (reportResult.getSuccess()) {
                reportResult = reportResult.getOutput();
                var reportFile = aa.reportManager.storeReportToDisk(reportResult);
                reportFile = reportFile.getOutput();
                if (reportFile) {
                    aa.print(br + "REPORT FILE BYTE ARRAY LENGTH: " + reportFile.length() + br);
                    var curName = stripFileName(reportResult.getName());
                    aa.print('curName: ' + curName + br);
                    var thisFileDescription = fileDescription + ' ' + arguments[rptCounter];
                    if (customDescription)
                        thisFileDescription = customDescription;
                    rptFiles.push(reportFile);
                    aa.print('thisFileDescription ' + thisFileDescription + br);

                    //File Deletion
                    var docArray = aa.document.getCapDocumentList(iCapId, 'ADMIN').getOutput();
                    for (var doc in docArray) {
                        var flName = stripFileName(docArray[doc].getFileName());

                        //Doc Name to search for using indexOf. Example: License_and_RenewalsLicense_Certificate_20180117_170829.pdf = License_and_RenewalsLicense_Certificate
                        var indexOfFileName = curName.substring(0, curName.lastIndexOf('_') - 9);
                        //aa.print('Current doc name: ' + flName + br);
                        //aa.print('indexOfFileName : ' + indexOfFileName + br);

                        if ((flName && flName.indexOf(indexOfFileName) == 0 && deleteDuplicates && flName != curName) || (!attach && flName && flName == curName)) {
                            aa.print('indexOfFileName : ' + indexOfFileName + br);
                            aa.print('Found Doc with Matching Name: ' + flName + br);
                            var results = aa.document.removeDocumentByPK(docArray[doc].getDocumentNo(), 'ADMIN', hexToStr(lookup('PERMISSION', 'ADMIN')), iCap.getServiceProviderCode());

                            if (results.getSuccess()) {
                                aa.document.updateDocument(docArray[doc]);
                                aa.print('Removed Doc: ' + docArray[doc].getDocumentNo() + ' Successfully!' + br);
                            } else {
                                aa.print(br + 'Error Removing Doc with Sequence # of ' + docArray[doc].getDocumentNo() + '. Attempting Remove 1 more time. ' + results.getErrorMessage() + br);

                                var results2 = aa.document.removeDocumentByPK(docArray[doc].getDocumentNo(), 'ADMIN', hexToStr(lookup('PERMISSION', 'ADMIN')), iCap.getServiceProviderCode());

                                if (results2.getSuccess()) {
                                    aa.document.updateDocument(docArray[doc]);
                                    aa.print('2nd Attempt - Removed Doc: ' + docArray[doc].getDocumentNo() + ' Successfully!' + br);
                                } else {
                                    aa.print(br + '2nd Attempt - Error Removing Doc with Sequence # of ' + docArray[doc].getDocumentNo() + '. ' + results2.getErrorMessage() + br);
                                }
                            }
                        }

                        if (flName == curName) {
                            docArray[doc].setRecStatus('A');
                            docArray[doc].setDocDescription(thisFileDescription + " " + sysDateMMDDYYYY);
                            aa.document.updateDocument(docArray[doc]);
                            aa.print('Found Current Document!  Renaming Doc Description to ' + thisFileDescription + br);
                            rtnDocs.push(docArray[doc]);
                        }
                    }
                } else {
                    aa.print('**Warning** -Report Failure- No File Generated: ' + arguments[rptCounter] + br);
                    return false;
                }
            } else {
                aa.print('**Warning** -Report Failure- No Report Result: ' + arguments[rptCounter] + br);
                return false;
            }
        } else {
            aa.print('**Warning** -Report Failure- Permission Not Granted for Report: ' + arguments[rptCounter] + br);
            return false;
        }

        rptCounter = parseInt(rptCounter) + 2;
        rptHashTableCounter = parseInt(rptHashTableCounter) + 2;
    }

    // email report files
    if (notificationTemplateName && emailHashTable) {
        if (contObj) {
            if (rptFiles.length) {
                //Build TO email Address
                var toAddress = getPubEmailByCapId(null, iCapId);

                if (toAddress == "") {
                    toAddress = "noreply@mt.gov"
                }

                if (!matches(toAddress, null, undefined, "")) {
                    //Send the report via email
                    var emailSent = sendNotification("", toAddress, ccEmail, notificationTemplateName, emailHashTable, rptFiles, iCapId);
                    if (emailSent) {
                        aa.print('-- END runReportsAttach4Email() --' + br);
                        return rtnDocs;
                    } else {
                        aa.print('**Warning** Email had problem sending' + br);
                        aa.print('-- END runReportsAttach4Email() --' + br);
                        return false;
                    }

                } else {
                    aa.print('**Warning** No Email Address for Contact' + br);
                    aa.print('-- END runReportsAttach4Email() --' + br);
                    return false;
                }
            } else {
                aa.print('**Warning** No files to attach to report' + br);
                aa.print('-- END runReportsAttach4Email() --' + br);
                return false;
            }
        } else {
            aa.print('**Warning** No primary contact on record' + br);
            aa.print('-- END runReportsAttach4Email() --' + br);
            return false;
        }
    } else {
        aa.print('No email sent.  runReportsAttach4Email()' + br);
        aa.print('-- END runReportsAttach4Email() --' + br);
        return rtnDocs;
    }
    aa.print('-- END runReportsAttach4Email() --' + br);
}
