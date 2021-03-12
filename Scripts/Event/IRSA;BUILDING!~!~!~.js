if(matches(currentUserID,"CCOOPER")){
  showMessage = true; 
  showDebug = true;
}

if (inspType == 'Progress Check' && inspResult == 'Passed') {
	scheduleInspection('Progress Check', 365, 'AIRKULLA');
}

