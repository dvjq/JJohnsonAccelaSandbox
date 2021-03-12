if (appMatch('RentalHousing/Registration/Application/NA')) {
	closeTask("Intake", "Accepted", "", "");
	closeTask("Review", "Approved", "", "");
        updateAppStatus("Active", "");
}