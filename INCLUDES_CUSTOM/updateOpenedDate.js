/*
* Mike Linscheid
* Sets the Open Date (File Date) on a record. Defaults to setting the Open Date on the current record to Today.
*
* Optional Param 1: Javascript Date - Specify the date to set as the Open Date (pass null to only use 2nd param)
* Optional Param 2: CapId Object - Specify what record to updateFileDateToToday
*/
function updateOpenedDate() {	
	var today = new Date()
	var thisCap = cap
	if (arguments.length == 1) today = arguments[0]
	if (arguments.length == 2) {
		if (arguments[0]) today = arguments[0]
		var thisCapObj = null
		
		try{
			thisCapObj = aa.cap.getCap(arguments[1])
			if (!thisCapObj.getSuccess()){
				logDebug("Error - Could not find the record " + arguments[1] +": " + thisCapObj.getErrorMessage())
				return
			}
		} catch(err){
			logDebug("Error - Could not find the record " + arguments[1])
			return
		}
		thisCap = thisCapObj.getOutput()
	}
	
	var fDate =  thisCap.getFileDate()
	fDate.setYear(today.getFullYear())
	fDate.setMonth(today.getMonth())
	fDate.setDayOfMonth(today.getDate())
	thisCap.setFileDate(fDate)

	makeUpdate = aa.cap.editCapByPK(thisCap.getCapModel())
	if (!makeUpdate.getSuccess()) 
		logDebug("Error Updating the Opened date: " + makeUpdate.getErrorMessage())
	else
		logDebug("Successfully updated the Opened Date to " + jsDateToASIDate(today))
}