/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_DPR_LIBRARY.js
| Event   : N/A
|
| Usage   : Library Functions and Globals for Digital Plan Room. This file should not be modified.  
|           For custom includes make additions and overrides directly on the corresponding events.
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/

var Dpr = {};
Dpr.define = function () {

    var endpoint;
	var apiKey;

	var firstName;
	var lastName;

    init();
   
    function init() {
       endpoint = getReviewsEndpoint();
	   apiKey = getApiKey();
    }

    function trySetFullName(userName) {

		if (userName.indexOf("PUBLICUSER") == 0) {
			var userSequenceNBR = new java.lang.Long(userName.substring(10));
			var contractorBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
			var userIds = new java.util.ArrayList();
			userIds.add(userSequenceNBR);
			
			var contractorPeopleModelList = contractorBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), userIds);
			if(contractorPeopleModelList != null && contractorPeopleModelList.size() > 0) {
				var peopleModel = contractorPeopleModelList.get(0);
				var contactRefNumber = peopleModel.getContactSeqNumber();
				var refPeopleModel = aa.people.getPeople(contactRefNumber).getOutput();
				firstName = refPeopleModel.getFirstName();
				lastName = refPeopleModel.getLastName();         
			}
			else {
				//unable to return the first and last name
			}
		} else {
			var systemUserObjResult = aa.person.getUser(userName.toUpperCase());

		    if (systemUserObjResult.getSuccess()) {
		        var systemUserObj = systemUserObjResult.getOutput();
		        if (systemUserObj.getFirstName()) firstName = systemUserObj.getFirstName();
		        if (systemUserObj.getLastName()) lastName = systemUserObj.getLastName();
		    } 
		}
    }
	
	function base64Decode(text) {
		return javax.xml.bind.DatatypeConverter.parseBase64Binary(text);
	}
	
	function base64Encode(bytes) {
		return javax.xml.bind.DatatypeConverter.printBase64Binary(bytes);
	}
	
	function base64UrlEncode(bytes) {
		var output = base64Encode(bytes);
		
		var padding = output.indexOf('=');
		if (padding > -1) {
			output = output.substring(0, padding); // Remove any trailing '='s
		}

        output = output.replace('+', '-'); // 62nd char of encoding
        output = output.replace('/', '_'); // 63rd char of encoding
        return output;
	}

	function signData(key, data) {
		var mac = javax.crypto.Mac.getInstance("HmacSHA256");
		var sKey = new javax.crypto.spec.SecretKeySpec(key, "HmacSHA256")
        mac.init(sKey);
        return mac.doFinal(data);
	}
	
	// Generates RFC7519 (https://tools.ietf.org/html/rfc7519) token using HS256 algorithm.
	function createJwt(key, claims, expiryMinutes) {
	   	   
	   var headerString = new java.lang.String('{"typ":"JWT", "alg":"HS256"}');
	   var headerBytes = headerString.getBytes("UTF-8");

	   var payload = claims;
	   
	   var nowMillis = java.lang.System.currentTimeMillis();
	   var now = new java.util.Date(nowMillis);
	   var ttlMillis = expiryMinutes * 60 * 1000;
	   var expMillis = nowMillis + ttlMillis;
	   var exp = new java.util.Date(expMillis);
	   var seconds = exp.getTime() / 1000;
	   payload.exp = seconds + "";

	   var payloadString = new java.lang.String(JSON.stringify(payload));
	   var payloadBytes = payloadString.getBytes("UTF-8");
	 
	   var base64Header = base64UrlEncode(headerBytes);
	   var base64Body = base64UrlEncode(payloadBytes);
	   
	   var stringBuffer = new java.lang.StringBuffer();
	   stringBuffer.append(base64Header);
	   stringBuffer.append('.');
	   stringBuffer.append(base64Body);
	   var stringToSign = stringBuffer.toString();
	   var bytesToSign = stringToSign.getBytes("UTF-8");
		
	   var signature = signData(key, bytesToSign);
	   var base64Signature = base64UrlEncode(signature);
	   return stringToSign + "." + base64Signature;
	}

    function sendGet(url, user) {

		var http = org.apache.commons.httpclient.HttpClient();
		var getMethod = org.apache.commons.httpclient.methods.GetMethod(url);

		if (user) {
			var claims = { iss: "accela", sub: user + ""};
			var token = createJwt(apiKey, claims, 20);
            getMethod.setRequestHeader("Authorization", "Bearer " + token);
        }
		
		try
		{
			var statusCode = http.executeMethod(getMethod);
			
			aa.debug("DPR","GET " + url + ": Status code = " + statusCode);
			var response = { code: statusCode };
			if (statusCode >= 200 && statusCode < 299) {
				var responseString = getMethod.getResponseBodyAsString();
				var responseBody = (responseString != null && responseString.length() > 0) ? JSON.parse(responseString) : null;
				response.body = responseBody;
			}
			
			return response;
		}
		finally
		{
			getMethod.releaseConnection();
		}
    }

    function sendPost(url, user, obj) {

		var request = JSON.stringify(obj);
		var http = org.apache.commons.httpclient.HttpClient();
		var postMethod = org.apache.commons.httpclient.methods.PostMethod(url);
		
		if (user) {
			trySetFullName(user);
			var claims = { iss: 'accela', sub: user + "", fn: firstName + "", ln: lastName + ""};
			var token = createJwt(apiKey, claims, 20);
            postMethod.setRequestHeader("Authorization", "Bearer " + token);
        }
		
		var requestEntity = new org.apache.commons.httpclient.methods.StringRequestEntity(request, "application/json", "UTF-8");
		postMethod.setRequestEntity(requestEntity);
		
		try
		{
			var statusCode = http.executeMethod(postMethod);
			
			aa.debug("DPR","POST " + url + ": Status code = " + statusCode);
			var response = { code: statusCode };
			if (statusCode >= 200 && statusCode < 299) {
				var responseString = postMethod.getResponseBodyAsString();
				var responseBody = (responseString != null && responseString.length() > 0) ? JSON.parse(responseString) : null;
				response.body = responseBody;
			}
			
			return response;
		}
		finally
		{
			postMethod.releaseConnection();
		}
    }
	
	function sendPut(url, user, obj) {

		var request = JSON.stringify(obj);
		var http = org.apache.commons.httpclient.HttpClient();
		var postMethod = org.apache.commons.httpclient.methods.PutMethod(url);
		
		if (user) {

			trySetFullName(user);
			var claims = { iss: 'accela', sub: user + "", fn: firstName + "", ln: lastName+ ""};
			var token = createJwt(apiKey, claims, 20);
            postMethod.setRequestHeader("Authorization", "Bearer " + token);
        }
		
		var requestEntity = new org.apache.commons.httpclient.methods.StringRequestEntity(request, "application/json", "UTF-8");
		postMethod.setRequestEntity(requestEntity);
		
		try
		{
			var statusCode = http.executeMethod(postMethod);
			
			aa.debug("DPR","PUT " + url + ": Status code = " + statusCode);
			var response = { code: statusCode };
			if (statusCode >= 200 && statusCode < 299) {
				var responseString = postMethod.getResponseBodyAsString();
				var responseBody = (responseString != null && responseString.length() > 0) ? JSON.parse(responseString) : null;
				response.body = responseBody;
			}
			
			return response;
		}
		finally
		{
			postMethod.releaseConnection();
		}
    }

    function sendDelete(url, user) {

		var http = org.apache.commons.httpclient.HttpClient();
		var deleteMethod = org.apache.commons.httpclient.methods.DeleteMethod(url);

		if (user) {
			var claims = { iss: "accela", sub: user + ""};
			var token = createJwt(apiKey, claims, 20);
            deleteMethod.setRequestHeader("Authorization", "Bearer " + token);
        }
		
		try
		{
			var statusCode = http.executeMethod(deleteMethod);
			
			aa.debug("DPR","DELETE " + url + ": Status code = " + statusCode);
			var response = { code: statusCode };
			if (statusCode >= 200 && statusCode < 299) {
				var responseString = deleteMethod.getResponseBodyAsString();
				var responseBody = (responseString != null && responseString.length() > 0) ? JSON.parse(responseString) : null;
				response.body = responseBody;
			}
			
			return response;
		}
		finally
		{
			deleteMethod.releaseConnection();
		}
    }

// TODO change that old HttpClient code to URLConnection that way there is no risk of Accela upgrading
// that package and breaking us
//post("http://localhost:8888/_ah/api/langapi/v1/createLanguage",
//                   "{\"language\":\"russian\", \"description\":\"dsfsdfsdfsdfsd\"}");



//public static void post(String url, String param ) throws Exception{
//  String charset = "UTF-8"; 
//  URLConnection connection = new URL(url).openConnection();
//  connection.setDoOutput(true); // Triggers POST.
//  connection.setRequestProperty("Accept-Charset", charset);
//  connection.setRequestProperty("Content-Type", "application/json;charset=" + charset);

//  try (OutputStream output = connection.getOutputStream()) {
//    output.write(param.getBytes(charset));
//  }

//  InputStream response = connection.getInputStream();
//}

    function getReviewsEndpoint() {
		
		var domain = aa.bizDomain.getBizDomainByValue("DPR_CONFIGS", "ENDPOINT");
		if (domain.getSuccess()) {
			var endpointUrl = domain.getOutput().getDescription();
			aa.debug("DPR","Digital Plan Room ENDPOINT retrieved: " + endpointUrl);
			return endpointUrl;
		}
		else {
			logDebug("**ERROR: Digital Plan Room ENDPOINT needs to be configured.");
			return null;
		}
    }
	
	function getApiKey() {
		
		var domain = aa.bizDomain.getBizDomainByValue("DPR_CONFIGS", "APIKEY");
		if (domain.getSuccess()) {
			var secret = domain.getOutput().getDescription();
			return base64Decode(secret);
		}
		else {
			logDebug("**ERROR: Digital Plan Room APIKEY needs to be configured.");
			return null;
		}
    }

    function getDPRVersion() {
		var response = sendGet(endpoint + "/version", currentUserID);
		if (response.code != 200) {
		   logDebug("ERROR: Failed to get DPR version. Response code: " + response.code);
		} else {
		    return response.body;
		}    	
    }

    function getProjects(){ // optional statuses array
    	var projectsFilter = "";
    	var statuses = new Array();
        if (arguments.length > 0) {

            //optional statuses array
            if (arguments.length == 1) {
            	statuses = arguments[0];
            }
        }

		if (statuses.length > 0) {
			var statusesList = "";
			statusesList = statuses.join(",");
			projectsFilter += "statuses:" + statusesList + ";";
		}

        if (projectsFilter.length > 0) {
        	projectsFilter = "filter=" + projectsFilter.substring(0, projectsFilter.length - 1);
        }

		logDebug("DPR: Get projects sent");	

		var response = sendGet(endpoint + "/projects?" + projectsFilter, currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get projects. Response code: " + response.code;
		} else {
		    return response.body;
		}

		return [];
    }

	function getDPRStandardChoiceConfigurationValueObj(standardChoiceName, standardChoiceValue) {
		// assume configuration values are semi-colon separated

		var dprStandardChoiceConfiguration = lookup(standardChoiceName,standardChoiceValue);
		var dprStandardChoiceConfigurationArray = new Array();
		var dprStandardChoiceObj = {};

		if (dprStandardChoiceConfiguration != undefined) {
			dprStandardChoiceConfigurationArray = dprStandardChoiceConfiguration.split(";");
			for (var i in dprStandardChoiceConfigurationArray) {
				var dprStandardChoiceConfigurationValueArray = dprStandardChoiceConfigurationArray[i].split("=");
				dprStandardChoiceObj[dprStandardChoiceConfigurationValueArray[0]] = dprStandardChoiceConfigurationValueArray[1];
			}
		} else {
			logDebug("DPR: No DPR standard choice configuration found for standard choice " + standardChoiceName + " and value " + standardChoiceValue);
			return false;
		}

		return dprStandardChoiceObj;
	}

	function createProject() { // optional capId, optional currentUserID

		//optional capId
		var itemCap = capId;
		var currentUser = currentUserID;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		if (arguments.length == 2) {
			currentUser = arguments[1];
		}

		var iCap = aa.cap.getCap(itemCap).getOutput();
		var projectName = iCap.getSpecialText();
		var projectNumber = itemCap.getCustomID();
		var projectType;
		var projectTypeSetting = getDPRStandardChoiceConfigurationValueObj("DPR_RECORD_TYPES_ENABLED",appTypeString);
		if (projectTypeSetting) {
			projectType = projectTypeSetting.name;
		} 

		if (projectType == undefined) {
		   var errorMessage = "ERROR: Failed to create  project: " + project.id + ". Invalid configuration DPR_RECORD_TYPES_ENABLED";
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;	
		}
		
		var project = {};
		project.id = itemCap.getId() + "";
		project.number = new String(projectNumber);
		if (projectName) {
			project.name = new String(projectName);
		}
		project.type = new String(projectType);

		logDebug("DPR: Create project sent for record: " + projectNumber);	

		var response = sendPost(endpoint + "/projects", currentUser, project);
		if (response.code != 201) {
		   var errorMessage = "ERROR: Failed to create  project: " + project.id + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}
		return true;
    }
	
	function updateProject(projObj) { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}
		
		if (projObj) {
			logDebug("DPR: Update project sent for record: " + itemCap.getCustomID());	
			var response = sendPut(endpoint + "/projects/" + itemCap.getId(), currentUserID, projObj);
			if (response.code != 200) {
			   var errorMessage = "ERROR: Failed to update  project: " + itemCap.getId() + ". Response code: " + response.code;
			   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
			   return false;
			}
			return true;
		}
		return false;
    }

	function updateProjectStatus(newStatus) { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}
		
		var project = {};

		if (newStatus) {
		   project.status = newStatus;

			logDebug("DPR: Update project sent for record: " + itemCap.getCustomID());	

			var response = sendPut(endpoint + "/projects/" + itemCap.getId(), currentUserID, project);
			if (response.code != 200) {
			   var errorMessage = "ERROR: Failed to update  project: " + itemCap.getId() + ". Response code: " + response.code;
			   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
			   return false;
			}
			return true;
		}
		return false;
    }

	function updateProjectName(newProjectName) { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}
		
		var project = {};

		if (newProjectName) {
		   project.name = new String(newProjectName);
			logDebug("DPR: Update project sent for record: " + itemCap.getCustomID());	

			var response = sendPut(endpoint + "/projects/" + itemCap.getId(), currentUserID, project);
			if (response.code != 200) {
			   var errorMessage = "ERROR: Failed to update  project: " + itemCap.getId() + ". Response code: " + response.code;
			   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
			   return false;
			}
			return true;
		}
		return false;
    }
	
	function approveProject() { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var project = { status: "Approved" };
			   
		logDebug("DPR: Approve project sent for record: " + itemCap.getCustomID());	

		var response = sendPut(endpoint + "/projects/" + itemCap.getId(), currentUserID, project);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to approve project: " + itemCap.getId() + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}
		return true;
    }

	/*------------------------------------------------------------------------------------------------------/
	| Project Groups (start)
	/------------------------------------------------------------------------------------------------------*/

	function getProjectGroupTypeConfig(groupType) {
		var projectGroupTypeConfiguration = getDPRStandardChoiceConfigurationValueObj("DPR_PROJECT_GROUP_TYPES",groupType);

		if (!projectGroupTypeConfiguration) {
			logDebug("DPR: No group type found for " + groupType);
			return false;
		}

		return projectGroupTypeConfiguration;
	}

	function getProjectGroups() { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get project groups sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/groups", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get project groups for project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    return response.body;
		}

		return [];		
	}

	function getProjectGroup(groupId) { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get project group sent for project: " + itemCap.getCustomID() + " and group: " + groupId);	

		var response = sendGet(endpoint + "/projects/" + projectId + "/groups/" + groupId, currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get project group for project: " + projectId + " and group: " + groupId+ ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    return response.body;
		}

		return false;		
	}

	function getProjectGroupItems(groupId) { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get project group items sent for project: " + itemCap.getCustomID() + " and group: " + groupId);	

		var response = sendGet(endpoint + "/projects/" + projectId + "/groups/" + groupId + "/items", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get project group items for project: " + projectId + " and group: " + groupId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    return response.body;
		}

		return [];		
	}

	function createProjectGroup(projObj) { // optional capId
		// projObj properties:
		// name: (required) - name of the group
		// projects: (optional) - array of project ids

		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}
		
		var projectId = itemCap.getId() + "";

		logDebug("DPR: Create project group sent for record: " + projectId);	

		var response = sendPost(endpoint + "/projects/" + projectId + "/groups", currentUserID, projObj);
		if (response.code != 201) {
		   var errorMessage = "ERROR: Failed to create  project group: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}

		// return the group id
		return true;
    }

	function createProjectGroupItems(groupId,projGroupItems) { // optional capId
		// projGroupItems (required): array of project ids

		//optional capId
		var itemCap = capId;
		if (arguments.length > 2) {
			itemCap = arguments[2];
		}
		
		var projectId = itemCap.getId() + "";

		logDebug("DPR: Create project group items sent for record: " + projectId);	

		var response = sendPost(endpoint + "/projects/" + projectId + "/groups/" + groupId + "/items", currentUserID, projGroupItems);
		if (response.code != 201 && response.code != 304) {
		   var errorMessage = "ERROR: Failed to create project group items: " + projectId + " and group: " + groupId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		} else if (response.code == 304) {
			logDebug("DPR: Items already exist in project group " + groupId + " on project " + projectId);
		}

		return true;
    }

    function deleteProjectFromGroup(groupId) { // optional capid
		
		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}
		
		var projectId = itemCap.getId() + "";

		var response = sendDelete(endpoint + "/projects/" + projectId + "/groups/" + groupId + "/items/" + projectId, currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to delete project group item: " + projectId + " from group: " + groupId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}
		return true;    	
    }

    function deleteProjectFromAllGroups() {
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		// get all project groups
		var pGroups = getProjectGroups(itemCap);

		if (pGroups.length > 0) {
			for (var p in pGroups) {
				deleteProjectFromGroup(pGroups[p].id, itemCap);
			}
		} 
    }


	function addProject2ParentGroup(groupType, parentCapId) { // optional capId
		//optional capId
		var itemCap = capId;
		if (arguments.length > 2) {
			itemCap = arguments[2];
		}

		var projectGroups = new Array();
		projectGroups = getProjectGroups(parentCapId);
		var createNewProjectGroup = true;

		if (projectGroups.length > 0) { // if project groups exist
			var groupId = "";
			for (var i in projectGroups) {
				if (projectGroups[i].name.indexOf(groupType + ":") > -1) {
					groupId = projectGroups[i].id;
					createNewProjectGroup = false;
					break;
				} 
			}

			if (groupId != "") { // if a revision group exists add current project to group
				var projectsToAdd = new Array();
				projectsToAdd.push(servProvCode + "-" + itemCap.toString());
				createProjectGroupItems(groupId, projectsToAdd, parentCapId);
			} 
		} 

		if (createNewProjectGroup) { // if no project groups, or now revision group exists, create project group and add current project
			var newProjGroupObj = {};
			newProjGroupObj.name = new String(groupType + ": " + parentCapId.getCustomID());
			newProjGroupObj.projects = new Array();
			newProjGroupObj.projects.push(servProvCode + "-" + parentCapId.toString());
			newProjGroupObj.projects.push(servProvCode + "-" + itemCap.toString());
			createProjectGroup(newProjGroupObj, parentCapId);
		}
	}

	/*------------------------------------------------------------------------------------------------------/
	| Project Groups (end)
	/------------------------------------------------------------------------------------------------------*/

	/*------------------------------------------------------------------------------------------------------/
	| Print Set (start)
	/------------------------------------------------------------------------------------------------------*/

	function getPrintSets() { //optional capId
		
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get print sets sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/printsets", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get print sets for project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    return response.body;
		}

		return [];		
	}

	function createPrintSet(printSetObj){ //optional capId

		//optional capId
		var itemCap = capId
			, projectSheets;

		if (arguments.length == 2) {
			itemCap = arguments[1];
		}
	
		// check for presence of project sheets
		projectSheets = getProjectSheets(itemCap);
		if (projectSheets.length > 0) { // check if any sheets available for print set
			var package = {};

			package.name = printSetObj.name;
			package.type = printSetObj.type;
			package.includeStamps = printSetObj.includeStamps; // set a default if not included
			package.includeNotes = printSetObj.includeNotes;
			if (printSetObj.group != undefined) {
				package.group = printSetObj.group;
			}

			var projectId = itemCap.getId() + "";
			logDebug("DPR: Create print set sent for: " + itemCap.getCustomID());	

			var response = sendPost(endpoint + "/projects/" + projectId + "/printsets", lookup("DPR_CONFIGS", "DPR_USER_ID"), package);
			if (response.code != 202) {
			   var errorMessage = "ERROR: Failed to create printset: " + projectId + ". Response code: " + response.code;
			   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
			} else {
				 return true;
			}			
		} else {
			logDebug("Failed to create printset for project: " + itemCap.getId() + ", no available sheets");
		}
		return false;
	}

	function deletePrintSet(printSetId) { // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";

		var response = sendDelete(endpoint + "/projects/" + projectId + "/printsets/" + printSetId, currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to delete print set for project: " + projectId + " and print set id: " + printSetId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}

		return true;
	} 

	/*------------------------------------------------------------------------------------------------------/
	| Print Set (end)
	/------------------------------------------------------------------------------------------------------*/

	/*------------------------------------------------------------------------------------------------------/
	| Stamps (start)
	/------------------------------------------------------------------------------------------------------*/

	function getAvailableProjectStamps() { // optional capId
		//optional capId
		var itemCap = capId;
		var currentUser = currentUserID;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get available project stamps sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/stamps/templates", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get available project stamps. Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		   return response.body;
		}

		return [];
	}

	function isAllSheetsStamped () { //optional capId
		//enhance to support checking for a stamp by name

		//optional capId
		var itemCap = capId,
			allSheetsStamped = true;

		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectSheets = new Array();
		projectSheets = getProjectSheets();
		if (projectSheets.length > 0) {
			for (var i in projectSheets) {
				var thisSheet = projectSheets[i];
				var sheetStamps = new Array();
				sheetStamps = getProjectSheetStamps(thisSheet.id);
				if (sheetStamps.length == 0) {
					allSheetsStamped = false;
					break;
				}
			}
		} else {
			allSheetsStamped = false;
		}

		return allSheetsStamped;	

	}

	function getProjectSheetStamps(sheetId) { //optional capId
		//optional capId
		var itemCap = capId;
		var sheetStamps = new Array();

		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get available project stamps sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/sheets/" + sheetId +"/stamps", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get available project stamps. Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		   sheetStamps = response.body;
		}

		return sheetStamps;
	}

	function deleteProjectStamps() { //optional capId
		
		//optional capId
		var itemCap = capId;
		var currentUser = currentUserID;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var stamps = getAvailableProjectStamps(itemCap);
		if (stamps.length > 0) {
			for (var i in stamps) {
				deleteProjectStamp(stamps[i],itemCap);
			}
			return true;
		}
		return false;		
	}
	
	function deleteProjectStamp(stampName) { //optional capId
		//optional capId
		var itemCap = capId;
		var currentUser = currentUserID;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		var package = {};
		var stamp = {};
		stamp.name = "dpr-stamp-" + stampName;
		package.stamp = stamp;
		logDebug("DPR: Deleting all project stamps sent for: " + itemCap.getCustomID() + "and stamp: " + stampName);	

		var response = sendPut(endpoint + "/projects/" + projectId + "/sheets/stamps/delete", currentUserID, package);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to delete stamp for project: " + projectId + " and stamp: " + stampName + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}

		return true;
	}
	
	/*------------------------------------------------------------------------------------------------------/
	| Stamps (end)
	/------------------------------------------------------------------------------------------------------*/

	/*------------------------------------------------------------------------------------------------------/
	| Review Packages (start)
	/------------------------------------------------------------------------------------------------------*/

    function createProjectPlusSubmittal() { // optional capId, optional currentUser
		
		//optional capId
		var itemCap = capId;
		var currentUser = currentUserID;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		if (arguments.length == 2) {
			currentUser = arguments[1];
		}

		logDebug("DPR: Create project plus submittal package sent for: " + itemCap.getCustomID());	

		var createProjectResponse = createProject(itemCap, currentUser);

		if (createProjectResponse) {
				var createSubmittalPackageResponse = createSubmittalPackage(null,false,itemCap,currentUser);
				if (createSubmittalPackageResponse) {
					return true;
				}
		}

		return false;
    }

    function createSubmittalPackage(name){ //optional boolean parameter to publish issues, optional capId, optional currentUserID

    	var itemCap = capId;
    	var currentUser = currentUserID;
    	var publishIssuesParameter = "";

		if (arguments.length > 1) {
			if (arguments[1] == true) {
				publishIssuesParameter = "?publish=yes";
			}

			//optional capId
			if (arguments.length == 3) {
				itemCap = arguments[2];
			}

			//optional currentUser
			if (arguments.length == 4) {
				currentUser = arguments[3];
			}
		} 
		
		var package = {};
		if (name){
		   package.name = name;
		}
		var projectId = itemCap.getId() + "";
		logDebug("DPR: Create submittal package sent for: " + projectId);	

		var response = sendPost(endpoint + "/projects/" + projectId + "/submittals" + publishIssuesParameter, currentUser, package);
		if (response.code != 201) {
		   var errorMessage = "ERROR: Failed to create submittal for project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		} else {
			 return response.body.id;
		}
    }

    function getProjectSubmittal(submittalId){ // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get submittal sent for project: " + itemCap.getCustomID() + " and submittal: " + submittalId);	

		var response = sendGet(endpoint + "/projects/" + projectId + "/submittals/" + submittalId, currentUserID);
		if (response.code == 200) {
		   if (response.body != null) {
		   	return response.body;
		   }
		} 

		return false;
    }

    function getProjectSubmittals(){ // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get submittals sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/submittals", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get submittals for project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    return response.body;
		}

		return [];
    }

    function getLatestProjectSubmittal() { // optional capId

		//optional capId
		var itemCap = capId
			, latestProjectSubmittal;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Get latest package sent for: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/submittals/last", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get submittals for project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		    latestProjectSubmittal = response.body;
		}		

    	return latestProjectSubmittal;

    }

    function updateProjectSubmittalStatus(submittalId, newStatus){ // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 3) {
			itemCap = arguments[2];
		}

		var package = {};
		package.status = newStatus;

		var projectId = itemCap.getId() + "";
		logDebug("DPR - Update submittal package sent for: " + itemCap.getCustomID());	

		var response = sendPut(endpoint + "/projects/" + projectId + "/submittals/" + submittalId, currentUserID, package);
		if (response.code != 200 && response.code != 304) {
		   var errorMessage = "ERROR: Failed to update submittal for project: " + projectId + " and submittal: " + submittalId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}
		return true;
    }

    function updateLatestProjectSubmittalStatus(status) { //optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

    	var latestProjectSubmittal = getLatestProjectSubmittal(itemCap);

    	if (latestProjectSubmittal) {
    		if (latestProjectSubmittal.status.toUpperCase() != "ACCEPTED") { // accepted packages cannot be updated
    			var updateSubmittalResponse = updateProjectSubmittalStatus(latestProjectSubmittal.id, status, itemCap);
    		} else {
    			logDebug("DPR - Package status cannot be updated, newest package already accepted: " + itemCap.getCustomID());
    		}
    	} else {
    		logDebug("DPR - No packages exist for project: " + itemCap.getCustomID());
    		return false;
    	}
    	
    	return true;
    }

    function getPackageSheets (submittalId) { //optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Getting sheets for package: " + submittalId + " on project: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/submittals/" + submittalId + "/views", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get sheets for package: " + submittalId + " on project: " + itemCap.getCustomID() + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		   return response.body;
		}

		return false;

    }

    function getPackageSheetCount() { // optional capId, optional submittalId

		//optional capId
		var itemCap = capId
			, submittalId
			, latestProjectSubmittal;

		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		if (arguments.length > 1) {
			submittalId = arguments[1];
		} else {
			latestProjectSubmittal = getLatestProjectSubmittal(itemCap);
			if (latestProjectSubmittal) {
				submittalId = latestProjectSubmittal.id;	
			} 
		}

    	if (submittalId) {
    		
    		var packageSheets = getPackageSheets(submittalId, itemCap);

    		if (packageSheets) { // accepted packages cannot be updated
    			return packageSheets.length;
    		} else {
    			logDebug("DPR - Error getting sheets for package: " + submittalId + " on project: " + itemCap.getCustomID());
    		}
    	} else {
    		logDebug("DPR - No packages exist for project: " + itemCap.getCustomID());
    	}
    	
    	return false;
    }

	/*------------------------------------------------------------------------------------------------------/
	| Review Packages (end)
	/------------------------------------------------------------------------------------------------------*/

    function reOrderProjectSheets() { //optional capId
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectSheets = new Array();
		projectSheets = getProjectSheets();
		if (projectSheets.length > 0) {
			for (var i in projectSheets) {
				var thisSheet = projectSheets[i];
				var sheetVersions = new Array();
				sheetVersions = getSheetVersions(thisSheet.id);
				if (sheetVersions.length > 0) {
					for (var j in sheetVersions) {
						var thisSheetVersion = sheetVersions[j];
						updateSheet(thisSheet);
					}
				}
			}
		}	
    }

	function getSheetVersions(sheetId) { // optional capId
		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}
		
		var projectId = itemCap.getId() + "";
		logDebug("DPR: Getting sheet versions for sheet/project: " + sheetId + "/" + itemCap.getCustomID());	
		
		var response = sendGet(endpoint + "/projects/" + projectId + "/sheets/" + sheetId + "/versions", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get sheet versions for sheet/project: " + sheetId + "/" + itemCap.getCustomID() + ". Response code: " + response.code;
		   logDebug(errorMessage);
		} else {
		   return response.body;
		}

		return false;

	}    

    function updateSheet(sheetToUpdate) { // optional capId
		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";
		var package = {};
		package.id = sheetToUpdate.id;
		package.number = sheetToUpdate.number;

		var response = sendPut(endpoint + "/projects/" + projectId + "/sheets/" + sheetToUpdate.id, currentUserID, package);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to update sheet/project: " + sheetToUpdate.id + "/" + projectId + ". Response code: " + response.code;
		   logDebug(errorMessage);
		   return false;
		}
		return true;

    }

    function getProjectSheets () { //optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Getting sheets for project: " + itemCap.getCustomID());	

		var response = sendGet(endpoint + "/projects/" + projectId + "/sheets", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get sheets for project: " + itemCap.getCustomID() + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		} else {
		   return response.body;
		}

		return false;

    }    

    function acceptReviewPackages() { // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}
    	
    	logDebug("DPR - Updating submitted packages to accepted for project: " + itemCap.getCustomID());
    	var projectSubmittals = getProjectSubmittals(itemCap);

    	if (projectSubmittals.length > 0) {
			for (var i in projectSubmittals) {
			    var thisPackage = projectSubmittals[i];
			    
			    if (thisPackage.status.toUpperCase() == "SUBMITTED") {
			        var updateSubmittalResponse = updateProjectSubmittalStatus(thisPackage.id, "accepted", itemCap);
			    } 
			}    		
    	} else {
    		return false;
    	}

    	return true;    	
    }

    function isOpenReviewPackages() { //optional capId, optional package type, optional package file check

		var isOpenReviewPackage = false;
		
		//optional capId
		var itemCap = capId;
		if (arguments.length > 0) {
			itemCap = arguments[0];
		} 

		// optional package type to check for
		var packageTypeCheck = "";
		if (arguments.length > 1) {
			packageTypeCheck = arguments[1];
		}

		// optional package files check, check if package is empty or not
		var packageFileCheck = false;
		if (arguments.length > 2) {
			packageFileCheck = arguments[2];
		}

		logDebug("DPR - Checking for open review packages on project: " + itemCap.getCustomID());
    	var projectSubmittals = getProjectSubmittals(itemCap);

    	if (projectSubmittals.length > 0) {
			for (var i in projectSubmittals) {
			    var thisPackage = projectSubmittals[i];

			    if (packageTypeCheck == "cycle" && thisPackage.type == "amend") continue;
			    if (packageTypeCheck == "amend" && thisPackage.type == undefined) continue;
			    
			    if (!matches(thisPackage.status.toUpperCase(),"SUBMITTED","ACCEPTED")) {
			        if (packageFileCheck) {
			        	// Check if files in package
			        	if (isReviewPackageEmpty(thisPackage.id)) {
			        		isOpenReviewPackage = true;
			        		break;
			        	}
			        } else {
			        	isOpenReviewPackage = true;
			        	break;
			        }  
			    } 
			}    		
    	} 
    	return isOpenReviewPackage;
    }

	function isReviewPackageEmpty (submittalId) { // optional capId

		var reviewPackageEmpty = true;
		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";

		var response = sendGet(endpoint + "/projects/" + projectId + "/submittals/" + submittalId + "/files", currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to get files for project: " + projectId + " and submittal: " + submittalId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		} else {
			if (response.body.length > 0) {
				reviewPackageEmpty = false;
			}
		}		
		return reviewPackageEmpty; 
	}

	function cleanUpEmptyReviewPackages() { // optional capId
		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectSubmittals = getProjectSubmittals(itemCap);
    	if (projectSubmittals.length > 0) {
			for (var i in projectSubmittals) {
			    var thisPackage = projectSubmittals[i];
			    
			    if (!matches(thisPackage.status.toUpperCase(),"SUBMITTED","ACCEPTED","ACCEPTING","SUBMITTING","WITHDRAWING")) {
		        	if (isReviewPackageEmpty(thisPackage.id)) {
		        		deleteReviewPackage(thisPackage.id);
		        	}
			    } 
			}    		
    	}
    	return true;
	}

	function deleteReviewPackage(submittalId) { // optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var projectId = itemCap.getId() + "";

		var response = sendDelete(endpoint + "/projects/" + projectId + "/submittals/" + submittalId, currentUserID);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to delete review package for project: " + projectId + " and submittal: " + submittalId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}

		return true;
	}    

    function updateSubmittalName(submittalId, name){ // optional description, optional capId

		var itemCap = capId;
		var package = {};
		package.name = name;

		if (arguments.length > 2) {
			package.description = "" + new String(arguments[2]);

			if (arguments.length == 4) {
				itemCap = arguments[3];
			}
		}

		var projectId = itemCap.getId() + "";
		logDebug("DPR: Create submittal package sent for: " + projectId);	

		var response = sendPut(endpoint + "/projects/" + projectId + "/submittals/" + submittalId, currentUserID, package);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to update submittal for project: " + projectId + " and submittal: " + submittalId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}
		return true;
    }

    function getDisciplineByWorkflowTask(taskName) {
		
		var discipline = "";
		var bizDomScriptResult = aa.bizDomain.getBizDomain("DPR_DISCIPLINES");
		if (bizDomScriptResult.getSuccess()) {
			var bizDomScript = bizDomScriptResult.getOutput();
			for (var i = 0; i < bizDomScript.size(); i++) {
				var sc = bizDomScript.get(i);

				var scValue = sc.getBizdomainValue();
				var scValueDesc = sc.getDescription();
				if (scValueDesc.indexOf(taskName) != -1) {
					var scValueDescArray = scValueDesc.split(";");
					for (var k in scValueDescArray) {
						if (scValueDescArray[k].indexOf("task=") != -1) {
							var taskConfigArray = scValueDescArray[k].split("=");
							discipline = scValue;
							break;
						}
					}	
				}
			}
		}
		return discipline;    	
    }
/*------------------------------------------------------------------------------------------------------/
| Issues (start)
/------------------------------------------------------------------------------------------------------*/

	function getIssues() { // optional task name, optional capId, optional statuses array, to-do, support more than one discipline

		var itemCap = capId;
        var useTaskName = false;
        var taskName = "";
        var issues = new Array();
        var statuses = new Array();
        var issueFilter = "";

        if (arguments.length > 0) {
            taskName = arguments[0]; 
            if (taskName != null && taskName != "") useTaskName = true;

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }

            //optional statuses array
            if (arguments.length == 3) {
            	statuses = arguments[2];
            }
        }

        var projectId = itemCap.getId() + "";
        
		if (statuses.length > 0) {
			var statusesList = "";
			statusesList = statuses.join(",");
			issueFilter += "statuses:" + statusesList + ";";
		}

        if (useTaskName) {
            var discipline = getDisciplineByWorkflowTask(taskName);
            if (discipline != "") {
                issueFilter += "disciplines:" + encodeURIComponent(discipline) + ";";
            }
        }

        if (issueFilter.length > 0) {
        	issueFilter = "filter=" + issueFilter.substring(0, issueFilter.length - 1);
        }

        var response = sendGet(endpoint + "/projects/" + projectId + "/issues?" + issueFilter, currentUserID);
        if (response.code != 200) {
            var errorMessage = "ERROR: Getting issues for project: " + projectId + ". Response code: " + response.code;
            handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
        } else {
            if (response.body.length > 0) {
                issues = response.body
            }
        }

        return issues;
	}

    function isOpenIssues() { // optional task name, optional capId
        
		var itemCap = capId;
        var taskName = "";
        var issues = new Array();

        if (arguments.length > 0) {
            taskName = arguments[0]; 

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }

        logDebug("DPR: Getting open issues for: " + itemCap.getId());  
        var issues = getIssues(taskName,itemCap,["draft","open","inreview","answered","notaccepted"]);
        
        return (issues.length > 0) ? true : false;
    }

 	function getOpenIssueDisciplines() { // optional capId
        
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		} 

        var disciplinesArray = new Array();
        logDebug("DPR: Getting open issues for: " + itemCap.getId());
        var issues = getIssues(null,itemCap,["draft","open","inreview","answered","notaccepted"]);
        if (issues.length > 0) {
            for (var i in issues) {
				var thisIssue = issues[i];
				var thisDiscipline = thisIssue.discipline.charAt(0).toUpperCase() + thisIssue.discipline.slice(1);
				if (disciplinesArray.indexOf(thisDiscipline) == -1) {
					disciplinesArray.push(thisDiscipline);
				}
            }
        }        
        return disciplinesArray;
    }

    function getOpenIssuesCount4Notification() { //optional task name, capId
		
		var itemCap = capId;
        var taskName = "";
        var issues = new Array();

        if (arguments.length > 0) {
            taskName = arguments[0]; 

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }

        logDebug("DPR: Getting open issues for: " + itemCap.getId());  
        var issues = getIssues(taskName,itemCap,["open","answered"]);

        return (taskName != "") ? issues.length + " " + taskName.toLowerCase() + " issue(s)" : issues.length + "";
    }

    // Deprecate this function in favor of publishIssues()
	function publishIssuesByDiscipline(taskName) { //optional capId

		//optional capId
		var itemCap = capId
		if (arguments.length == 2) {
			itemCap = arguments[1];
		} 

		var projectId = itemCap.getId() + "";	
		var discipline = getDisciplineByWorkflowTask(taskName);
		if (discipline != "") {
			var issues = {};
			issues.status = "publish";
			issues.discipline = new String(discipline);

			logDebug("DPR - Publish issues for " + discipline + " discipline on project " + projectId + " sent.");	

			var response = sendPut(endpoint + "/projects/" + projectId + "/issues", currentUserID, issues);
			if (response.code != 200 && response.code != 304) {
			   var errorMessage = "ERROR: Failed to publish issues on project " + projectId + ". Response code: " + response.code;
			   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
			   return false;
			} else if (response.code == 304) {
				logDebug("DPR - No issues were available for publishing on " + projectId);
			}
		} else {
			logDebug("**ERROR: Failed to retrieve discipline for workflow task: " + taskName + " for project " + projectId + ".");
			return false;
		}			

		return true;
    }

 	function publishIssues() { //optional taskName, optional capId

		//optional capId
		var itemCap = capId;

        var useTaskName = false;
        var taskName = "";
        if (arguments.length > 0) {
            taskName = arguments[0]; 
            useTaskName = true;

            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }
		
		var projectId = itemCap.getId() + "";	
		var issues = {};
		issues.status = "publish";
        if (useTaskName) {
            var discipline = getDisciplineByWorkflowTask(taskName);
            if (discipline != "") {
                issues.discipline = new String(discipline);
                logDebug("DPR - Publish issues for " + discipline + " discipline on project " + projectId + " sent.");	
            } else {
				logDebug("**ERROR: Failed to retrieve discipline for workflow task: " + taskName + " for project " + projectId + ".");
				return false;			            	
            }
        } else {
        	logDebug("DPR - Publish all issues on project " + projectId + " sent.");	
        }

		var response = sendPut(endpoint + "/projects/" + projectId + "/issues", currentUserID, issues);
		if (response.code != 200 && response.code != 304) {
		   var errorMessage = "ERROR: Failed to publish issues on project " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		} else if (response.code == 304) {
			logDebug("DPR - No issues were available for publishing on " + projectId);
		}

		return true;
    }

/*------------------------------------------------------------------------------------------------------/
| Issues (end)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Conditions (start)
/------------------------------------------------------------------------------------------------------*/

	function getConditions() { // optional task name, optional capId, optional statuses array, to-do, support more than one discipline

		var itemCap = capId;
        var useTaskName = false;
        var taskName = "";
        var issues = new Array();
        var statuses = new Array();
        var conditionFilter = "";

        if (arguments.length > 0) {
            taskName = arguments[0]; 
            if (taskName != null && taskName != "") useTaskName = true;

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }

            //optional statuses array
            if (arguments.length == 3) {
            	statuses = arguments[2];
            }
        }

        var projectId = itemCap.getId() + "";
        
		if (statuses.length > 0) {
			var statusesList = "";
			statusesList = statuses.join(",");
			conditionFilter += "statuses:" + statusesList + ";";
		}

        if (useTaskName) {
            var discipline = getDisciplineByWorkflowTask(taskName);
            if (discipline != "") {
                conditionFilter += "disciplines:" + encodeURIComponent(discipline) + ";";
            }
        }

        if (conditionFilter.length > 0) {
        	conditionFilter = "filter=" + conditionFilter.substring(0, conditionFilter.length - 1);
        }

        var response = sendGet(endpoint + "/projects/" + projectId + "/conditions?" + conditionFilter, currentUserID);
        if (response.code != 200) {
            var errorMessage = "ERROR: Getting conditions for project: " + projectId + ". Response code: " + response.code;
            handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
        } else {
            if (response.body.length > 0) {
                issues = response.body
            }
        }

        return issues;
	}

    function isOpenConditions() { // optional task name, optional capId

		var itemCap = capId;
        var taskName = "";
        var conditions = new Array();

        if (arguments.length > 0) {
            taskName = arguments[0]; 

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }

        logDebug("DPR: Getting open conditions for: " + itemCap.getId());  
        var conditions = getConditions(taskName,itemCap,["draft","condition"]);
        
        return (conditions.length > 0) ? true : false;        
    }

    function getOpenConditionsCount4Notification() { //optional task name, capId
		
		var itemCap = capId;
        var taskName = "";
        var conditions = new Array();

        if (arguments.length > 0) {
            taskName = arguments[0]; 

            //optional capId
            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }

        logDebug("DPR: Getting conditions for: " + itemCap.getId());  
        var conditions = getConditions(taskName,itemCap,["condition"]);

        return (taskName != "") ? conditions.length + " " + taskName.toLowerCase() + " condition(s)" : conditions.length + "";
    }

	function publishConditions() { //optional taskName, optional capId

		//optional capId
		var itemCap = capId;

        var useTaskName = false;
        var taskName = "";
        if (arguments.length > 0) {
            taskName = arguments[0]; 
            useTaskName = true;

            if (arguments.length == 2) {
            	itemCap = arguments[1];
            }
        }
		
		var projectId = itemCap.getId() + "";	
		var conditions = {};
		conditions.status = "publish";
        if (useTaskName) {
            var discipline = getDisciplineByWorkflowTask(taskName);
            if (discipline != "") {
                conditions.discipline = new String(discipline);
                logDebug("DPR - Publish conditions for " + discipline + " discipline on project " + projectId + " sent.");	
            } else {
				logDebug("**ERROR: Failed to retrieve discipline for workflow task: " + taskName + " for project " + projectId + ".");
				return false;			            	
            }
        } else {
        	logDebug("DPR - Publish all conditions on project " + projectId + " sent.");	
        }

		var response = sendPut(endpoint + "/projects/" + projectId + "/conditions", currentUserID, conditions);
		if (response.code != 200) {
		   var errorMessage = "ERROR: Failed to publish conditions on project " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		   return false;
		}

		return true;
    }

/*------------------------------------------------------------------------------------------------------/
| Conditions (end)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Files (start)
/------------------------------------------------------------------------------------------------------*/

	function getFileInfo(fileId) {
		var response = sendGet(endpoint + "/files/" + fileId, currentUserID);
		if (response.code == 200) {
			return response.body;
		} 

		return false;		
	}

/*------------------------------------------------------------------------------------------------------/
| Files (end)
/------------------------------------------------------------------------------------------------------*/

    function dprProjectExists() { // optional capId
       
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		} 

    	var projectExists = false;

		var projectId = itemCap.getId() + "";
		logDebug("DPR - Get DPR project: " + projectId);	

		var response = sendGet(endpoint + "/projects/?filter=ids:" + projectId, currentUserID);
		if (response.code == 200) {
		   if (response.body.length > 0) {
				projectExists = true;	       	
		   }
		} else if (response.code == 404) {
			   projectExists = false;
		} else {
			   var errorMessage = "ERROR: Getting project: " + projectId + ". Response code: " + response.code;
		   handleDprException(lookup("DPR_ERROR", "EMSE_ERROR_CODE"), errorMessage, itemCap);
		}

		return projectExists;
    }

	function sendDprEmailNotification(notificationObj) { // optional capId
		// notificationObj includes the following properities
		// noticationId - name of the notification to send
		// eParams - additional notification values to pass to the communicatio manager
		// emailList - override default behavior to send all contacts and LPs
		// primaryOnly - if true only send notification to the primary contact and LP (default is false)
		// ccEmailList - add CC email list, comma separated

		var emailProvided = false;
		var primaryContactsOnly = false;
		var additionalParams;
		var emailParams = aa.util.newHashtable();
		var reportParams = aa.util.newHashtable();
		var reportFiles = new Array();
		var itemCap = capId;
		var conEmail = "";
		var ccEmail = "";
		var notificationId;

		//optional capId
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		notificationId = notificationObj.notificationId;

		// if additional email parameters sent add to the parameters
		if (notificationObj.eParams != undefined) {
			additionalParams = notificationObj.eParams;

			for (var key in additionalParams) {
				if (additionalParams.hasOwnProperty(key)) {
					addParameter(emailParams, "$$" + key + "$$", additionalParams[key]);
				}
			}				
		}

		// if email list sent, use that
		if (notificationObj.emailList != undefined) {
			conEmail = notificationObj.emailList;
			emailProvided = true;			
		}

		// if email not provided and flag to only sent to primary
		if (notificationObj.primaryOnly == true) {
			primaryContactsOnly = true;
		}

		// if email cc list is provided
		if (notificationObj.ccEmailList != undefined) {
			ccEmail = notificationObj.ccEmailList;		
		} 		

		var projectNumber = itemCap.getCustomID();

		// if no email list provided get emails from the record
		if (!emailProvided) {
			// get contacts email addresses
			conEmail = getRecordContactEmailList(primaryContactsOnly,itemCap);
			conEmail += getRecordProfessionalsEmailList(primaryContactsOnly,itemCap);
		}

		// if report files included, attach to the email
		if (notificationObj.reportFiles != undefined) {
			reportFiles = notificationObj.reportFiles;
		}

		var propertyAddress = getRecordPrimaryAddress(itemCap);

		addParameter(emailParams, "$$addressLine$$", propertyAddress);
		addParameter(emailParams, "$$contactname$$", getPrimaryContactFullName());

		addParameter(emailParams, "$$altID$$", projectNumber);
		addParameter(emailParams, "$$capName$$", aa.cap.getCap(itemCap).getOutput().getSpecialText());
		addParameter(emailParams, "$$workDesc$$", workDescGet(itemCap));

		//getACARecordParam4Notification(emailParams,acaUrl);
		addParameter(emailParams, "$$acaRecordUrl$$", getACARecordURLDpr(acaUrl, itemCap));
		addParameter(emailParams, "$$acaUrl$$", acaUrl);
		getDprNotificationLinkParams4Notifications(emailParams);
		getDprNotificationValueParams4Notifications(emailParams);
		addParameter(emailParams, "$$env$$", ENVIRON);
		addParameter(emailParams, "$$agency$$", servProvCode);

		// get plan room ACA links

		// Get link to issues
		var dprIssueListURL = getDprACADeepLinkUrl("ISSUESLIST",null,itemCap);
		dprIssueListURL ? addParameter(emailParams, "$$dprIssuesLink$$", dprIssueListURL) : addParameter(emailParams, "$$dprIssuesLink$$", acaUrl);			

		// Get link to conditions
		var dprConditionListURL = getDprACADeepLinkUrl("CONDITIONSLIST",null,itemCap);
		dprConditionListURL ? addParameter(emailParams, "$$dprConditionsLink$$", dprConditionListURL) : addParameter(emailParams, "$$dprConditionsLink$$", acaUrl);

		// Get link to approved plans
		var dprApprovedPlansURL = getDprACADeepLinkUrl("APPROVEDPLANS",null,itemCap);
		dprApprovedPlansURL ? addParameter(emailParams, "$$dprApprovedPlansLink$$", dprApprovedPlansURL) : addParameter(emailParams, "$$dprApprovedPlansLink$$", acaUrl);

		// Get link to resume submittal
		if (additionalParams != undefined) {
			if (additionalParams.submittalId != undefined) {			
				// Get link to resume submittal
				var dprNewReviewPackageURL = getDprACADeepLinkUrl("RESUMESUBMITTAL", additionalParams.submittalId, itemCap);
				dprNewReviewPackageURL ? addParameter(emailParams, "$$dprNewReviewPackageLink$$", dprNewReviewPackageURL) : addParameter(emailParams, "$$dprNewReviewPackageLink$$", acaUrl);
			}
		}

		if (notificationId == "REVIEW_PACKAGE_SUBMITTED") {
			
			addParameter(emailParams, "$$aaRecordLink$$", getAARecordLink());
			var planLinkObj = {};
			addParameter(emailParams, "$$planRoomProjectLink$$", getPlanRoomProjectLink(planLinkObj));
		}	

		var notificationTemplateName = lookup("DPR_NOTIFICATION_TEMPLATES", notificationId);	
		
		if (conEmail != null && notificationTemplateName != undefined) {
			sendNotificationDPR(lookup("DPR_CONFIGS", "NOTIFICATION_FROM_EMAIL"), conEmail, ccEmail, notificationTemplateName, emailParams, reportFiles, itemCap);
		}	
	}

	function sendError2Dpr(errorObj) { 
				
		if (errorObj) {
			logDebug("DPR: Sending error details to DPR Cloud");	
			var response = sendPost(endpoint + "/diag/dump", currentUserID, errorObj);
			if (response.code != 200) {
			   logDebug("ERROR: Failed to send error details to DPR Cloud. Response code: " + response.code);
			   return false;
			}
			return true;
		}
		return false;
    }
	
	function handleDprException(errorCode, errorMessage) { // optional capId

		var itemCap = capId;

		//optional capId
		if (arguments.length == 3) {
			itemCap = arguments[2];
		} 
		
		logDebug(errorCode + ": " + errorMessage);
		// Get methods of notification from standard choices
		var sendEmail = lookup("DPR_ERROR", "ERROR_SEND_EMAIL");
		var addAdHoc = lookup("DPR_ERROR", "ERROR_ADHOC_TASK");
		var addAppCond = lookup("DPR_ERROR", "ERROR_CONDITION");
		var send2Slack = lookup("DPR_ERROR", "ERROR_SLACK");

		if (sendEmail == "Yes") {
			// Send email notification
			sendDprExceptionNotification("DPR_EXCEPTION", errorCode, errorMessage, itemCap);			
		}

		if (addAdHoc == "Yes") {
			// get the adhoc process and task to create/update
			var adHocConfig = lookup("DPR_ERROR", "ADHOC_TASK");

			if (adHocConfig != undefined) {
				var adHocConfigArray = adHocConfig.split("|");
				// Add ad-hoc task
				if (!isTaskActive(adHocConfigArray[1])) addAdHocTask(adHocConfigArray[0], adHocConfigArray[1], errorCode, currentUserID,itemCap);
				
				// Update the status to 'Logged' to enter into workflow history
				updateTask(adHocConfigArray[1], "Logged", errorCode + ": " + errorMessage, errorCode, adHocConfigArray[0], itemCap);					
			}
				
		}

		// THIS ERROR OPTION WILL NOT WORK CURRENTLY WITH OPTIONAL CAPID (addAppCondition does not support optional capId, will need to make method call directly)
		if (addAppCond == "Yes") {
			// get the condition type and details to add
			var conditionConfig = lookup("DPR_ERROR", "CONDITION");

			if (conditionConfig != undefined) {
				var conditionConfigArray = conditionConfig.split("|");

				// Add app condition
				addAppCondition(conditionConfigArray[0], conditionConfigArray[1], errorCode, errorMessage, conditionConfigArray[2]);
				// Update condition to display banner in AA
				var condResult = aa.capCondition.getCapConditions(itemCap,conditionConfigArray[0]);
				if (condResult.getSuccess()) {
					var capConds = condResult.getOutput();
					for (var cond in capConds) {
						thisCond = capConds[cond];
						thisCond.setDisplayConditionNotice("Y");
						thisCond.setIncludeInConditionName("Y");
						thisCond.setIncludeInShortDescription("Y");
						aa.capCondition.editCapCondition(thisCond);
					}
				}				
			}
				
		}

		if (lookup("DPR_ERROR", "EMSE_ERROR_CODE") == errorCode) {
			var errorObj = {};
			errorObj.error = errorCode;
			errorObj.env = ENVIRON;
		    
		    //get the EMSE error details to include in the dump
		    var eventParameters = "";			
		    var params = aa.env.getParamValues();
	    	var keys =  params.keys();
	    	var key = null;
		    while(keys.hasMoreElements()) {
			    key = keys.nextElement();
			    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
			    eventParameters += key + " = " + aa.env.getValue(key) + "; ";
		    }			

			errorObj.dump = errorCode + ": " + errorMessage + " on project " + itemCap.getCustomID() + " (" + itemCap.getId() + ")";	
			if (eventParameters.length > 0) {
				errorObj.dump += ": EMSE Event Details (" + eventParameters + ")"
			}	
			
			var sendErrorResult = sendError2Dpr(errorObj);
		}

		if (send2Slack == "Yes") {
			var slackUrl = lookup("DPR_ERROR", "SLACK_CONFIG");

			if (slackUrl != undefined) {
				var slackHeaders=aa.util.newHashMap();

			    slackHeaders.put("Content-Type","application/json");
			    var eventParameters = "";
				if (errorCode == lookup("DPR_ERROR", "EMSE_ERROR_CODE")) {
				    var params = aa.env.getParamValues();
			    	var keys =  params.keys();
			    	var key = null;
				    while(keys.hasMoreElements()) {
					    key = keys.nextElement();
					    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
					    eventParameters += key + " = " + aa.env.getValue(key) + "; ";
				    }			
				}
				
			    var slackBody = {};
				slackBody.text = aa.getServiceProviderCode() + ":" + ENVIRON + ": " + errorCode + ": " + errorMessage + " on project " + itemCap.getCustomID() + " (" + itemCap.getId() + ")";	

				if (eventParameters.length > 0) {
					slackBody.text += ": EMSE Event Details (" + eventParameters + ")"
				}			
			
			    var result = aa.httpClient.post(slackUrl, slackHeaders, JSON.stringify(slackBody));
			    if (!result.getSuccess()) {
			        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
				} else {	
					aa.print("Slack Results: " + result.getOutput());
			    }
			}
		}		
	}

	function handleDprAlert(errorCode, errorMessage) { // optional email list, capId

		var emailProvided = false;
		var conEmail = "";
		var itemCap = capId;

		if (arguments.length > 2) {
			//optional email list
			if (arguments[2] != null) {
				conEmail = arguments[2];
				emailProvided = true;				
			}
			//optional capId
			if (arguments.length == 4) {
				if (arguments[3] != null) {
					itemCap = arguments[3];
				}
			} 
		}

		// Get methods of notification from standard choices
		var workflowTrigger = lookup("DPR_ALERTS", "ALERT_WORKFLOW_TRIGGER");
		var sendValidationAlertEmail = lookup("DPR_ALERTS", "ALERT_SEND_EMAIL");
		// Implement future actions here

		if (workflowTrigger != undefined) {
			var workflowTriggerConfigArray = workflowTrigger.split("|");
			if (workflowTriggerConfigArray.length < 3) {
				logDebug("ALERT_WORKFLOW_TRIGGER is not configured correctly in DPR_ALERTS standard choice");
			} else if (workflowTriggerConfigArray[0] != "Yes") {
				logDebug("ALERT_WORKFLOW_TRIGGER is not enabled");
			} else {
				var alertTask = workflowTriggerConfigArray[1]
					, alertStatus = workflowTriggerConfigArray[2]
					, alertComment = errorMessage + "(" + errorCode + ")"
					, createAdHocTask = false;

				if (workflowTriggerConfigArray.length > 3) {
					if (workflowTriggerConfigArray[3] == "Yes") {
						createAdHocTask = true;
						var adHocTaskProcess = workflowTriggerConfigArray[4];
					}
				}

				var alertTasks = new Array();
				if (alertTask.indexOf(",") > -1) {
					alertTasks = alertTask.split(",");
				} else {
					alertTasks.push(alertTask);
				}

				if (createAdHocTask) {
					if (!isTaskActive(alertTask)) addAdHocTask(adHocTaskProcess, alertTask, "");
				}

				for (var at in alertTasks) {
					if(!isTaskActive(alertTasks[at])) {
						continue;
					}

					if(!isTaskStatus(alertTasks[at], alertStatus)) {
						updateTask(alertTasks[at], alertStatus, alertComment, "");
						if (sendValidationAlertEmail == "Yes" && emailProvided) {
							var notificationObj = {};
							notificationObj.notificationId = "FILE_VALIDATION_ASSISTANCE_NOTIFICATION";
							notificationObj.emailList = conEmail;
							sendDprEmailNotification(notificationObj,itemCap); 							
						}
					}					
				} 
			}
		}	
	}

	function handleDprRequest(requestCode, requestMessage) { // optional capId

		var itemCap = capId;

		//optional capId
		if (arguments.length == 3) {
			itemCap = arguments[2];
		} 
		
		// Get methods of notification from standard choices
		var workflowTrigger = lookup("DPR_ALERTS", "REQUEST_WORKFLOW_TRIGGER");
		// Implement future actions here

		if (workflowTrigger != undefined) {
			var workflowTriggerConfigArray = workflowTrigger.split("|");
			if (workflowTriggerConfigArray.length < 3) {
				logDebug("REQUEST_WORKFLOW_TRIGGER is not configured correctly in DPR_ALERTS standard choice");
			} else if (workflowTriggerConfigArray[0] != "Yes") {
				logDebug("REQUEST_WORKFLOW_TRIGGER is not enabled");
			} else {
				var requestTask = workflowTriggerConfigArray[1]
					, requestStatus = workflowTriggerConfigArray[2]
					, requestComment = requestMessage + "(" + requestCode + ")"
					, createAdHocTask = false;

				if (workflowTriggerConfigArray.length > 3) {
					if (workflowTriggerConfigArray[3] == "Yes") {
						createAdHocTask = true;
						var adHocTaskProcess = workflowTriggerConfigArray[4];
					}
				}

				if (createAdHocTask) {
					if (!isTaskActive(requestTask)) addAdHocTask(adHocTaskProcess, requestTask, "");
				}
				updateTask(requestTask, requestStatus, requestComment, "");
			}
		}	
	}

	function sendDprExceptionNotification(notificationId, errorCode, errorMessage) { // optional capId

		var itemCap = capId;

		//optional capId
		if (arguments.length == 4) {
			itemCap = arguments[3];
		} 

		var emailParams = aa.util.newHashtable();
		var reportParams = aa.util.newHashtable();
		var reportFile = new Array();

		addParameter(emailParams, "$$altID$$", itemCap.getCustomID());
		addParameter(emailParams, "$$dprErrorCode$$", errorCode);
		addParameter(emailParams, "$$dprErrorMessage$$", errorMessage);
		addParameter(emailParams, "$$env$$", ENVIRON);
		addParameter(emailParams, "$$agency$$", servProvCode);

		if (errorCode == lookup("DPR_ERROR", "EMSE_ERROR_CODE")) {
		    var eventParameters = "Parameters: ";
		    var params = aa.env.getParamValues();
	    	var keys =  params.keys();
	    	var key = null;
		    while(keys.hasMoreElements()) {
			    key = keys.nextElement();
			    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
			    eventParameters += key + " = " + aa.env.getValue(key) + "; ";
		    }
		    addParameter(emailParams, "$$eventDetails$$", eventParameters);			
		}

		var notificationTemplateName = lookup("DPR_NOTIFICATION_TEMPLATES", notificationId);	
		var email = lookup("DPR_ERROR", "ERROR_EMAIL_TO");

		if (email != undefined && notificationTemplateName != undefined)
		{
			sendNotificationDPR(lookup("DPR_CONFIGS", "NOTIFICATION_FROM_EMAIL"), email, "", notificationTemplateName, emailParams, reportFile, itemCap);
		}	
	}

	function sendFileProcessingCompleteNotification(submittalId, notificationId) // optional email address
	{
		var emailProvided = false;
		var emailParams = aa.util.newHashtable();
		getDprNotificationLinkParams4Notifications(emailParams);
		var reportParams = aa.util.newHashtable();
		var reportFile = new Array();
		var conArray = getContactArray();
		var conEmail = "";

		if (arguments.length == 3) {
			conEmail = arguments[2];
			emailProvided = true;
		}

		if (!emailProvided) {
			// no email provided, get all contact email addresses
			for (con in conArray)
			{
				if (!matches(conArray[con].email, null, undefined, ""))
				{
					conEmail += conArray[con].email + "; ";
				}
			}		
		}

		addParameter(emailParams, "$$altID$$", capIDString);

		var ad = aa.address.getAddressByCapId(capId).getOutput();
		var propertyAddress = "";

		if (ad.length > 0) {
			for(x in ad) {
				if (ad[x].getPrimaryFlag() == "Y") {
					if(ad[x].getHouseNumberStart() != null) propertyAddress += ad[x].getHouseNumberStart();
					if(ad[x].getStreetName() != null) propertyAddress += " " + ad[x].getStreetName();
					if(ad[x].getStreetSuffix() != null) propertyAddress += " "  + ad[x].getStreetSuffix();
					if(ad[x].getStreetDirection() != null) propertyAddress += " " + ad[x].getStreetDirection();
					}
			}
		}

		addParameter(emailParams, "$$addressLine$$", propertyAddress);
		addParameter(emailParams, "$$contactname$$", getPrimaryContactFullName());
		addParameter(emailParams, "$$env$$", ENVIRON);
		addParameter(emailParams, "$$agency$$", servProvCode);
		getDprNotificationLinkParams4Notifications(emailParams);
		getDprNotificationValueParams4Notifications(emailParams);
		addParameter(emailParams, "$$capName$$", aa.cap.getCap(capId).getOutput().getSpecialText());
		addParameter(emailParams, "$$workDesc$$", workDescGet(capId));
		// get sheet versioning deep link
		var dprSheetVersioningURL = getDprACADeepLinkUrl("SHEETVERSIONING",submittalId);
		if (dprSheetVersioningURL) {
			addParameter(emailParams, "$$dprLink$$", dprSheetVersioningURL);
		} else {
			// if deep link couldn't be generated link to ACA home page
			addParameter(emailParams, "$$dprLink$$", acaUrl);
		}

		var notificationTemplateName = lookup("DPR_NOTIFICATION_TEMPLATES", notificationId);

		if (notificationId.indexOf("STAFF") != -1) {
			addParameter(emailParams, "$$aaRecordLink$$", getAARecordLink());
			var planLinkObj = {};
			planLinkObj.pageId = "SUBMITTALFILES";
			planLinkObj.submittalId = submittalId;
			addParameter(emailParams, "$$planRoomProjectLink$$", getPlanRoomProjectLink(planLinkObj));
		}

		if (conEmail != null && notificationTemplateName != undefined)
		{
			sendNotificationDPR(lookup("DPR_CONFIGS", "NOTIFICATION_FROM_EMAIL"), conEmail, "", notificationTemplateName, emailParams, reportFile);
		}
	}



	// Valid pageId values are: ISSUESLIST, RESUMESUBMITTAL, SHEETVERSIONING, APPROVEDPLANS, CONDITIONSLIST
	// requires acaUrl to be set in the INCLUDES_CUSTOM_GLOBALS script to the base URL for ACA
	function getDprACADeepLinkUrl(pageId) { //optional submittalId, capId

		if (pageId == "RESUMESUBMITTAL" || pageId == "SHEETVERSIONING") {
			if (arguments.length < 2) {
				logDebug("getDprACADeepLinkUrl - missing submittalId");
				return false;
			} else {
				submittalId = arguments[1];
			}
		}

		//optional capId
		var itemCap = capId
		if (arguments.length == 3) {
			itemCap = arguments[2];
		} 

		var acaDprDeepLinkUrl = acaUrl;

		acaDprDeepLinkUrl += "/Customization/";
		acaDprDeepLinkUrl += servProvCode;

		if (pageId == "ISSUESLIST") {
			acaDprDeepLinkUrl += "/Dpr/Component/Issues.aspx?Module=";
		} else if (pageId == "CONDITIONSLIST") {
			acaDprDeepLinkUrl += "/Dpr/Component/Conditions.aspx?Module=";
		} else if (pageId == "UPLOADS") {
			acaDprDeepLinkUrl += "/Dpr/Component/Submittals.aspx?Module=";
		} else if (pageId == "RESUMESUBMITTAL") {
			acaDprDeepLinkUrl += "/Dpr/Component/SubmittalInfo.aspx?Module=";
		} else if (pageId == "SHEETVERSIONING") {
			acaDprDeepLinkUrl += "/Dpr/Component/SubmittalVersioning.aspx?Module=";
		} else if (pageId == "APPROVEDPLANS") {
			acaDprDeepLinkUrl += "/Dpr/Component/ApprovedPlans.aspx?Module=";
		} else {
			logDebug("getDprACADeepLinkUrl - invalid pageId");
			return false;
		}

		acaDprDeepLinkUrl += appTypeArray[0];
		acaDprDeepLinkUrl += "&TabName=";
		acaDprDeepLinkUrl += appTypeArray[0];
		acaDprDeepLinkUrl += "&recordId=";
		acaDprDeepLinkUrl += servProvCode + "-" + itemCap.toString();

		if (pageId == "RESUMESUBMITTAL" || pageId == "SHEETVERSIONING") {
			acaDprDeepLinkUrl += "&submittal=";
			acaDprDeepLinkUrl += submittalId;
		}

		acaDprDeepLinkUrl += "&customId=";
		acaDprDeepLinkUrl += capIDString;

		return acaDprDeepLinkUrl;

	}

	function getAARecordLink() {
		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}

		var aaRecordLink = "";

		aaRecordLink += aaUrl;
		aaRecordLink += "/portlets/cap/capsummary/CapTabSummary.do?mode=tabSummary&serviceProviderCode=";
		aaRecordLink += servProvCode;
		aaRecordLink += "&ID1=" + capId.ID1;
		aaRecordLink += "&ID2=" + capId.ID2;
		aaRecordLink += "&ID3=" + capId.ID3;
		aaRecordLink += "&requireNotice=YES&clearForm=clearForm&module=" + appTypeArray[0];
		aaRecordLink += "&isFromCapList=true&isGeneralCAP=Y";

		return aaRecordLink;

	}

	function getPlanRoomProjectLink(paramObj) { //optional capId
		// paramObj
		// pageId - the page to deep link to
		// submittalId - if linking to a package use the submittal id 


		//optional capId
		var itemCap = capId;
		if (arguments.length > 1) {
			itemCap = arguments[1];
		}

		var dprProjectLink = "";

		dprProjectLink += aaUrl;
		dprProjectLink += "/av-dpr/";
		var qStringParameters = new Array();

		if (paramObj.pageId == "SUBMITTALFILES") {
			dprProjectLink += "submittalFiles.jsp?";
			qStringParameters["submittalId"] = paramObj.submittalId;
		} else {
			dprProjectLink += "summary.jsp?";
		}

		qStringParameters["project"] = capId.getId();
		qStringParameters["customId"] = capId.getCustomID();
		qStringParameters["back"] = "true";

		var ampersand = "";

		for (var i in qStringParameters) {
			dprProjectLink += ampersand + i + "=" + qStringParameters[i];
			ampersand = "&";
		}

		return dprProjectLink;

	}

	function getDprNotificationLinkParams4Notifications(params) {
		// pass in a hashtable and it will add the additional parameters to the table
		
		var bizDomScriptResult = aa.bizDomain.getBizDomain("DPR_NOTIFICATION_LINKS");
		if (bizDomScriptResult.getSuccess()) {
			var bizDomScript = bizDomScriptResult.getOutput();
			for (var i = 0; i < bizDomScript.size(); i++) {
				var sc = bizDomScript.get(i);
				if (sc.getAuditStatus() != "A") {
					continue;
				}
				// get the value and value desc
				var scValue = sc.getBizdomainValue();
				var scValueDesc = sc.getDescription();
				var scValueDescArray = scValueDesc.split("~");

				addParameter(params, scValueDescArray[1], scValueDescArray[0]);			
			}
		}

		return params;
	}

	function getDprNotificationValueParams4Notifications(params) {
		// pass in a hashtable and it will add the additional parameters to the table
		
		// get agency-wide values first
		var agencyValues = lookup("DPR_NOTIFICATION_VALUES","Agency");
		if (agencyValues != undefined) {
			var agencyValuesArray = agencyValues.split("!");
			if (agencyValuesArray.length > 0) {
				for (var av in agencyValuesArray) {
					addParameter(params, agencyValuesArray[av].substr(agencyValuesArray[av].indexOf("~")+1,agencyValuesArray[av].length), agencyValuesArray[av].substr(0,agencyValuesArray[av].indexOf("~")));
				}
			}
		}

		// get agency-wide values first
		var moduleValues = lookup("DPR_NOTIFICATION_VALUES",appTypeArray[0]);
		if (moduleValues != undefined) {
			var moduleValuesArray = moduleValues.split("!");
			if (moduleValuesArray.length > 0) {
				for (var av in moduleValuesArray) {
					addParameter(params, moduleValuesArray[av].substr(moduleValuesArray[av].indexOf("~")+1,moduleValuesArray[av].length), moduleValuesArray[av].substr(0,moduleValuesArray[av].indexOf("~")));
				}
			}
		}

		return params;
	}

/*-----------------------------------------------------------------------------------------------------------------------------/
| Overriding some standard functions within the DPR library under new names so as to not impact existing configuration (START)
| These functions are only called locally within this library
/-----------------------------------------------------------------------------------------------------------------------------*/

	function sendNotificationDPR(emailFrom,emailTo,emailCC,templateName,params,reportFile) {

	    var itemCap = capId;
	    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args

	    var id1 = itemCap.ID1;
	    var id2 = itemCap.ID2;
	    var id3 = itemCap.ID3;

	    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	    var result = null;
	    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	    if(result.getSuccess())
	    {
	        logDebug("Sent email successfully!");
	        return true;
	    } else {
	        logDebug("Failed to send mail. - " + result.getErrorType());
	        return false;
	    }
	}

	function getACARecordURLDpr(acaUrl) { // optional capId

		var itemCap = capId;

		//optional capId
		if (arguments.length == 2) {
			itemCap = arguments[1];
		} 
		var acaRecordUrl = "";
		var id1 = itemCap.ID1;
	 	var id2 = itemCap.ID2;
	 	var id3 = itemCap.ID3;

		var iCap = aa.cap.getCap(itemCap).getOutput();	

	   	acaRecordUrl = acaUrl + "/Cap/CapDetail.aspx?";   
		acaRecordUrl += "&Module=" + iCap.getCapModel().getModuleName();
		acaRecordUrl += "&TabName=" + cap.getCapModel().getModuleName();
		acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
		acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

	   	return acaRecordUrl;
	}

	function getPrimaryContactFullName() { //optional capId

		//optional capId
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}
		var recordContacts = getContactArray(itemCap);
		var fullName = "";
		for (var i in recordContacts) {
			if (recordContacts[i]["peopleModel"].flag == "Y") {
				fullName = recordContacts[i]["fullName"];
				break;
			}
		}

		return fullName;

	}

	function getRecordContactEmailList(primaryOnly) { //optional capId
		//optional capId
		var conEmail = "";
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		var conArray = getContactArray(itemCap);
		for (con in conArray) {
			if (!matches(conArray[con].email, null, undefined, "")) {
				if (primaryOnly) {
					if (conArray[con]["peopleModel"].flag != "Y") {
						continue;
					}	
				}				
				conEmail += conArray[con].email + "; ";
			}
		}

		return conEmail;
	}

	function getRecordProfessionalsEmailList(primaryOnly) { //optional capId
		//optional capId
		var profEmail = ""
		var itemCap = capId;
		if (arguments.length == 2) {
			itemCap = arguments[1];
		}

		// get LP email addresses
		var licenseProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(itemCap);
		var licenseProfList = licenseProfResult.getOutput();
		if(licenseProfList){
			for( var yy in licenseProfList){
			  	if (primaryOnly) {
			  		if (licenseProfList[yy].getPrintFlag() != "Y") {
			  			continue;
			  		}
			  	}
			  	if (licenseProfList[yy].getEmail()) {
				    profEmail += licenseProfList[yy].getEmail() + "; ";
				} 
			} 
		}

		return profEmail
	}

	function getRecordPrimaryAddress() {
		var itemCap = capId;
		if (arguments.length == 1) {
			itemCap = arguments[0];
		}		

		var ad = aa.address.getAddressByCapId(itemCap).getOutput();
		var propertyAddress = "";

		if (ad.length > 0) {
			for(x in ad) {
				if (ad[x].getPrimaryFlag() == "Y") {
					if(ad[x].getHouseNumberStart() != null) propertyAddress += ad[x].getHouseNumberStart();
					if(ad[x].getStreetName() != null) propertyAddress += " " + ad[x].getStreetName();
					if(ad[x].getStreetSuffix() != null) propertyAddress += " "  + ad[x].getStreetSuffix();
					if(ad[x].getStreetDirection() != null) propertyAddress += " " + ad[x].getStreetDirection();
					}
			}
		}

		return propertyAddress;
	}

/*---------------------------------------------------------------------------------------------------------------------------/
| Overriding some standard functions within the DPR library under new names so as to not impact existing configuration (END)
/---------------------------------------------------------------------------------------------------------------------------*/

	this.getProjects = getProjects;
	this.createProject = createProject;
	this.updateProject = updateProject;
	this.updateProjectStatus = updateProjectStatus;
	this.updateProjectName = updateProjectName;
	this.approveProject = approveProject;
	this.getProjectGroupTypeConfig = getProjectGroupTypeConfig;
	this.getProjectGroups = getProjectGroups;
	this.getProjectGroup = getProjectGroup;
	this.getProjectGroupItems = getProjectGroupItems;
	this.createProjectGroup = createProjectGroup;
	this.createProjectGroupItems = createProjectGroupItems;
	this.deleteProjectFromAllGroups = deleteProjectFromAllGroups;
	this.addProject2ParentGroup = addProject2ParentGroup;
	this.getPrintSets = getPrintSets;
	this.createPrintSet = createPrintSet;
	this.deletePrintSet = deletePrintSet;
	this.createProjectPlusSubmittal = createProjectPlusSubmittal;
	this.createSubmittalPackage = createSubmittalPackage;
	this.publishIssuesByDiscipline = publishIssuesByDiscipline;
	this.publishIssues = publishIssues;
	this.publishConditions = publishConditions;
	this.getProjectSubmittal = getProjectSubmittal;
	this.getProjectSubmittals = getProjectSubmittals;
	this.getLatestProjectSubmittal = getLatestProjectSubmittal;
	this.updateLatestProjectSubmittalStatus = updateLatestProjectSubmittalStatus;
	this.getPackageSheetCount = getPackageSheetCount;
	this.reOrderProjectSheets = reOrderProjectSheets;
	this.acceptReviewPackages = acceptReviewPackages;
	this.updateSubmittalName = updateSubmittalName;
	this.getDisciplineByWorkflowTask = getDisciplineByWorkflowTask;
	this.isOpenIssues = isOpenIssues;
	this.isOpenConditions = isOpenConditions;
	this.getOpenIssueDisciplines = getOpenIssueDisciplines;
	this.getOpenIssuesCount4Notification = getOpenIssuesCount4Notification;
	this.getOpenConditionsCount4Notification = getOpenConditionsCount4Notification;
	this.getFileInfo = getFileInfo;
	this.isOpenReviewPackages = isOpenReviewPackages;
	this.cleanUpEmptyReviewPackages = cleanUpEmptyReviewPackages;
	this.dprProjectExists = dprProjectExists;
	this.getDprNotificationLinkParams4Notifications = getDprNotificationLinkParams4Notifications;
	this.getDprACADeepLinkUrl = getDprACADeepLinkUrl;
	this.sendDprEmailNotification = sendDprEmailNotification;
	this.handleDprAlert = handleDprAlert;
	this.handleDprRequest = handleDprRequest;
	this.handleDprException = handleDprException;
	this.sendFileProcessingCompleteNotification = sendFileProcessingCompleteNotification;
	this.deleteProjectStamps = deleteProjectStamps;
	this.getIssues = getIssues;
	this.getConditions = getConditions;
	this.isAllSheetsStamped = isAllSheetsStamped;
	this.endpoint = endpoint;
}
Dpr.define();
