/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM_GLOBALS.js
| Event   : N/A
|
| Usage   : Accela Custom Includes.  Required for all Custom Parameters
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Custom Parameters
|	Ifchanges are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
acaUrl = "https://acastd.accela.com/standarddemo/";
aaUrl = "https://avstd.accela.com";

//if (currentUserID == "DPRUSER") showDebug=true;

var ENVIRON = "STANDARDDEMO";
/*------------------------------------------------------------------------------------------------------/
| END Custom Parameters
/------------------------------------------------------------------------------------------------------*/

function parcelConditionExistsASB(condtype) {
var pcResult = aa.parcelCondition.getParcelConditions(ParcelValidatedNumber);
if (!pcResult.getSuccess()) {
logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage());
return false;
}
var pcs = pcResult.getOutput();
for (var pc1 in pcs) {
if (pcs[pc1].getConditionType().equals(condtype)) {
return true;
}
}
}

function sumASITColumn(tObj, cNameToSum) {
	// optional params = cFilterType, cNameFilter, cValueFilter
	var retValue = 0;
	if (tObj) {
		if (arguments.length == 2) { // no filters
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cNameToSum].fieldValue;
				if (!isNaN(parseFloat(colValue))) 
					retValue += parseFloat(colValue);
			}
			return retValue;
		}
		if (arguments.length == 5) {
			filterType = arguments[2];
			cNameFilter = arguments[3];
			cValueFilter = arguments[4];
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cNameToSum].fieldValue;
				var colFilter = row[cNameFilter].fieldValue;
				if (filterType == "INCLUDE") {
					if (colFilter == cValueFilter) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
				if (filterType == "EXCLUDE") {
					if (colFilter != cValueFilter) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
			}
		}
	}
	return retValue;
}