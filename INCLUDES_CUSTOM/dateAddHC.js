function dateAddHC(td, amt)
// perform date arithmetic on a string; uses the agency holiday calendar to test for business days
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{
	var dDateHC = null; 
	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDateHC = new Date();
	else
		logDebug("trying to convert date...");
		dDateHC = convertDate(td);
	logDebug("date: " + dDateHC);
	var i = 0;
	var failsafe = 0;
	if (useWorking){
		while (i < Math.abs(amt) && failsafe < 200) {
			if (amt > 0) {
				if (!checkHolidayCalendar(convertDate(dateAdd(dDateHC,1)))){
					logDebug(dDateHC);
					i++;
					failsafe++;
				}
				else {
					failsafe++;
				}				
			}
		}
	}
	else{
		dDateHC.setDate(dDateHC.getDate() + parseInt(amt, 10));
	}
	return (dDateHC.getMonth() + 1) + "/" + dDateHC.getDate() + "/" + dDateHC.getFullYear();
}

/*
* Checks all agency holiday calendars for an event on the specified date
* Returns true if there is an event, else false
* date - javascript date object
*/
function checkHolidayCalendar(date){
	try{
	//check if this is a weekend and return true if yes
	var dayOfWeek = date.getDay();
 	if (dayOfWeek == 0 || dayOfWeek == 6) return true;
 	//now check the calendar
	var holiday = false;
	var calArr = new Array();
	var agency = aa.getServiceProviderCode();
	//get the holiday calendars
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();
	var selectString = "select * from CALENDAR WHERE SERV_PROV_CODE = ? AND CALENDAR_TYPE='AGENCY HOLIDAY' AND  REC_STATUS='A'";
	var sStmt = conn.prepareStatement(selectString);
	sStmt.setString(1, agency);
	var rSet = sStmt.executeQuery();
	while (rSet.next()) {
		calArr.push(rSet.getString("CALENDAR_ID"));
	}
	sStmt.close();
	conn.close(); 
	for (var c in calArr){
		var cal = aa.calendar.getCalendar(calArr[c]).getOutput();
		var events = aa.calendar.getEventSeriesByCalendarID(calArr[c], date.getYear()+1900, date.getMonth()+1).getOutput();
		for (var e in events){
			var event = events[e];
			var startDate = new Date(event.getStartDate().getTime());
			var startTime = event.getStartTime();
			var endDate = event.getEndDate();
			var allDay = event.isAllDayEvent();
			var duration = event.getEventDuration();
			if (dateDiff(startDate,date) >= 0  && dateDiff(startDate,date) < 1){
				holiday = true;
			}
		}
	}
	return holiday;
	}
	catch(r){aa.print(r);}
}