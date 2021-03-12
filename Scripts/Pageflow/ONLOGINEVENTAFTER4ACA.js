// set env values for script test
//awilliams in avstd
//aa.env.setValue("CurrentUserID","PUBLICUSER142"); //awilliams in avstd
//aa.env.setValue("Username","142");

//dpatterson in cloud03
//aa.env.setValue("CurrentUserID","PUBLICUSER3717");
//aa.env.setValue("Username","3717");

//mhopkins
//aa.env.setValue("CurrentUserID","PUBLICUSER462");
//aa.env.setValue("Username","462");

var GET_RECORDS_BY = "CONTACT"; // other options: "LICENSES" & "CONTACT"
var startTime = new Date().getTime();
logDebug("Start Dashboard: " + startTime);

var contactRefNumber = "";
var dataset = "";
var servProvCode = aa.getServiceProviderCode();


var thisUserSeqNum = String(aa.env.getValue("Username")).trim(); 
var currentUserId = aa.env.getValue("CurrentUserID");
var showDebug = true;
var debug = "";
var br = "<br>";

logDebug("thisUserSeqNum: " + thisUserSeqNum);
logDebug("currentUserId: " + currentUserId);
logDebug("GET_RECORDS_BY: " + GET_RECORDS_BY);



//set env params for script test


try {

    var aadba = aa.proxyInvoker.newInstance("com.accela.aa.datautil.AADBAccessor").getOutput();
    var aadba = aadba.getInstance();
    var userSessionId;

    var thisDataSet = getPublicUserDataset(thisUserSeqNum);

    dataset = encodeURI(thisDataSet);
    dataset = dataset.replaceAll("'", "%27");
    dataset = dataset.replaceAll('"', "%22");

    serviceHTML = "";

    myHTML = serviceHTML;
    myHTML += "<style></style><div class='dashboard_container'>"

    myHTML += "</div>"; // Container
    myHTML += "<img src='App_Themes/Default/assets/spacer.gif' onload='loadDashboard(\"" + userSessionId + "\",\"" + encodeURI((aa.env.getValue('Username') * 1)) + "\",\"" + aa.env.getValue('Language') + "\",\"" + encodeURI(aa.env.getValue('CurrentUserID')) + "\",\"" + dataset + "\")'>";
    var endTime = new Date().getTime();
    logDebug("End Dashboard: " + endTime);
    logDebug("Execution Time: " + endTime - startTime)
    // RETURN RESULT TO PAGE
    aa.env.setValue("ReturnCode", "0");
    aa.env.setValue("ReturnMessage", myHTML);

} catch(e) {
    logDebug("**ERROR Getting Public User Dataset");
    logDebug(e);
}

// end user code
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);




function getPublicUserDataset(theUserSeqNum) {


    if (theUserSeqNum != "") {
        //UserSeqNum = String(theUserSeqNum).replace(/\D/g, '');
        UserSeqNum = parseFloat(theUserSeqNum);
        if (isNaN(UserSeqNum)) {} else {

            Object.defineProperty(String.prototype, 'replaceAll', {
                enumerable: false,
                value: function (find, replace) {
                    var theString = String(this);
                    if (theString) {
                        return theString.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace);
                    } else {
                        return theString;
                    }
                }
            });

            userLics = aa.licenseScript.getRefLicProfByOnlineUser(UserSeqNum).getOutput();

            var licenses = new Array();
            var licensesArray = new Array();
            var licenseFound = false;
            if (userLics) {
                for (var i in userLics) {
                    licModel = userLics[i];
                    licNumber = licModel.getStateLicense();
                    licType = licModel.getLicenseType();
                    licenses.push("'" + licNumber + "'");
                    licensesArray.push(String(licNumber).trim());
                    licenseFound = true;
                    logDebug("License found for user:", licNumber);
                }
            }

            logDebug("===Number of Licenses for : " + UserSeqNum + " ==> " + licensesArray.length);

            //******************************** GET RECORDS BY LICENSE *************************************//

            if (licenseFound && GET_RECORDS_BY == "LICENSES") {
                var sql = "SELECT DISTINCT " +
                    "ar.R1_APP_TYPE_ALIAS ARABIC_ALIAS, st_ar.STATUS ARABIC_STATUS, " +
                    "PER.B1_PER_ID1|| '-' || PER.B1_PER_ID2 || '-' || PER.B1_PER_ID3 RECORD_ID, " +
                    "per.B1_ALT_ID ALT_ID, " +
                    "DET.B1_SHORT_NOTES As PROFILE_NAME, " +
                    "per.B1_PER_GROUP || '/' || per.B1_PER_TYPE || '/' || PER.B1_PER_SUB_TYPE || '/' || PER.B1_PER_CATEGORY Record_Type, " +
                    "PER.B1_PER_GROUP GROUP, " +
                    "PER.B1_PER_TYPE TYPE, " +
                    "PER.B1_PER_SUB_TYPE SUB_TYPE, " +
                    "PER.B1_PER_CATEGORY CATEGORY, " +
                    "PER.B1_APP_TYPE_ALIAS RECORD_TYPE_ALIAS, " +
                    "per.B1_APPL_STATUS Status, " +
                    "cast (per.B1_APPL_STATUS_DATE as date) Status_Date , " +
                    "cast (per.B1_FILE_DD as date) Opened_Date , " +
                    "per.B1_APPL_CLASS CLASS, " +
                    "det.BALANCE, " +
                    " det.B1_APPL_SUB_STATUS SUB_STATUS, " +
                    " PER.SERV_PROV_CODE, " +
                    " PER.B1_CREATED_BY CREATED_BY, " +
                    " BIZ2.B1_LICENSE_NBR," +
                    " BIZ2.B1_LICENSE_TYPE, " +
                    " BIZ2.REC_STATUS LICENSE_STATUS, " +
                    " PAR.B1_PER_ID1 || '-' || PAR.B1_PER_ID2 || '-' || PAR.B1_PER_ID3 PARENT_RECORD_ID, 	" +
                    " PAR.B1_ALT_ID PARENT_ID, par.b1_per_category PARENT_TYPE ,	" +
                    "cast (EXP.EXPIRATION_DATE as date) EXP_DATE, " +
                    "ADDR.B1_HSE_NBR_START || ' ' || ADDR.B1_STR_NAME || ' ' || ADDR.B1_SITUS_CITY || ', ' || B1_SITUS_STATE || '  ' || B1_SITUS_ZIP AS FULL_ADDRESS " +


                    " FROM B3CONTRA Biz" +
                    " INNER JOIN B1PERMIT PER" +
                    " ON 	Biz.SERV_PROV_CODE    = PER.SERV_PROV_CODE " +
                    " AND Biz.B1_PER_ID1        = PER.B1_PER_ID1 " +
                    " AND Biz.B1_PER_ID2        = PER.B1_PER_ID2 " +
                    " AND Biz.B1_PER_ID3        = PER.B1_PER_ID3 " +

                    " LEFT JOIN B3ADDRES ADDR " +
                    " ON ADDR.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    " AND ADDR.B1_PER_ID1   =PER.B1_PER_ID1 " +
                    " AND ADDR.B1_PER_ID2   =PER.B1_PER_ID2 " +
                    " AND ADDR.B1_PER_ID3   =PER.B1_PER_ID3 " +
                    " AND ADDR.B1_PRIMARY_ADDR_FLG = 'Y' " +

                    "  LEFT JOIN b3contra Biz2 " +
                    "  ON Biz2.serv_prov_code = PER.serv_prov_code  " +
                    "	  AND Biz2.b1_per_id1 = PER.b1_per_id1  " +
                    "	  AND Biz2.b1_per_id2 = PER.b1_per_id2 " +
                    "	  AND Biz2.b1_per_id3 = PER.b1_per_id3 " +
                    //"	  AND (Biz2.b1_license_type = 'Professional' OR Biz2.b1_license_type = 'Facility' OR Biz2.b1_license_type = 'CME LP') " + 

                    " LEFT JOIN BPERMIT_DETAIL DET  " +
                    "ON   DET.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  DET.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  DET.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  DET.B1_PER_ID3     =PER.B1_PER_ID3 " +
                    /*
                    " LEFT JOIN B3CONTACT B" + 
                    " ON  PER.SERV_PROV_CODE=B.SERV_PROV_CODE " + 
                    " AND PER.B1_PER_ID1    =B.B1_PER_ID1 " + 
                    " AND PER.B1_PER_ID2    =B.B1_PER_ID2 " + 
                    " AND PER.B1_PER_ID3    =B.B1_PER_ID3 " + 
                    " AND PER.REC_STATUS='A'  " + 
                    */

                    " LEFT JOIN XAPP2REF X " +
                    " ON  X.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    " AND X.B1_PER_ID1    =PER.B1_PER_ID1 " +
                    " AND X.B1_PER_ID2    =PER.B1_PER_ID2 " +
                    " AND X.B1_PER_ID3    =PER.B1_PER_ID3 " +
                    " AND PER.REC_STATUS  ='A'  " +
                    " AND X.REC_STATUS='A'  " +
                    " AND X.B1_STATUS IS NOT NULL " +

                    " LEFT JOIN B1PERMIT PAR " +
                    " ON   PAR.SERV_PROV_CODE=X.SERV_PROV_CODE " +
                    " AND  PAR.B1_PER_ID1  =X.B1_MASTER_ID1 " +
                    " AND  PAR.B1_PER_ID2  =X.B1_MASTER_ID2 " +
                    " AND  PAR.B1_PER_ID3  =X.B1_MASTER_ID3 " +
                    " AND  PAR.REC_STATUS='A'  " +

                    " LEFT JOIN R3APPTYP app " +
                    " on app.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                    " and app.R1_PER_GROUP=per.B1_PER_GROUP " +
                    " and app.R1_PER_TYPE=per.B1_PER_TYPE " +
                    " and app.R1_PER_SUB_TYPE=per.B1_PER_SUB_TYPE " +
                    " and app.R1_PER_CATEGORY=per.B1_PER_CATEGORY " +

                    " LEFT JOIN R3APPTYP_I18N ar " +
                    " on ar.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    " and ar.LANG_ID='ar_AE' " +
                    " and ar.RES_ID=app.RES_ID " +

                    " LEFT JOIN APP_STATUS_GROUP ST " +
                    " ON ST.APP_STATUS_GROUP_CODE=APP.APP_STATUS_GROUP_CODE " +
                    " AND ST.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                    " AND ST.STATUS=per.B1_APPL_STATUS " +

                    " LEFT JOIN APP_STATUS_GROUP_I18N ST_AR " +
                    " ON ST_AR.SERV_PROV_CODE=ST.SERV_PROV_CODE " +
                    " AND ST_AR.RES_ID=ST.RES_ID " +
                    " AND ST_AR.LANG_ID='ar_AE' " +

                    "LEFT JOIN B1_EXPIRATION EXP  " +
                    "ON   EXP.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  EXP.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  EXP.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  EXP.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    " WHERE " +
                    " Biz.B1_LICENSE_NBR IN (" + licenses.toString() + ")	" +
                    " AND Biz.SERV_PROV_CODE='" + servProvCode + "' " +
                    " AND   PER.REC_STATUS='A' " +
                    " AND   PER.REC_STATUS='A' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE CAP' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE TMP' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE EST' " +
                    " ORDER BY per.B1_APPL_STATUS_DATE DESC  ";

            } else if (GET_RECORDS_BY == "PUBLICUSER" || GET_RECORDS_BY == "LICENSES") {
                //******************************** GET RECORDS BY PUBLICUSER *************************************//
                var sql = "SELECT " +
                    "ar.R1_APP_TYPE_ALIAS ARABIC_ALIAS,st_ar.STATUS ARABIC_STATUS, " +
                    "PER.B1_PER_ID1 || '-' || PER.B1_PER_ID2 || '-' || PER.B1_PER_ID3 RECORD_ID, " +
                    "PAR.B1_PER_ID1 || '-' || PAR.B1_PER_ID2 || '-' || PAR.B1_PER_ID3 PARENT_RECORD_ID, " +
                    "PAR.B1_ALT_ID PARENT_ID, par.b1_per_category PARENT_TYPE, " +
                    " per.B1_ALT_ID ALT_ID, " +
                    "DET.B1_SHORT_NOTES Short_Notes, " +
                    "per.B1_PER_GROUP || '/' || per.B1_PER_TYPE || '/' || PER.B1_PER_SUB_TYPE || '/' || PER.B1_PER_CATEGORY Record_Type, " +
                    "PER.B1_PER_CATEGORY CATEGORY, " +
                    "PER.B1_APP_TYPE_ALIAS RECORD_TYPE_ALIAS, " +
                    "per.B1_APPL_STATUS Status , " +
                    "cast (per.B1_APPL_STATUS_DATE as date) Status_Date , " +
                    "cast (per.B1_FILE_DD as date) Opened_Date , " +
                    "det.B1_PRIORITY PRIORITY, " +
                    "per.B1_APPL_CLASS CLASS, " +
                    "det.BALANCE, " +
                    " det.B1_APPL_SUB_STATUS SUB_STATUS, " +
                    "PER.SERV_PROV_CODE ," +
                    "cast (EXP.EXPIRATION_DATE as date) EXP_DATE, " +
                    "ADDR.B1_HSE_NBR_START || ' ' || ADDR.B1_STR_NAME || ' ' || ADDR.B1_SITUS_CITY || ', ' || B1_SITUS_STATE || '  ' || B1_SITUS_ZIP AS FULL_ADDRESS " +


                    "FROM B1PERMIT PER " +
                    "LEFT JOIN XAPP2REF X " +
                    "ON  X.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    "AND X.B1_PER_ID1    =PER.B1_PER_ID1 " +
                    "AND X.B1_PER_ID2    =PER.B1_PER_ID2 " +
                    "AND X.B1_PER_ID3    =PER.B1_PER_ID3 " +
                    "AND PER.REC_STATUS  ='A' " +
                    "AND X.REC_STATUS='A' " +
                    "AND X.B1_STATUS IS NOT NULL " +

                    " LEFT JOIN B3ADDRES ADDR " +
                    " ON ADDR.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    " AND ADDR.B1_PER_ID1   =PER.B1_PER_ID1 " +
                    " AND ADDR.B1_PER_ID2   =PER.B1_PER_ID2 " +
                    " AND ADDR.B1_PER_ID3   =PER.B1_PER_ID3 " +
                    " AND ADDR.B1_PRIMARY_ADDR_FLG = 'Y' " +

                    "LEFT JOIN B1PERMIT PAR " +
                    "ON   PAR.SERV_PROV_CODE=X.SERV_PROV_CODE " +
                    "AND  PAR.B1_PER_ID1  =X.B1_MASTER_ID1 " +
                    "AND  PAR.B1_PER_ID2  =X.B1_MASTER_ID2 " +
                    "AND  PAR.B1_PER_ID3  =X.B1_MASTER_ID3 " +
                    "AND  PAR.REC_STATUS='A' " +

                    "LEFT JOIN BPERMIT_DETAIL DET  " +
                    "ON   DET.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  DET.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  DET.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  DET.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "LEFT join R3APPTYP app " +
                    "on app.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                    "and app.R1_PER_GROUP=per.B1_PER_GROUP " +
                    "and app.R1_PER_TYPE=per.B1_PER_TYPE " +
                    "and app.R1_PER_SUB_TYPE=per.B1_PER_SUB_TYPE " +
                    "and app.R1_PER_CATEGORY=per.B1_PER_CATEGORY " +

                    "left join R3APPTYP_I18N ar " +
                    "on ar.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "and ar.LANG_ID='ar_AE' " +
                    "and ar.RES_ID=app.RES_ID " +

                    "LEFT JOIN APP_STATUS_GROUP ST " +
                    "ON ST.APP_STATUS_GROUP_CODE=APP.APP_STATUS_GROUP_CODE " +
                    "AND ST.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "AND ST.STATUS=per.B1_APPL_STATUS " +

                    "left JOIN APP_STATUS_GROUP_I18N ST_AR " +
                    "ON ST_AR.SERV_PROV_CODE=ST.SERV_PROV_CODE " +
                    "AND ST_AR.RES_ID=ST.RES_ID " +
                    "AND ST_AR.LANG_ID='ar_AE' " +

                    "LEFT JOIN B1_EXPIRATION EXP  " +
                    "ON   EXP.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  EXP.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  EXP.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  EXP.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "WHERE per.SERV_PROV_CODE='" + servProvCode + "' " +
                    " AND   per.B1_CREATED_BY='" + currentUserId + "' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE CAP' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE TMP' " +
                    " AND   PER.B1_APPL_CLASS <> 'INCOMPLETE EST' " +
                    " ORDER BY per.B1_APPL_STATUS_DATE DESC  ";

            } else {
                //******************************** GET RECORDS BY CONTACT *************************************
                // Get contactRefNumber
                userModel = aa.publicUser.getPublicUser(UserSeqNum).getOutput();
                puSeq = userModel.getUserSeqNum();
                var publicUserIDList = aa.util.newArrayList();
                publicUserIDList.add(puSeq);
                // Get Public User Related Contacts
                var contractorBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
                var contractorPeopleModelList = contractorBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), publicUserIDList);
                if (contractorPeopleModelList != null && contractorPeopleModelList.size() > 0) {
                    var peopleModel = contractorPeopleModelList.get(0);
                    var contactRefNumber = peopleModel.getContactSeqNumber();
                }

                // contact SQL
                var sql = "SELECT " +
                    "ar.R1_APP_TYPE_ALIAS ARABIC_ALIAS,st_ar.STATUS ARABIC_STATUS, " +
                    "PER.B1_PER_ID1 || '-' || PER.B1_PER_ID2 || '-' || PER.B1_PER_ID3 RECORD_ID, " +
                    //"IDCH.G1_ASSET_NAME ASSET_NAME , " + 
                    //"ID.G1_ASSET_NAME PARENT_ASSET_NAME, " + 
                    "PAR.B1_PER_ID1 || '-' || PAR.B1_PER_ID2 || '-' || PAR.B1_PER_ID3 PARENT_RECORD_ID, " +
                    "PAR.B1_ALT_ID PARENT_ID, par.b1_per_category PARENT_TYPE, " +
                    " per.B1_ALT_ID ALT_ID, " +
                    "DET.B1_SHORT_NOTES Short_Notes, " +
                    "per.B1_PER_GROUP || '/' || per.B1_PER_TYPE || '/' || PER.B1_PER_SUB_TYPE || '/' || PER.B1_PER_CATEGORY Record_Type, " +
                    "PER.B1_PER_CATEGORY CATEGORY, " +
                    "PER.B1_APP_TYPE_ALIAS RECORD_TYPE_ALIAS, " +
                    "per.B1_APPL_STATUS Status , " +
                    "cast (per.B1_APPL_STATUS_DATE as date) Status_Date , " +
                    "cast (per.B1_FILE_DD as date) Opened_Date , " +
                    "det.B1_PRIORITY PRIORITY, b.B1_FNAME,b.B1_LNAME,b.B1_EMAIL, " +
                    "per.b1_special_text RECORD_NAME, " +
                    "per.B1_APPL_CLASS CLASS, " +
                    "det.BALANCE, " +
                    " det.B1_APPL_SUB_STATUS UB_STATUS, " +
                    "PER.SERV_PROV_CODE ," +
                    "cast (EXP.EXPIRATION_DATE as date) EXP_DATE, " +
                    "ADDR.B1_HSE_NBR_START || ' ' || ADDR.B1_STR_NAME || ' ' || ADDR.B1_SITUS_CITY || ', ' || B1_SITUS_STATE || '  ' || B1_SITUS_ZIP AS FULL_ADDRESS " +

                    "FROM G3CONTACT G " +
                    "LEFT JOIN B3CONTACT B " +
                    "ON     G.SERV_PROV_CODE=B.SERV_PROV_CODE " +
                    "AND  G.G1_CONTACT_NBR=B.G1_CONTACT_NBR " +

                    "JOIN B1PERMIT PER " +
                    "ON  PER.SERV_PROV_CODE=B.SERV_PROV_CODE " +
                    "AND PER.B1_PER_ID1    =B.B1_PER_ID1 " +
                    "AND PER.B1_PER_ID2    =B.B1_PER_ID2 " +
                    "AND PER.B1_PER_ID3    =B.B1_PER_ID3 " +
                    "AND PER.REC_STATUS='A' " +

                    " LEFT JOIN B3ADDRES ADDR " +
                    " ON ADDR.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    " AND ADDR.B1_PER_ID1   =PER.B1_PER_ID1 " +
                    " AND ADDR.B1_PER_ID2   =PER.B1_PER_ID2 " +
                    " AND ADDR.B1_PER_ID3   =PER.B1_PER_ID3 " +
                    " AND ADDR.B1_PRIMARY_ADDR_FLG = 'Y' " +

                    "LEFT JOIN XAPP2REF X " +
                    "ON  X.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    "AND X.B1_PER_ID1    =PER.B1_PER_ID1 " +
                    "AND X.B1_PER_ID2    =PER.B1_PER_ID2 " +
                    "AND X.B1_PER_ID3    =PER.B1_PER_ID3 " +
                    "AND PER.REC_STATUS  ='A' " +
                    "AND X.REC_STATUS='A' " +
                    //"AND X.B1_STATUS IS NOT NULL " +

                    "LEFT JOIN B1PERMIT PAR " +
                    "ON   PAR.SERV_PROV_CODE=X.SERV_PROV_CODE " +
                    "AND  PAR.B1_PER_ID1  =X.B1_MASTER_ID1 " +
                    "AND  PAR.B1_PER_ID2  =X.B1_MASTER_ID2 " +
                    "AND  PAR.B1_PER_ID3  =X.B1_MASTER_ID3 " +
                    //"AND  PAR.B1_PER_CATEGORY IN ('PNCO','NCHL','CNCO','ANMC','NBOT','BLNC','PAGN') " +
                    "AND  PAR.REC_STATUS='A' " +

                    "LEFT JOIN BPERMIT_DETAIL DET  " +
                    "ON   DET.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  DET.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  DET.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  DET.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "LEFT join R3APPTYP app " +
                    "on app.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                    "and app.R1_PER_GROUP=per.B1_PER_GROUP " +
                    "and app.R1_PER_TYPE=per.B1_PER_TYPE " +
                    "and app.R1_PER_SUB_TYPE=per.B1_PER_SUB_TYPE " +
                    "and app.R1_PER_CATEGORY=per.B1_PER_CATEGORY " +

                    "left join R3APPTYP_I18N ar " +
                    "on ar.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "and ar.LANG_ID='ar_AE' " +
                    "and ar.RES_ID=app.RES_ID " +

                    "LEFT JOIN APP_STATUS_GROUP ST " +
                    "ON ST.APP_STATUS_GROUP_CODE=APP.APP_STATUS_GROUP_CODE " +
                    "AND ST.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "AND ST.STATUS=per.B1_APPL_STATUS " +

                    "left JOIN APP_STATUS_GROUP_I18N ST_AR " +
                    "ON ST_AR.SERV_PROV_CODE=ST.SERV_PROV_CODE " +
                    "AND ST_AR.RES_ID=ST.RES_ID " +
                    "AND ST_AR.LANG_ID='ar_AE' " +

                    "LEFT JOIN B1_EXPIRATION EXP  " +
                    "ON   EXP.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  EXP.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  EXP.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  EXP.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "WHERE G.SERV_PROV_CODE='" + servProvCode + "' " +
                    " AND  ( G.G1_CONTACT_NBR=" + contactRefNumber + " " +
                    " OR   per.B1_CREATED_BY='" + currentUserId + "' ) " +
                    " AND   G.REC_STATUS='A' " +
                    " AND   B.REC_STATUS='A' " +
                    " AND   PER.B1_FILE_DD > '01-SEP-18' " +
                    " AND ( PER.B1_APPL_CLASS IS NULL OR (PER.B1_APPL_CLASS != 'INCOMPLETE EST' AND PER.B1_APPL_CLASS != 'INCOMPLETE CAP')) " + 
                    " ORDER BY per.B1_APPL_STATUS_DATE DESC  ";

                    // get inspections data set
                    var inspSQL = "SELECT " +
                    "ar.R1_APP_TYPE_ALIAS ARABIC_ALIAS,st_ar.STATUS ARABIC_STATUS, " +
                    "PER.B1_PER_ID1 || '-' || PER.B1_PER_ID2 || '-' || PER.B1_PER_ID3 RECORD_ID, " +
                    //"IDCH.G1_ASSET_NAME ASSET_NAME , " + 
                    //"ID.G1_ASSET_NAME PARENT_ASSET_NAME, " + 
                    "PAR.B1_PER_ID1 || '-' || PAR.B1_PER_ID2 || '-' || PAR.B1_PER_ID3 PARENT_RECORD_ID, " +
                    "PAR.B1_ALT_ID PARENT_ID, par.b1_per_category PARENT_TYPE, " +
                    " per.B1_ALT_ID ALT_ID, " +
                    "DET.B1_SHORT_NOTES Short_Notes, " +
                    "per.B1_PER_GROUP || '/' || per.B1_PER_TYPE || '/' || PER.B1_PER_SUB_TYPE || '/' || PER.B1_PER_CATEGORY Record_Type, " +
                    "PER.B1_PER_CATEGORY CATEGORY, " +
                    "PER.B1_APP_TYPE_ALIAS RECORD_TYPE_ALIAS, " +
                    "per.B1_APPL_STATUS Status , " +
                    "per.b1_special_text RECORD_NAME, " +
                    "cast (per.B1_APPL_STATUS_DATE as date) Status_Date , " +
                    "cast (per.B1_FILE_DD as date) Opened_Date , " +
                    "det.B1_PRIORITY PRIORITY, b.B1_FNAME,b.B1_LNAME,b.B1_EMAIL, " +
                    "per.B1_APPL_CLASS CLASS, " +
                    "det.BALANCE, " +
                    " det.B1_APPL_SUB_STATUS UB_STATUS, " +
                    "PER.SERV_PROV_CODE ," +
                    "cast (EXP.EXPIRATION_DATE as date) EXP_DATE, " +
                    "ADDR.B1_HSE_NBR_START || ' ' || ADDR.B1_STR_NAME || ' ' || ADDR.B1_SITUS_CITY || ', ' || B1_SITUS_STATE || '  ' || B1_SITUS_ZIP AS FULL_ADDRESS " +
                    ", I.G6_ACT_TYP INSP_TYPE " +
                    ", I.G6_STATUS INSP_STATUS " +
                    ", to_char(I.G6_ACT_DD,'MM/DD/YYYY') INSP_SCHED_DATE " +
                    ", I.GA_FNAME || ' ' || I.GA_LNAME INSPECTOR " +
                    ", I.G6_ACT_NUM INSP_ID " +

                    "FROM G3CONTACT G " +
                    "LEFT JOIN B3CONTACT B " +
                    "ON     G.SERV_PROV_CODE=B.SERV_PROV_CODE " +
                    "AND  G.G1_CONTACT_NBR=B.G1_CONTACT_NBR " +

                    "JOIN B1PERMIT PER " +
                    "ON  PER.SERV_PROV_CODE=B.SERV_PROV_CODE " +
                    "AND PER.B1_PER_ID1    =B.B1_PER_ID1 " +
                    "AND PER.B1_PER_ID2    =B.B1_PER_ID2 " +
                    "AND PER.B1_PER_ID3    =B.B1_PER_ID3 " +
                    "AND PER.REC_STATUS='A' " +

                    "JOIN G6ACTION I   " +
                    "ON I.SERV_PROV_CODE=PER.SERV_PROV_CODE   " +
                    "AND I.B1_PER_ID1 =PER.B1_PER_ID1   " +
                    "AND I.B1_PER_ID2 =PER.B1_PER_ID2   " +
                    "AND I.B1_PER_ID3 =PER.B1_PER_ID3   " +
                    "AND I.G6_STATUS in ('Scheduled','Rescheduled')  " +

                    " LEFT JOIN B3ADDRES ADDR " +
                    " ON ADDR.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    " AND ADDR.B1_PER_ID1   =PER.B1_PER_ID1 " +
                    " AND ADDR.B1_PER_ID2   =PER.B1_PER_ID2 " +
                    " AND ADDR.B1_PER_ID3   =PER.B1_PER_ID3 " +
                    " AND ADDR.B1_PRIMARY_ADDR_FLG = 'Y' " +

                    "LEFT JOIN XAPP2REF X " +
                    "ON  X.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                    "AND X.B1_PER_ID1    =PER.B1_PER_ID1 " +
                    "AND X.B1_PER_ID2    =PER.B1_PER_ID2 " +
                    "AND X.B1_PER_ID3    =PER.B1_PER_ID3 " +
                    "AND PER.REC_STATUS  ='A' " +
                    "AND X.REC_STATUS='A' " +
                    //"AND X.B1_STATUS IS NOT NULL " +

                    "LEFT JOIN B1PERMIT PAR " +
                    "ON   PAR.SERV_PROV_CODE=X.SERV_PROV_CODE " +
                    "AND  PAR.B1_PER_ID1  =X.B1_MASTER_ID1 " +
                    "AND  PAR.B1_PER_ID2  =X.B1_MASTER_ID2 " +
                    "AND  PAR.B1_PER_ID3  =X.B1_MASTER_ID3 " +
                    //"AND  PAR.B1_PER_CATEGORY IN ('PNCO','NCHL','CNCO','ANMC','NBOT','BLNC','PAGN') " +
                    "AND  PAR.REC_STATUS='A' " +

                    "LEFT JOIN BPERMIT_DETAIL DET  " +
                    "ON   DET.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  DET.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  DET.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  DET.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "LEFT join R3APPTYP app " +
                    "on app.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                    "and app.R1_PER_GROUP=per.B1_PER_GROUP " +
                    "and app.R1_PER_TYPE=per.B1_PER_TYPE " +
                    "and app.R1_PER_SUB_TYPE=per.B1_PER_SUB_TYPE " +
                    "and app.R1_PER_CATEGORY=per.B1_PER_CATEGORY " +

                    "left join R3APPTYP_I18N ar " +
                    "on ar.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "and ar.LANG_ID='ar_AE' " +
                    "and ar.RES_ID=app.RES_ID " +

                    "LEFT JOIN APP_STATUS_GROUP ST " +
                    "ON ST.APP_STATUS_GROUP_CODE=APP.APP_STATUS_GROUP_CODE " +
                    "AND ST.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                    "AND ST.STATUS=per.B1_APPL_STATUS " +

                    "left JOIN APP_STATUS_GROUP_I18N ST_AR " +
                    "ON ST_AR.SERV_PROV_CODE=ST.SERV_PROV_CODE " +
                    "AND ST_AR.RES_ID=ST.RES_ID " +
                    "AND ST_AR.LANG_ID='ar_AE' " +

                    "LEFT JOIN B1_EXPIRATION EXP  " +
                    "ON   EXP.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                    "AND  EXP.B1_PER_ID1     =PER.B1_PER_ID1 " +
                    "AND  EXP.B1_PER_ID2     =PER.B1_PER_ID2 " +
                    "AND  EXP.B1_PER_ID3     =PER.B1_PER_ID3 " +

                    "WHERE G.SERV_PROV_CODE='" + servProvCode + "' " +
                    " AND  ( G.G1_CONTACT_NBR=" + contactRefNumber + " " +
                    " OR   per.B1_CREATED_BY='" + currentUserId + "' ) " +
                    " AND   G.REC_STATUS='A' " +
                    " AND   B.REC_STATUS='A' " +
                    " AND   PER.B1_FILE_DD > '01-SEP-18' " +
                    " AND ( PER.B1_APPL_CLASS IS NULL OR PER.B1_APPL_CLASS != 'INCOMPLETE EST' ) " + 
                    " ORDER BY per.B1_APPL_STATUS_DATE DESC  ";

            }

            logDebug("SQL QUERY : " + sql);
            var draftsSql = "SELECT  " +
                "PER.B1_ALT_ID ALT_ID, " +
                "PER.B1_PER_ID1 || '-' || PER.B1_PER_ID2 || '-' || PER.B1_PER_ID3 RECORD_ID, " +
                "PAR.B1_PER_ID1 || '-' || PAR.B1_PER_ID2 || '-' || PAR.B1_PER_ID3 PARENT_RECORD_ID, " +
                "PAR.B1_PER_CATEGORY PARENT_CATEGORY	, " +
                "PAR.B1_ALT_ID PARENT_ALT_ID, " +
                "ar.R1_APP_TYPE_ALIAS ARABIC_ALIAS, " +
                "app.R1_APP_TYPE_ALIAS RECORD_TYPE_ALIAS, " +
                "st_ar.STATUS ARABIC_STATUS, " +
                "per.B1_APPL_STATUS Status, " +
                "PER.B1_APPL_CLASS CLASS_TYPE, " +
                "per.B1_PER_GROUP || '/' || per.B1_PER_TYPE || '/' || PER.B1_PER_SUB_TYPE || '/' || PER.B1_PER_CATEGORY Record_Type , " +
                "cast (per.B1_APPL_STATUS_DATE as date) Status_Date , " +
                "cast (per.B1_FILE_DD as date) Opened_Date ,  " +
                "per.b1_special_text RECORD_NAME, " +
                "PER.B1_PER_CATEGORY CATEGORY	, " +
                "BIZ2.B1_LICENSE_NBR, " +
                "BIZ2.B1_LICENSE_TYPE, " +
                "BIZ2.REC_STATUS LICENSE_STATUS, " +
                "per.SERV_PROV_CODE, " +
                "ADDR.B1_HSE_NBR_START || ' ' || ADDR.B1_STR_NAME || ' ' || ADDR.B1_SITUS_CITY || ', ' || B1_SITUS_STATE || '  ' || B1_SITUS_ZIP AS FULL_ADDRESS " +


                "FROM  B1PERMIT PER " +
                "LEFT JOIN BPERMIT_DETAIL DET  " +
                "ON   DET.SERV_PROV_CODE =PER.SERV_PROV_CODE " +
                "AND  DET.B1_PER_ID1     =PER.B1_PER_ID1 " +
                "AND  DET.B1_PER_ID2     =PER.B1_PER_ID2 " +
                "AND  DET.B1_PER_ID3     =PER.B1_PER_ID3 " +

                " LEFT JOIN B3CONTACT BC ON PER.SERV_PROV_CODE=BC.SERV_PROV_CODE  " +
                " AND PER.B1_PER_ID1 =BC.B1_PER_ID1  " +
                " AND PER.B1_PER_ID2 =BC.B1_PER_ID2  " +
                " AND PER.B1_PER_ID3 =BC.B1_PER_ID3  " +
                " AND PER.REC_STATUS='A'  " +

                " LEFT JOIN G3CONTACT G ON G.SERV_PROV_CODE=BC.SERV_PROV_CODE  " +
                " AND G.G1_CONTACT_NBR=BC.G1_CONTACT_NBR  " +

                " LEFT JOIN B3ADDRES ADDR " +
                " ON ADDR.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                " AND ADDR.B1_PER_ID1   =PER.B1_PER_ID1 " +
                " AND ADDR.B1_PER_ID2   =PER.B1_PER_ID2 " +
                " AND ADDR.B1_PER_ID3   =PER.B1_PER_ID3 " +
                " AND ADDR.B1_PRIMARY_ADDR_FLG = 'Y' " +

                "LEFT JOIN XAPP2REF X " +
                "ON  X.SERV_PROV_CODE=PER.SERV_PROV_CODE " +
                "AND X.B1_PER_ID1    =PER.B1_PER_ID1 " +
                "AND X.B1_PER_ID2    =PER.B1_PER_ID2 " +
                "AND X.B1_PER_ID3    =PER.B1_PER_ID3 " +
                "AND PER.REC_STATUS  ='A' " +
                "AND X.REC_STATUS='A' " +
                "AND X.B1_STATUS IS NOT NULL " +

                "LEFT JOIN B1PERMIT PAR " +
                "ON   PAR.SERV_PROV_CODE=X.SERV_PROV_CODE " +
                "AND  PAR.B1_PER_ID1  =X.B1_MASTER_ID1 " +
                "AND  PAR.B1_PER_ID2  =X.B1_MASTER_ID2 " +
                "AND  PAR.B1_PER_ID3  =X.B1_MASTER_ID3 " +
                "AND  PAR.REC_STATUS='A' " +

                "LEFT JOIN b3contra Biz2 " +
                "ON Biz2.serv_prov_code = PAR.serv_prov_code " +
                "AND Biz2.b1_per_id1 = PAR.b1_per_id1 " +
                "AND Biz2.b1_per_id2 = PAR.b1_per_id2 " +
                "AND Biz2.b1_per_id3 = PAR.b1_per_id3 " +

                "LEFT join R3APPTYP app " +
                "on app.SERV_PROV_CODE=per.SERV_PROV_CODE " +
                "and app.R1_PER_GROUP=per.B1_PER_GROUP " +
                "and app.R1_PER_TYPE=per.B1_PER_TYPE " +
                "and app.R1_PER_SUB_TYPE=per.B1_PER_SUB_TYPE " +
                "and app.R1_PER_CATEGORY=per.B1_PER_CATEGORY " +

                "left join R3APPTYP_I18N ar " +
                "on ar.SERV_PROV_CODE=app.SERV_PROV_CODE " +
                "and ar.LANG_ID='ar_AE' " +
                "and ar.RES_ID=app.RES_ID " +

                "LEFT JOIN APP_STATUS_GROUP ST " +
                "ON ST.APP_STATUS_GROUP_CODE=APP.APP_STATUS_GROUP_CODE " +
                "AND ST.STATUS=per.B1_APPL_STATUS " +
                "left JOIN APP_STATUS_GROUP_I18N ST_AR " +
                "ON ST_AR.SERV_PROV_CODE=ST.SERV_PROV_CODE " +
                "AND ST_AR.RES_ID=ST.RES_ID " +
                "AND ST_AR.LANG_ID='ar_AE' " +

                "WHERE per.SERV_PROV_CODE='" + servProvCode + "' " +
                " AND  ( G.G1_CONTACT_NBR=" + contactRefNumber + " " +
                    " OR   per.B1_CREATED_BY='" + currentUserId + "' ) " + " AND per.REC_STATUS='A' AND ( PER.B1_APPL_CLASS = 'INCOMPLETE CAP' or PER.B1_APPL_CLASS = 'INCOMPLETE' or PER.B1_APPL_CLASS = 'INCOMPLETE EST' )  ORDER BY per.B1_APPL_STATUS_DATE DESC  ";

            logDebug("<br><br>");
            logDebug("Drafts QUERY : " + draftsSql);

            var myRequests = execQuery(sql);
            myRequests = removeDuplicatesFromArray(myRequests, "RECORD_ID");
            logDebug("Requests: " + myRequests.length);
            var myDrafts = execQuery(draftsSql);
            myDrafts = removeDuplicatesFromArray(myDrafts, "RECORD_ID");
            logDebug("Drafts: " + myDrafts.length);

            var myInspections = execQuery(inspSQL);
            myInspections = removeDuplicatesFromArray(myInspections, "INSP_ID");
            logDebug("Inspections: " + myInspections.length);


            var fullDataSet = {
                "requests": myRequests,
                "inspections": myInspections,
                "drafts": myDrafts,
                "serverSide": false,
                "publicUser": String(currentUserId).trim(),
                licenses: licensesArray,
                "userSettings": "",
                "userx": ""
            };

            var dataset = JSON.stringify(fullDataSet, null, 2);

            //logDebug("dataset: " + dataset);
            //aa.debug("Result", dataset);

            return dataset;
            
        }
    }
}


function execQuery(sql) {
    var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
    var utilProcessor = new JavaAdapter(com.accela.aa.datautil.DBResultSetProcessor, {
        processResultSetRow: function (rs) {
            var meta = rs.getMetaData();
            var numcols = meta.getColumnCount();
            var record = {}
            var result = null;
            for (var i = 0; i < numcols; i++) {
                var columnName = meta.getColumnName(i + 1);
                columnName = columnName.toUpperCase()
                result = rs.getObject(i + 1);
                if (result == null) {
                    record[columnName] = String("");
                } else {
                    if (result.getClass && result.getClass().getName() == "java.sql.Timestamp") {

                        record[columnName] = String(new Date(rs.getTimestamp(i + 1).getTime()).toString("MM/dd/yyyy"));
                    } else {
                        record[columnName] = String(rs.getObject(i + 1));
                    }
                }
            }
            return record;
        }
    });
    var result = dba.select(sql, [], utilProcessor, null);
    ret = result.toArray()
    var data = [];
    for (var x in ret) {
        var o = {};
        for (var y in ret[x]) {
            o[y] = String(ret[x][y])
        }
        data.push(o)
    }
    /*
    for (y=0;y<200;y++){
        var testData = {"RECORD_ID":"17CAP-00000-0000P","PARENT_RECORD_ID":"","PARENT_ID":"","PARENT_TYPE":"","ALT_ID":"SGEN-USRG-2017-00004","SHORT_NOTES":"","RECORD_TYPE":"eGeneral/General Services/User System Registration/USRG","CATEGORY":"USRG","RECORD_TYPE_ALIAS":"User System Registration","STATUS":"Registration Rejected","OPENED_DATE":"2017-06-22","PRIORITY":"","B1_FNAME":"test","B1_LNAME":"last","B1_EMAIL":"asdsa@sa.cd"}     
        data.push(testData);
    } 
    */
    return data;
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function escapeSpec(str) {
    return str.replace(/(['^=!${}()|\[\]\/\\])/g, "\\$1");
}

function removeDuplicatesFromArray(arr, prop) {
    var obj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        // If no property is supplied for comparison, stringify the entire object and use it for comparison
        if (!prop) {
            prop = JSON.stringify(arr[i]);
            if (!obj[prop]) obj[prop] = arr[i];
        } else {
            if (!obj[arr[i][prop]]) {
                obj[arr[i][prop]] = arr[i];
                obj[arr[i][prop]].B1_LICENSES = new Array({
                    LICENSE_NUM: arr[i].B1_LICENSE_NBR,
                    LICENSE_STATUS: arr[i].LICENSE_STATUS,
                    LICENSE_TYPE: arr[i].B1_LICENSE_TYPE
                });
                obj[arr[i][prop]].B1_LICENSE_NBR = new Array(obj[arr[i][prop]].B1_LICENSE_NBR);
                obj[arr[i][prop]].LICENSE_STATUS = new Array(obj[arr[i][prop]].LICENSE_STATUS);
                obj[arr[i][prop]].B1_LICENSE_TYPE = new Array(obj[arr[i][prop]].B1_LICENSE_TYPE);

            } else {
                obj[arr[i][prop]].B1_LICENSES.push({
                    LICENSE_NUM: arr[i].B1_LICENSE_NBR,
                    LICENSE_STATUS: arr[i].LICENSE_STATUS,
                    LICENSE_TYPE: arr[i].B1_LICENSE_TYPE
                });
                obj[arr[i][prop]].B1_LICENSE_NBR.push(arr[i].B1_LICENSE_NBR);
                obj[arr[i][prop]].LICENSE_STATUS.push(arr[i].LICENSE_STATUS);
                obj[arr[i][prop]].B1_LICENSE_TYPE.push(arr[i].B1_LICENSE_TYPE);
            }
        }
    }
    var newArr = [];
    for (var key in obj) newArr.push(obj[key]);
    return newArr;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}


function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

function logDebug(msg, msg2) {
    if (typeof msg2 === "undefined" || msg2 === null) {
        msg2 = "";
    } else {
        msg2 = " : " + msg2;
    }
    debug += "<br>" + msg + msg2;
    aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), msg + msg2);
    aa.print(msg + msg2);
    java.lang.System.out.println("===Custom Log for user: ==> " + msg + msg2);
}