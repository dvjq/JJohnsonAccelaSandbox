function dateAddWCalendar(td, amt) {
	var cal = arguments[2];
	var dDate = new Date();
	if (td) {
		dDate = convertDate(td);
	}
	
	var days = arguments[3] == "BEFORE" ? -1 : 1;

	dDate.setDate(dDate.getDate() + parseInt(amt, 10));
	if (cal) {
		while (isDateOnCalendar(dDate, cal)) {
			dDate.setDate(dDate.getDate() + parseInt(days, 10));
		}
	}

	return dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

/*
 * Checks specified calendar for an event on the specified date
 * Returns true if there is an event, else false
 * date - javascript date object
 */
function isDateOnCalendar(date, cal) {
	var calendarId = aa.db.select("select CALENDAR_ID from CALENDAR WHERE CALENDAR_NAME ='" + cal + "' AND  REC_STATUS='A' and SERV_PROV_CODE = '" + aa.getServiceProviderCode() + "'", null).getOutput();
	if (calendarId && !calendarId.empty) {
		calendarId = calendarId.get(0).get("CALENDAR_ID");
		if (calendarId) {
			var events = aa.calendar.getEventSeriesByCalendarID(calendarId, date.getYear() + 1900, date.getMonth() + 1).getOutput();

			for (var e in events) {
				var event = events[e];
				var startDate = new Date(event.getStartDate().getTime());
				var endDate = new Date(event.getEndDate().getTime());
				if (date >= startDate && date <= endDate) {
					return true;
				}
			}
		}
	}
	return false;
}