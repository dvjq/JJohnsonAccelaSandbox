function createRecordDeepLink(){
    var iCapId = capId;
    var iCap = cap;

    if(arguments.length == 1){
        iCapId = arguments[0];
        iCap = aa.cap.getCap(iCapId).getOuput();
    }

        var acaSiteUrl = lookup("ACA_CONFIGS", "ACA_SITE");
        var subStrIndex = acaSiteUrl.toUpperCase().indexOf("/ADMIN");
        var acaCitizenRootUrl = acaSiteUrl.substring(0, subStrIndex);
        var deepUrl = "/urlrouting.ashx?type=1000";
        deepUrl = deepUrl + "&Module=" + iCap.getCapModel().getModuleName();
        deepUrl = deepUrl + "&capID1=" + iCapId.getID1();
        deepUrl = deepUrl + "&capID2=" + iCapId.getID2();
        deepUrl = deepUrl + "&capID3=" + iCapId.getID3();
        deepUrl = deepUrl + "&agencyCode=" + aa.getServiceProviderCode();
        deepUrl = deepUrl + "&HideHeader=true";

        var recordDeepUrl = acaCitizenRootUrl + deepUrl;

}