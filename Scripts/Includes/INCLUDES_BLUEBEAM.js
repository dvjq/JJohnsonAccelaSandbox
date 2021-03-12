//@ts-check
/**
 * 
 * INCLUDES_BLUEBEAM for Bluebeam Integration Scripts
 * 
 */
var scriptName = "INT_BLUEBEAM: ";
aa.print(scriptName + "library loaded.");

function executeBluebeamIntegration(pCapIdObj, action) {

    var functTitle = "executeBluebeamIntegration(): ";
    var confScriptName = "CONF_BLUEBEAM_INTEGRATION";
    var logSeparator = "<br>--------------------------------";
    var result = "";
    var thisRecord;

    //get function library
    eval(getScriptText("INCLUDES_RECORD", null, true));

    // TO DO: create custom field subgroup for bluebeam and add to demo records
    if ((typeof pCapIdObj !== "undefined") && pCapIdObj != null && pCapIdObj != "") {
        thisRecord = new Record(pCapIdObj);
    } else {
        result = "**ERROR** input parameter pCapIdObj is undefined.";
        logDebug(functTitle + result);
        return result;
    }

    // authenticate and get token
    logDebug(logSeparator);
    logDebug(functTitle + "BEGIN AUTHENTICATE");
    var token = bluebeamAuthenticate();
    logDebug("typeof token: " + typeof token);
    if (token.substr(0, 7) == '**ERROR') {
        return token;
    }
    logDebug(functTitle + "FINISH AUTHENTICATE");

    //get rules
    var ruleset = getJSONRules(confScriptName);
    var recordTypeRules = getRulesForRecordType(ruleset, thisRecord);
    logDebug(logSeparator);

    // actions: init or complete session
    if (action == "initSession") {

        logDebug(functTitle + "BEGIN INIT SESSION");

        var sessionId = bluebeamInitSession(thisRecord, recordTypeRules, token);

        // get documents for bluebeam session using ruleset
        var docsForBluebeam = bluebeamGetDocuments(thisRecord, recordTypeRules);
        var resultArray = bluebeamUploadDocuments(sessionId, docsForBluebeam);
        /// TO DO: add check for errors in document upload


        /// TO DO: REFACTOR INVITE USERS LIKE GET/UPLOAD DOCUMENTS ABOVE
        // INVITE USERS
        var users = ["awilliams@accela.com", "tchansen@accela.com"];
        for (var u in users) {
            var userEmail = users[u];
            result = bluebeamAddUser(sessionId, userEmail);
        }

        logDebug("typeof token: " + typeof token);
        if (token.substr(0, 7) == '**ERROR') {
            return token;
        }
        logDebug(functTitle + "FINISH INIT SESSION");
    }

    // CLOSE SESSION
    if (action == "closeSession") {

        logDebug(functTitle + "BEGIN CLOSE SESSION");

        // get documents from session 
        var existingSession = thisRecord.getASI("BLUEBEAM", "Session URL");

        if (!existingSession || existingSession == "") {
            result = "**ERROR** No session URL to close.";
            logDebug(functTitle + result);
            return result;
        }

        result = bluebeamCompleteSession(thisRecord, recordTypeRules, token, existingSession);
        ///check for error in result
        logDebug(functTitle + "FINISH CLOSE SESSION");
    }

    logDebug(logSeparator);

    return result;
}

/**
 * bluebeamCreateSession()
 * - Create a session in bluebeam
 * - Select documents by type and category (add to configuration)
 * - Push documents to session
 * - Receive the session invitation URL
 * - Save the session URL in custom field
 * - Save the session URL in the condition on the record
 * - Use sendNotification() to distribute invitations to active workflow task assignments
 */
function bluebeamAuthenticate() {
    var result = "";
    var functionTitle = "bluebeamAuthenticate(): ";

    // TO DO: GET EVT RULES FROM STD CHOICE
    var confStdChoice = "EDMS_BLUEBEAM_INTEGRATION";
    logDebug(functionTitle + "Getting event parameters from standard choice: " + confStdChoice);
    var bluebeamAPIURL = lookup(confStdChoice, "bluebeamAPIURL");
    var token = lookup(confStdChoice, "token");
    var userName = lookup(confStdChoice, "userName");
    var userPassword = lookup(confStdChoice, "userPassword");

    if (!bluebeamAPIURL || !token || !userName || !userPassword) {

        result = "**ERROR: Configuration not valid. Check standard choice config: " + confStdChoice;
        logDebug(functionTitle + result);
        return result;

    }

    try {
        var bbToken = "XYZ";

        // TO DO: INVOKE BLUEBEAM API FOR AUTHENITCATE
        // THIS WILL FAIL UNTIL WORKING.
        // bbToken = external web call

        // TO DO: TEST THE TOKEN 
        if (bbToken != null && bbToken != "") {
            // TO DO: IF SUCCESSFUL, RETURN THE TOKEN FROM BLUEBEAM
            result = bbToken;
            logDebug(functionTitle + "Successfully authenticated. Token: " + result);
        } else {
            result = "**ERROR** Could not authenticate.";
            logDebug(functionTitle + result);
        }

    } catch (err) {

        result = "**ERROR: Error with transaction." + err.message;
        logDebug(functionTitle + result);
    }

    return result;
}

/**
 * bluebeamInitSession()
 * - Create a session in bluebeam
 */
function bluebeamInitSession(customId, sessionEndDate, token) {
    var functionTitle = "bluebeamInitSession(): ";
    var result = "";
    var sessionObj = {};

    var name = customId;

    var notification = false;
    var restricted = false;
    var permSaveCopy = "Allow";
    var permPrintCopy = "Allow";
    var permMarkup = "Allow";
    var permMarkupAlert = "Allow";
    var permAddDocuments = "Allow";

    var restBody = {
        "Name": name,
        "Notification": notification,
        "Restricted": restricted,
        "DefaultPermissions": [{
                "Type": "SaveCopy",
                "Allow": permSaveCopy
            },
            {
                "Type": "PrintCopy",
                "Allow": permPrintCopy
            },
            {
                "Type": "Markup",
                "Allow": permMarkup
            },
            {
                "Type": "MarkupAlert",
                "Allow": permMarkupAlert
            },
            {
                "Type": "AddDocuments",
                "Allow": permAddDocuments
            }
        ]
    };

    var restBodyString = JSON.stringify(restBody);

    // TO DO - VALIDATE PARAMS

    try {

        // TO DO - IMPLEMENT BLUEBEAM CREATE SESSION AND UPLOAD DOCUMENTS
        logDebug(functionTitle + "TO DO - IMPLEMENT CREATE SESSION WITH BLUEBEAM API");

        // TO DO - CREATE SESSION: https://developers.bluebeam.com/articles/sessions/
        /**
         * Endpoint (POST): https://studioapi.bluebeam.com/publicapi/v1/sessions
         * Params: 
         *  Notification - (boolean) false, current user will not be subscribed to email notifications
         *  Restricted - (boolean) true, restrict session to only email addresses that have been invited / added
         *  SessionEndDate - (UTC formatted date) once this date is reached, all participants except for the host will be removed from the session
         *  DefaultPermissions (Define types below)
         *      Types (Type of permission): SaveCopy, PrintCopy, Markup, AddDocuments, FullControl, MarkupAlert
         *      Allow (Permission State): Allow, Deny, Default
         */
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        };

        var responseObj = httpClient("https://studioapi.bluebeam.com/publicapi/v1/sessions", "POST", headers, restBodyString, "application/json", "utf-8");
        if (responseObj.getSuccess()) {
            sessionObj = responseObj.getOutput();
            exploreObject(sessionObj);
            if (sessionObj == "" || sessionObj == null) {
                result = "**ERROR** Session is not valid.";
                logDebug(functionTitle + result);
                return result;
            }
        } else {
            result = "**ERROR** Error in httpClient: " + responseObj.getErrorMessage();
            logDebug(functionTitle + result);
            return result;
        }

        result = JSON.parse(sessionObj.result).Id;
    } catch (err) {
        result = "**ERROR** msg: " + err.message;
        logDebug(functionTitle + result);
    }

    return result;
}

/**
 * bluebeamFinalizeSession()
 * Finalize a session in bluebeam
 */
function bluebeamFinalizeSession(notification, restricted, sessionEndDate, DefaultPermissions) {
    var functionTitle = "bluebeamFinalizeSession(): ";
    var result = "";

    // TO DO - VALIDATE PARAMS

    try {

        // TO DO - IMPLEMENT BLUEBEAM FINALIZE SESSION
        logDebug(functionTitle + "TO DO - IMPLEMENT FINALIZE SESSION WITH BLUEBEAM API");

        // TO DO - FINALIZE SESSION: https://developers.bluebeam.com/articles/sessions/


    } catch (err) {
        result = "**ERROR** msg: " + err.message;
        logDebug(functionTitle + result);
    }

    return result;
}


/** bluebeamAddUser() 
 * sessionId (string) - session ID
 * email - (string) email address to invite
 * 
 */
function bluebeamAddUser(sessionId, email, message) {

    var functionTitle = "bluebeamAddUser(): ";
    var result = "";

    if (sessionId == null || sessionId == "") {
        result = "**ERROR** sessionId parameter (sessionId) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    if (email == null || email == "") {
        result = "**ERROR** email parameter (email) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    // TO DO - ADD USER
    // https://developers.bluebeam.com/articles/sessions/
    /**
     * Endpoint (POST): https://studioapi.bluebeam.com/publicapi/v1/sessions/{sessionId}/invite
     * Params: 
     *  email - Email address to send invitation to
     *  message - Custom Message that will display in the email
     * 
     */

    result = "TO DO - IMPLEMENT ADD USER";
    logDebug(functionTitle + result);

    return result;

}

/** bluebeamAddFile() 
 * docName (string) - name of the document
 * docSourceURL (string) - the URL 
 */
function bluebeamAddFile(sessionId, docName, docSourceURL) {

    var functionTitle = "bluebeamAddFile(): ";
    var result = [];
    var msg;

    if (docName == null || docName == "") {
        msg = "**ERROR** document name parameter (docName) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    if (docSourceURL == null || docSourceURL == "") {
        msg = "**ERROR** document source url parameter (docSourceURL) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    if (sessionId == null || sessionId == "") {
        msg = "**ERROR** sessionId parameter (sessionId) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    // TO DO - CREATE A METADATA BLOCK 
    // https://developers.bluebeam.com/articles/sessions/
    /**
     * Endpoint (POST): https://studioapi.bluebeam.com/publicapi/v1/sessions/{sessionId}/files
     * Params: 
     *  Name - (string ending in pdf) Name of file
     *  Source - (string) source, use this for legacy reference (record id + document id?)
     *  Size - (integer) Fize size; leave null for server to calculate
     *  CRC - (string) Leave null for server to calculate
     */

    msg = "TO DO - IMPLEMENT CREATE A METADATA BLOCK";
    logDebug(functionTitle + msg);


    // TO DO - UPLOAD THE FILE TO AWS 
    /**
     * Once you have a metadata block placeholder for your file, make a PUT request to the returned UploadURL from the previous POST request. 
     * In your PUT request, be sure to include the following in the header:
        "x-amz-server-side-encryption" with value "AES256"
        "Content-Type" with value "application/pdf"
     */
    msg = "TO DO - IMPLEMENT UPLOAD THE FILE TO AWS";
    logDebug(functionTitle + msg);


    // TO DO - CONFIRM UPLOAD
    /**
     * 
     * Endpoint: https://studioapi.bluebeam.com/publicapi/v1/sessions/{sessionId}/files/{id}/confirm-upload
     * cURL example:
        [code language="bash" style="padding: 10px !important; border-radius: 2em !important"]
        cURL https://studioapi.bluebeam.com/publicapi/v1/sessions/123-456-789/files/1234567/confirm-upload \
        -H "Authorization: Bearer {valid access_token}" \
        -X POST
        [/code]
     * 
     */
    msg = "TO DO - IMPLEMENT CONFIRM UPLOAD";
    logDebug(functionTitle + msg);


    return result;
}

/**
 * bluebeamCompleteSession()
 * - Get session from custom field
 * - Get latest version of document from session
 * - Upload document to record
 * - Close the session
 */
function bluebeamCompleteSession(recordObj, rule, token, sessionId) {
    var functionTitle = "bluebeamCompleteSession(): ";
    var result = "";

    if (recordObj == null || recordObj == "") {
        result = "**ERROR** record object parameter (recordObj) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    if (rule == null || rule == "") {
        result = "**ERROR** ruleset parameter (rule) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    if (token == null || token == "") {
        result = "**ERROR** authentication token parameter (token) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    if (sessionId == null || sessionId == "") {
        result = "**ERROR** session parameter (sessionId) can't be null or empty.";
        logDebug(functionTitle + result);
        return result;
    }

    /// validate/verify input 

    logDebug(functionTitle + "TO DO - IMPLEMENT CLOSE SESSION WITH BLUEBEAM API");

    try {
        result = "**ERROR** NOT IMPLEMENTED YET.";
        /// function code goes here
    } catch (err) {
        result = "**ERROR** msg: " + err.message;
        logDebug(functionTitle + result);
    }

    return result;
}

/** 
 * bluebeamGetDocuments(recordObj, rule)
 * - get documents
 */
function bluebeamGetDocuments(recordObj, rule) {
    var functionTitle = "bluebeamGetDocuments(): ";
    var result = [];
    var msg;
    var docObj = {
        docURL: "",
        docName: ""
    };

    if (recordObj == null || recordObj == "") {
        msg = "**ERROR** record object parameter (recordObj) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    if (rule == null || rule == "") {
        msg = "**ERROR** ruleset parameter (rule) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    try {

        var sdssKeyObj = sdssGetKeys();
        var newDocList = [];
        var docList = recordObj.getDocumentList();
        logDebug(functionTitle + "Document count: " + docList.length);

        for (var d in docList) {
            var thisDocument = docList[d];
            var docGroup = thisDocument.getDocGroup();
            var docCategory = thisDocument.getDocCategory();
            var docStatus = thisDocument.getDocStatus();
            var docName = thisDocument.getDocName();
            var docId = thisDocument.getDocumentNo();
            // loop through ruleset
            for (var r in rule) {
                var ruleDesc = rule[r].metadata.description;
                var ruleDocTypes = rule[r].documentTypes;
                for (var dt in ruleDocTypes) {
                    var dtRule = ruleDocTypes[dt];
                    var rDocType = dtRule.accelaCategory;
                    var rDocStatus = dtRule.accelaStatus;
                    logDebug(functionTitle + "------------Comparing doc types-------------");
                    logDebug(functionTitle + "Rule: " + rDocType + " | " + rDocStatus);
                    logDebug(functionTitle + "Accela Document: " + docCategory + " | " + docStatus);

                    if (docCategory == rDocType && docStatus == rDocStatus) {

                        // get document URL
                        var docURL = sdssGetDocURL(sdssKeyObj, docId);

                        // add document to return list
                        var thisDocObj = Object.create(docObj);
                        thisDocObj.docName = docCategory + " - " + docName;
                        thisDocObj.docURL = docURL;
                        newDocList.push(thisDocObj);
                        logDebug(functionTitle + "Added document to list for Bluebeam: " + docCategory + " - " + docName);
                    }
                }
            }
        }
        if (newDocList.length < 1) {
            msg = "**ERROR** No documents found. Check the document type config in CONF_BLUEBEAM_INTEGRATION.";
            logDebug(functionTitle + msg);
        } else {
            result = newDocList;
        }

    } catch (err) {
        msg = "**ERROR** msg: " + err.message;
        logDebug(functionTitle + msg);
    }

    return result;
}

/**
 * Takes the SDSS APIKey object and a document Id and returns the URL to directly access the document.
 *
 * @param {*} sdssKeyObj
 * @param {*} docId
 * @returns string (URL)
 */
function sdssGetDocURL(sdssKeyObj, docId) {
    var functionTitle = "sdssGetDocURL(): ";
    //make sure that passed in variables are present
    if (!docId || docId == "") {
        logDebug(functionTitle + "**ERROR** document id value is missing or empty.");
    }

    //check that we have needed data from sdssKeyObj
    if (typeof sdssKeyObj.SDSS_URL == "undefined" || sdssKeyObj.SDSS_URL == "") {
        logDebug(functionTitle + "**ERROR** SDSS URL is missing from standard choice object.");
    }

    if (typeof sdssKeyObj.constructApiCode == "undefined" || sdssKeyObj.constructApiCode == "") {
        logDebug(functionTitle + "**ERROR** Construct API code is missing from standard choice object.");
    }

    if (typeof sdssKeyObj.constructApiEnv == "undefined" || sdssKeyObj.constructApiEnv == "") {
        logDebug(functionTitle + "**ERROR** Construct API environment is missing from standard choice object.");
    }

    if (typeof sdssKeyObj.keyValue == "undefined" || sdssKeyObj.keyValue == "") {
        logDebug(functionTitle + "**ERROR** The keyValue is missing from standard choice object.");
    }

    //build URL 
    var thisDocURL = sdssKeyObj.SDSS_URL +
        "constructApiCode=" + sdssKeyObj.constructApiCode + "&" +
        "environment=" + sdssKeyObj.constructApiEnv + "&" +
        "apiKey=" + sdssKeyObj.keyValue + "&" +
        "documentId=" + docId;

    return thisDocURL;
}

/**
 * Returns the values for the APIKey standard choice. These values are used to connect to the Delivery Toolkit.
 *
 * @returns {object} APIKey object containing SDSS_URL, baseUrl, ConstructApiCode, ConstructApiEnv, and keyValue for connecting to Delivery Toolkit
 */
function sdssGetKeys() {
    var functionTitle = "sdssGetKeys(): ";
    var stdChoice = "APIKey";

    var sdssKeys = {
        baseUrl: lookup(stdChoice, "baseUrl") || "",
        constructApiCode: lookup(stdChoice, "constructApiCode"),
        constructApiEnv: lookup(stdChoice, "constructApiEnv"),
        keyValue: lookup(stdChoice, "keyValue"),
        SDSS_URL: lookup(stdChoice, "SDSS_URL")
    };

    if (typeof sdssKeys === "undefined") {
        logDebug(functionTitle + "Standard Choice " + stdChoice + " is missing.");
    } else {
        var props = Object.getOwnPropertyNames(sdssKeys);

        for (var i = 0; i < props.length; i++) {
            var propName = props[i];
            if (typeof sdssKeys[propName] == "undefined" || sdssKeys[propName] == "") {
                logDebug(functionTitle + propName + " is missing. Check standard choice " + stdChoice + " for value.");
            }
        }
    }

    return sdssKeys;
}

/**
 * Upload documents to bluebeam AWS
 *
 * @param {*} sessionId
 * @param {*} documents
 * @returns array of document upload results and messages
 */
function bluebeamUploadDocuments(sessionId, documents) {
    var functionTitle = "bluebeamUploadDocuments(): ";
    var result = [];
    var msg;

    if (sessionId == null || sessionId == "") {
        msg = "**ERROR** sessionId object parameter (sessionId) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    if (!documents && documents == null) {
        msg = "**ERROR** record object parameter (recordObj) can't be null or empty.";
        logDebug(functionTitle + msg);
        return result;
    }

    // LOOP THROUGH DOCS AND ADD TO BLUEBEAM
    for (var d in documents) {
        var doc = documents[d];
        var docName = doc.docName;
        var docURL = doc.docURL;
        logDebug(functionTitle + "Uploading document: " + docName + ". (" + docURL + ")");
        result = bluebeamAddFile(sessionId, docName, docURL);
    }

    return result;

}
/**
 * Takes a configuration script name and returns the JSON rules from that script.
 *
 * @param {*} pConfScriptName
 * @returns {object} JSON object with the JSON rules
 */
function getJSONRules(pConfScriptName) {
    var functTitle = "getJSONRules(): ";
    var cfgJsonObj = "";
    var msg = "";
    var result = {};

    // get the JSON config
    var cfgJsonStr = getScriptText(pConfScriptName);
    if (cfgJsonStr == null || cfgJsonStr == "") {
        return result;
    }
    try {
        result = JSON.parse(cfgJsonStr);
    } catch (err) {
        msg = "**ERROR** unable to parse retrieved rule set.<br />Message: " + err.message;
        logDebug(functTitle + msg);
        return result;
    }
    return result;
}
/**
 * Takes a configuration ruleset and finds the rule set matching the record object parameter.
 *
 * @param {*} ruleset JSON ruleset from configuration script
 * @param {*} recordObj Record object from INCLUDES_RECORD
 * @returns {object} JSON rule set matching the passed in record object.
 */
function getRulesForRecordType(ruleset, recordObj) {

    var functTitle = "getJSONRulesForRecordType(): ";
    var msg = '';
    var recordTypeRules = {};

    if (ruleset == null || ruleset == "") {
        msg = "**ERROR** ruleset can't be null or empty.";
        logDebug(functTitle + msg);
        return recordTypeRules;
    }

    var capIdObj = aa.cap.getCapID(recordObj.altId).getOutput();

    // prepare record type for rule search
    var itemCap, itemAppTypeResult, itemAppTypeString, itemAppTypeArray, module;
    if (capIdObj != null) {
        itemCap = aa.cap.getCap(capIdObj).getOutput();
        itemAppTypeResult = itemCap.getCapType();
        itemAppTypeString = itemAppTypeResult.toString();
        itemAppTypeArray = itemAppTypeString.split('/');
        module = itemAppTypeArray[0].toUpperCase();
    } else {
        msg = "**ERROR** capIdObj is null. Cannot retrieve rules";
        logDebug(functTitle + msg);
        return recordTypeRules;
    }

    // create array with wild card lookups
    var wildCardProbabiltyArr = [
        itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/" + itemAppTypeArray[2] + "/" + itemAppTypeArray[3],
        itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/" + itemAppTypeArray[2] + "/*",
        itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/*/*",
        itemAppTypeArray[0] + "/*/*/*",
        itemAppTypeArray[0] + "/*/" + itemAppTypeArray[2] + "/*",
        itemAppTypeArray[0] + "/*/" + itemAppTypeArray[2] + "/" + itemAppTypeArray[3],
        itemAppTypeArray[0] + "/*/*/" + itemAppTypeArray[3],
        itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/*/" + itemAppTypeArray[3]
    ];

    // loop through array of wild card lookups to identify JSON rules
    logDebug(functTitle + "Searching for JSON Rules ...");
    for (var w in wildCardProbabiltyArr) {
        recordTypeRules = ruleset[wildCardProbabiltyArr[w]];
        logDebug("... " + wildCardProbabiltyArr[w]);
        // if a rule does not exist, continue to next until we find a match
        if (recordTypeRules === undefined) {
            continue;
        }

        logDebug(functTitle + "Rules found for record type " + wildCardProbabiltyArr[w]);
        return recordTypeRules;
    }

    return recordTypeRules;
}

//@ts-check
/*===========================================

Title : httpClient

Purpose : Replacement for the aa.util.httpPost

Author : Chris Hansen

Functional Area : Utilities

Description : Performs GET, POST, PUT transactions with custom headers, content, content type and encoding. Also includes a function for creating the content for a SOAP transaction and a function for interpreting HTTP Response codes.

Reviewed By : 

Script Type : (EMSE, EB, Pageflow, Batch) : EMSE

General Purpose/Client Specific : General Purpose

Client developed for : 

Parameters : See each function below.

=========================================== */

//FUNCTIONS//

/**
 * Builds a SOAP XML string
 *
 * @param {any} method - The SOAP method
 * @param {any} namespace - The SOAP namespace
 * @param {any} params - Key/value pair object containing the values to include in the method 
 * @param {any} username - Optional. If included, will set the username and password in the security header
 * @param {any} password - Optional. If username is included, will be set in the security header
 * @returns SOAP XML string
 */
function buildSoapXml(method, namespace, params, username, password) {
    var xmlRequest = "";
    var paramsStr = "";
    var useSecurity = false;

    //if username or password is undefined then set to empty value
    username = (typeof username != 'undefined') ? username : "";
    password = (typeof password != 'undefined') ? password : "";

    if (username != '') {
        useSecurity = true;
    }

    for (var key in params) {
        paramsStr = paramsStr + "<" + key + ">" + params[key] + "</" + key + ">";
    }

    xmlRequest = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
    xmlRequest += '<soap:Header>';
    if (useSecurity) {
        xmlRequest += '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">';
        xmlRequest += '<wsse:UsernameToken>';
        xmlRequest += '<wsse:Username>' + username + '</wsse:Username>';
        xmlRequest += '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + password + '</wsse:Password>';
        xmlRequest += '</wsse:UsernameToken>';
        xmlRequest += '</wsse:Security>';
    }
    xmlRequest += '</soap:Header>';
    xmlRequest += '<soap:Body>';
    xmlRequest += '<' + method + ' xmlns="' + namespace + '">\ ' + paramsStr + '</' + method + '>';
    xmlRequest += '</soap:Body>';
    xmlRequest += '</soap:Envelope>';

    return xmlRequest;
}

/**
 * httpClient builds an Apache commons 3.1 httpclient for
 * the specified method and submits the request. It then 
 * takes the response and formats it into an AA Script Result
 * and returns.
 * 
 * @param {any} url - The endpoint URL
 * @param {any} method - HTTP method (POST, GET, PUT)
 * @param {any} headers - Array of header key value pairs. Key is header name, value is header value
 * @param {any} content - Needed for POST and sometimes PUT. String content of package
 * @param {any} contentType - Optional. if content type is omitted, value is set to text/xml
 * @param {any} encoding - Optional. If encoding is omitted, value is set to utf-8
 * @returns AA Script Result Object
 */
function httpClient(url, method, headers, content, contentType, encoding) {
    //content type and encoding are optional; if not sent use default values
    contentType = (typeof contentType != 'undefined') ? contentType : 'text/xml';
    encoding = (typeof encoding != 'undefined') ? encoding : 'utf-8';

    //build the http client, request content, and post method from the apache classes
    //@ts-ignore
    var httpClientClass = org.apache.commons.httpclient;
    var httpClient = new httpClientClass.HttpClient();

    switch (method.toUpperCase()) {
        case "POST":
            method = new httpClientClass.methods.PostMethod(url);
            break;
        case "GET":
            method = new httpClientClass.methods.GetMethod(url);
            content = "";
            break;
        case "PUT":
            method = new httpClientClass.methods.PutMethod(url);
            break;
        default:
            method = '';
    }

    if (typeof headers != 'undefined') {
        for (var key in headers) {
            method.setRequestHeader(key, headers[key]);
        }
    }

    if (typeof content != 'undefined' && content != '') {
        var requestEntity = new httpClientClass.methods.StringRequestEntity(content, contentType, encoding);
        method.setRequestEntity(requestEntity);
    }

    //set variables to catch and logic on response success and error type. build a result object for the data returned
    var resp_success = true;
    var resp_errorType = null;

    var resultObj = {
        resultCode: 999,
        result: null
    };

    //execute the http client call in a try block and once complete, release the connection
    try {
        resultObj.resultCode = httpClient.executeMethod(method);
        resultObj.result = method.getResponseBodyAsString();

    } finally {
        method.releaseConnection();
    }

    //if any response other than transaction success, set success to false and catch the error type string
    if (resultObj.resultCode) {
        if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
            resp_success = false;
            resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
        }
    }

    //create script result object with status flag, error type, error message, and output and return
    //@ts-ignore
    var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

    return scriptResult;
}

/**
 * Takes a status code and returns the standard HTTP status code string
 *
 * @param {any} statusCode - Integer of the status code returned from an HTTP request.
 * @returns string description of HTTP status code
 */
function httpStatusCodeMessage(statusCode) {
    switch (statusCode) {
        case 100:
            return "100 - Continue";
        case 101:
            return "101 - Switching Protocols";
        case 200:
            return "200 - OK";
        case 201:
            return "201 - Created";
        case 202:
            return "202 - Accepted";
        case 203:
            return "203 - Non-Authoritative Information";
        case 204:
            return "204 - No Content";
        case 205:
            return "205 - Reset Content";
        case 206:
            return "206 - Partial Content";
        case 300:
            return "300 - Multiple Choices";
        case 301:
            return "301 - Moved Permanently";
        case 302:
            return "302 - Found";
        case 303:
            return "303 - See Other";
        case 304:
            return "304 - Not Modified";
        case 305:
            return "305 - Use Proxy";
        case 306:
            return "306 - (Unused)";
        case 307:
            return "307 - Temporary Redirect";
        case 400:
            return "400 - Bad Request";
        case 401:
            return "401 - Unauthorized";
        case 402:
            return "402 - Payment Required";
        case 403:
            return "403 - Forbidden";
        case 404:
            return "404 - Not Found";
        case 405:
            return "405 - Method Not Allowed";
        case 406:
            return "406 - Not Acceptable";
        case 407:
            return "407 - Proxy Authentication Required";
        case 408:
            return "408 - Request Timeout";
        case 409:
            return "409 - Conflict";
        case 410:
            return "410 - Gone";
        case 411:
            return "411 - Length Required";
        case 412:
            return "412 - Precondition Failed";
        case 413:
            return "413 - Request Entity Too Large";
        case 414:
            return "414 - Request-URI Too Long";
        case 415:
            return "415 - Unsupported Media Type";
        case 416:
            return "416 - Requested Range Not Satisfiable";
        case 417:
            return "417 - Expectation Failed";
        case 500:
            return "500 - Internal Server Error";
        case 501:
            return "501 - Not Implemented";
        case 502:
            return "502 - Bad Gateway";
        case 503:
            return "503 - Service Unavailable";
        case 504:
            return "504 - Gateway Timeout";
        case 505:
            return "505 - HTTP Version Not Supported";
    }
    return statusCode + " - Unknown Status Code";
}