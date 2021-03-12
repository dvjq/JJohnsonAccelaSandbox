/*===========================================

Title : INCLUDES_EXPRESSIONS

Functional Area : Accela Product Management and Delivery Solutions

Description : This INCLUDES script contains utility functions to support advanced expression developement

=========================================== */

function getMessageStyle() {
	var cssStyle = "<style>.infoMsg, .successMsg, .warningMsg, .errorMsg, .validationMsg {	\
		margin: 10px 0px; \
		padding:12px;	\
	}	\
	.infoMsg {	\
		color: #00529B;	\
		background-color: #BDE5F8;	\
	}	\
	.successMsg {	\
		color: #4F8A10;	\
		background-color: #DFF2BF;	\
	}	\
	.warningMsg {	\
		color: #9F6000;	\
		background-color: #FEEFB3;	\
	}	\
	.errorMsg {	\
		color: #D8000C;	\
		background-color: #FFBABA;	\
	}	\
	.infoMsg i, .successMsg i, .warningMsg i, .errorMsg i {	\
    margin:10px 22px;	\
    font-size:2em;	\
    vertical-align:middle;	\
	}</style>";
	return cssStyle;
}

function logDebug(dstr) {
	var vLevel = "info";
	if (arguments.length == 2) {
		vLevel = arguments[1]; // debug level
	}
	var levelCSS = "infoMsg";
	if (vLevel.toUpperCase() == "INFO") levelCSS = "infoMsg";
	if (vLevel.toUpperCase() == "SUCCESS") levelCSS = "successMsg";
	if (vLevel.toUpperCase() == "WARNING") levelCSS = "warningMsg";
	if (vLevel.toUpperCase() == "ERROR") levelCSS = "errorMsg";
	var msgFormatted = '<div class="' + levelCSS + '">' + dstr + "</div>";
	debug += msgFormatted;
}

function notice(dstr) {
	var vLevel = "info";
	if (arguments.length == 2) {
		vLevel = arguments[1];
	}
	var levelCSS = "infoMsg";
	if (vLevel.toUpperCase() == "INFO") levelCSS = "infoMsg";
	if (vLevel.toUpperCase() == "SUCCESS") levelCSS = "successMsg";
	if (vLevel.toUpperCase() == "WARNING") levelCSS = "warningMsg";
	if (vLevel.toUpperCase() == "ERROR") levelCSS = "errorMsg";
	var msgFormatted = getMessageStyle();
	msgFormatted += '<div class="' + levelCSS + '">' + dstr + "</div>";

	return msgFormatted;
}

function lookup(stdChoice, stdValue) {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	} else {
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
	}
	return strControl;
}

function exploreObject(objExplore) {
	logDebug("Methods:");
	for (x in objExplore) {
		if (typeof objExplore[x] == "function") {
			logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
			logDebug("   " + objExplore[x] + "<br>");
		}
	}

	logDebug("");
	logDebug("Properties:");
	for (x in objExplore) {
		if (typeof objExplore[x] != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
	}
}

function exploreObjectInExpression(objExplore) {
	expression.addMessage("Methods:\n");
	for (var x in objExplore) {
		if (typeof objExplore[x] == "function") expression.addMessage("    " + x + "\n");
	}

	expression.addMessage("\n");
	expression.addMessage("Properties:\n");
	for (var y in objExplore) {
		if (typeof objExplore[y] != "function") expression.addMessage("    " + y + " = " + objExplore[y] + "\n");
	}
}

function masterExpression(script, portlet) {
	var msg = "";
	var message = "";
	var debug = "";
	var showDebug = false;
	var showMessage = false;
	var br = "<BR>";
	var useAppSpecificGroupName = false;
	var useProductScripts = true;
	var SCRIPT_VERSION = "3.2.2";
	var servProvCode = expression.getValue("$$servProvCode$$").value;
	var expressionName = expression.getExpressionName();

	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", servProvCode, true));
	eval(getScriptText("INCLUDES_CUSTOM", servProvCode, true));

	var returnMessage = "";

	var toPrecision = function (value) {
		var multiplier = 10000;
		return Math.round(value * multiplier) / multiplier;
	};

	function addDate(iDate, nDays) {
		if (isNaN(nDays)) {
			throw "Day is a invalid number!";
		}
		return expression.addDate(iDate, parseInt(nDays));
	}

	function diffDate(iDate1, iDate2) {
		return expression.diffDate(iDate1, iDate2);
	}

	function parseDate(dateString) {
		return expression.parseDate(dateString);
	}

	function formatDate(dateString, pattern) {
		if (dateString == null || dateString == "") {
			return "";
		}
		return expression.formatDate(dateString, pattern);
	}

	var scriptCode = getScriptText(script, servProvCode, false);

	try {
		var cId1 = expression.getValue("$$capID1$$").value;
		var cId2 = expression.getValue("$$capID2$$").value;
		var cId3 = expression.getValue("$$capID3$$").value;

		var capId = aa.cap.getCapID(cId1, cId2, cId3);

		if (capId.getOutput()) {
			capId = capId.getOutput();
			var cap = aa.cap.getCap(capId).getOutput();

			var appTypeResult = cap.getCapType();
			var appTypeAlias = appTypeResult.getAlias();
			var appTypeString = appTypeResult.toString();
			var appTypeArray = appTypeString.split("/");

			var totalRowCount = expression.getTotalRowCount();

			//set variables
			var AInfo = [];
			loadAppSpecific(AInfo);
			loadASITables();

			CAPactualProdUnits = expression.getValue("CAP::capDetailModel*actualProdUnits");
			CAPaltId = expression.getValue("CAP::capModel*altID");
			CAPanonymousFlag = expression.getValue("CAP::capDetailModel*anonymousFlag");

			switch (portlet) {
				//Custom Fields and Custom Lists
				case "Custom Fields" || "Custom Lists":
					var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
					var form = expression.getValue("ASI::FORM");

					if (appSpecInfoResult.getSuccess()) {
						appSpecInfoResult = appSpecInfoResult.getOutput();

						for (var b in appSpecInfoResult) {
							var groupName = String(appSpecInfoResult[b].getCheckboxType()).replace(/[^a-zA-Z0-9]+/g, "").toUpperCase();
							var varName = String(appSpecInfoResult[b].getCheckboxDesc())
								.replace(/[^a-zA-Z0-9]+/g, "")
								.toLowerCase();
							var fullName = groupName + varName;
							var currentField = expression.getValue("ASI::" + appSpecInfoResult[b].getCheckboxType() + "::" + appSpecInfoResult[b].getCheckboxDesc());
							var varString = "" + fullName + " = currentField;";
							expression.addMessage("adding : " + varString);
							eval(varString);
							expression.addMessage("added");
						}
					}
					break;
			}
		}

		expression.addMessage(String(scriptCode).substr(0, 30));
		if (scriptCode != "") {
			expression.addMessage("GO");
			eval(scriptCode);
		} else {
			expression.addMessage("**WARNING** No script by the name of " + script + " can be found in the system.  Check the configuration of the expression called " + expressionName + "!");
		}
	} catch (e) {
		expression.addMessage("Error in expression: " + expressionName + "| Message: " + e.message + "| Line: " + e.lineNumber);
	}
}
