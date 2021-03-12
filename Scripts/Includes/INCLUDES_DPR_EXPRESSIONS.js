/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_DPR_EXPRESSIONS.js
| Event   : N/A
|
| Usage   : Library of functions that will return true/false for expressions called by the Digital Plan Room.
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/

Dpr.Expressions.jobvalue = function (paramsObj) {
	
	return (estValue >= 75000) ? true : false;

}