function getFiscalYear() {  //optional date string, optional start month for different cycle types
	var today = arguments.length >= 1 ? new Date(arguments[0]) : new Date(); 
	var yearType = arguments.length == 2 ? arguments[1] : "START_MONTH";
	var curMonth = today.getMonth();
	var fiscalYr = "";

    var checkMonth = +lookup("FISCAL_YEAR",yearType)-1;

	if (curMonth >= checkMonth) { //
		fiscalYr = (today.getFullYear() + 1).toString();
	} else {
		fiscalYr = today.getFullYear().toString();
	}

	return fiscalYr;
}