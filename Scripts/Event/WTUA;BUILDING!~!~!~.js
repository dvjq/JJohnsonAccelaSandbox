/*------------------------------------------------------------------------------------------------------/
| <=========== Project actions (start)
/------------------------------------------------------------------------------------------------------*/
if (isDPRRecord(appTypeString) && !appMatch("Building/Commercial/Alteration/NA")) {
     eval(getScriptText("INCLUDES_DPR_LIBRARY"));
     /*------------------------------------------------------------------------------------------------------/
     | Application Intake
     /------------------------------------------------------------------------------------------------------*/
     if (matches(wfTask,"Application Intake","Application Acceptance") && wfStatus == "Plans Received") {    
          // send the plans received notification
          var notificationObj = {};
          notificationObj.notificationId = "PLANS_RECEIVED";
          Dpr.sendDprEmailNotification(notificationObj);
          // Update 'Number of Pages' TSI on Application Intake task when plans are received
          var packageSheetCount = Dpr.getPackageSheetCount();
          if (packageSheetCount) {
             editTaskSpecific(wfTask,"Number of Pages",packageSheetCount);
          } 

          addPlanRoomCondition();
     } else if(matches(wfTask,"Application Intake","Application Acceptance") && wfStatus == "Additional Info Required") { 
          if (Dpr.dprProjectExists()) {
               Dpr.updateLatestProjectSubmittalStatus("reopened");
               logDebug("DPR: Review package reopened.");               
          }

          // notification specific data
          var additionalParams = {};
          additionalParams.wfComment = wfComment;
          additionalParams.dprUploadsLink = Dpr.getDprACADeepLinkUrl("UPLOADS");
          
          // send the additional info notification
          var notificationObj = {};
          notificationObj.notificationId = "ADDITIONAL_INFO_NEEDED";
          notificationObj.eParams = additionalParams;
          Dpr.sendDprEmailNotification(notificationObj);
                                                                                                                                                  
     } else if(matches(wfTask,"Application Intake","Application Acceptance") && wfStatus == "Accepted - Plan Review Req") { 
          if (Dpr.dprProjectExists()) {
               Dpr.cleanUpEmptyReviewPackages();
               Dpr.acceptReviewPackages();
               logDebug("DPR: Review package accepted.");               
          }

          addPlanRoomCondition();

     } 
     /*------------------------------------------------------------------------------------------------------/
     | Plans Distribution
     /------------------------------------------------------------------------------------------------------*/
     else if(wfTask == "Plans Distribution" && wfStatus == "Routed for Review") {
          if (Dpr.dprProjectExists()) {
               //Accept the package, if already accepted ignore the error
               Dpr.cleanUpEmptyReviewPackages();
               Dpr.acceptReviewPackages();
               Dpr.updateProjectStatus("InReview");
               logDebug("DPR: Plan Review routed. Project updated to in review.");  

               addPlanRoomCondition();
          }
     } else if(wfTask == "Plans Distribution" && wfStatus == "Revisions Received") {
          // send the revisions received notification
          var notificationObj = {};
          notificationObj.notificationId = "REVISED_PLANS_RECEIVED";
          Dpr.sendDprEmailNotification(notificationObj);
     } 
     /*------------------------------------------------------------------------------------------------------/
     | Plans Coordination
     /------------------------------------------------------------------------------------------------------*/
     else if (wfTask == "Plans Coordination" && wfStatus == "Revisions Required") {
          if (!Dpr.dprProjectExists()) {
               // product does not exist in plan room create it
               // this scenario is likely for projects in flight
               // at the time of go-live for the digital plan room
               logDebug("DPR: Plan Review Rejected. No project exists, creating project and review package.");
               Dpr.createProjectPlusSubmittal();

               // Do we need an email for this scenario?
               // What status would we want it to be in?
          } else {
               var publishConditionsResult = Dpr.publishConditions(); 
               if (publishConditionsResult) {
                    logDebug("DPR: " + wfTask + " updated to " + wfStatus + ". Conditions for all disciplines have been published.");
               } 

               var createSubmittalResponse = Dpr.createSubmittalPackage(null, true);
               logDebug("DPR: Plan Review Rejected. Submittal created.");

               var updateProjectResult = Dpr.updateProjectStatus("NotApproved"); 

               if (updateProjectResult) {
                    // prepare additional data for notification
                    var additionalParams = {};
                    if (createSubmittalResponse) {
                         additionalParams.submittalId = createSubmittalResponse;
                    } 
                    // get issue/condition counts for the email
                    additionalParams.openIssuesCount = Dpr.getOpenIssuesCount4Notification();
                    additionalParams.openConditionsCount = Dpr.getOpenConditionsCount4Notification();
                    logDebug("DPR: Plan Review Rejected. Project updated to rejected.");
                    
                    // send the plan review cycle rejected notification
                    var notificationObj = {};
                    notificationObj.notificationId = "PLAN_REVIEW_COMPLETE_REJECTED";
                    notificationObj.eParams = additionalParams;
                    Dpr.sendDprEmailNotification(notificationObj);              
               }               
          }

          updateTask("Plans Distribution", "Awaiting Revisions", "", "");

     }  else if((wfTask == "Plans Coordination" && wfStatus == "Ready to Issue") || (matches(wfTask,"Application Intake","Application Acceptance") && wfStatus == "Accepted - Plan Review Not Req")) { 
          // get the app condition values from standard choices
          var conditionConfig = lookup("DPR_CONFIGS", "PLAN_REVIEW_IN_PROCESS");
          if (conditionConfig != undefined) {
               var conditionConfigArray = conditionConfig.split("|");
               removeCapCondition(conditionConfigArray[0],conditionConfigArray[3]);
          }
          
          if (Dpr.dprProjectExists()) {
               if (matches(wfTask,"Application Intake","Application Acceptance") && wfStatus == "Accepted - Plan Review Not Req") {
                    Dpr.acceptReviewPackages();
               }

               var approveProjectResult = Dpr.approveProject();

               //publish conditions
               var publishConditionsResult = Dpr.publishConditions(); 
               if (publishConditionsResult) {
                    logDebug("DPR: " + wfTask + " updated to " + wfStatus + ". Conditions for all disciplines have been published.");
               }

               if (wfTask == "Plans Coordination") {
                    var printSetObj = {};
                    printSetObj.name = "APPROVED:" + capIDString;
                    printSetObj.type = "Approved Plans";
                    printSetObj.includeStamps = true;
                    printSetObj.includeNotes = true; 
                    Dpr.createPrintSet(printSetObj);                        
               }

               reconcileBuildingPlans();
          }
     } 
     /*------------------------------------------------------------------------------------------------------/
     | PROJECT CLOSURE
     /------------------------------------------------------------------------------------------------------*/
     else if (wfTask == "Certificate of Occupancy" && wfStatus == "Final CO Issued") {          
          
          if (Dpr.dprProjectExists()) {
               Dpr.updateProjectStatus("Closed");
               logDebug("DPR: Project closed.");                
          }
     } 

/*------------------------------------------------------------------------------------------------------/
| <=========== Discipline actions (start)
/------------------------------------------------------------------------------------------------------*/

     if (matches(wfStatus,"Revisions Required","Approved w/Comments")) {
          if (isDprDisciplineTask(appTypeString, wfTask)) {
               if (Dpr.dprProjectExists()) {

                    //publish conditions if review rejected or Approved with conditions
                    var publishConditionsResult = Dpr.publishConditions(wfTask); 
                    
                    if (publishConditionsResult) {
                         logDebug("DPR: " + wfTask + " updated to " + wfStatus + ". Conditions for this discipline have been published.");
                    }  

                    // publish issues of review rejected
                    if (wfStatus == "Revisions Required") {
                         var publishIssuesResult = Dpr.publishIssues(wfTask); 
                         
                         if (publishIssuesResult) {
                              logDebug("DPR: " + wfTask + " rejected. Issues for this discipline updated to 'Open'.");
                              additionalParams = {};
                              additionalParams.discipline = wfTask;
                              additionalParams.openIssuesCount = Dpr.getOpenIssuesCount4Notification(wfTask);
                              additionalParams.openConditionsCount = Dpr.getOpenConditionsCount4Notification(wfTask);
                              
                              // send the discipline review rejected notification
                              var notificationObj = {};
                              notificationObj.notificationId = "DISCIPLINE_REVIEW_REJECTED";
                              notificationObj.eParams = additionalParams;
                              Dpr.sendDprEmailNotification(notificationObj);                     
                         }                    
                    }
               }   
          }     
     }

/*------------------------------------------------------------------------------------------------------/
| <=========== Discipline actions (end)
/------------------------------------------------------------------------------------------------------*/

}

if (appMatch('Building/Residential/New/NA') && wfTask == "Permit Issuance" && wfStatus == "Issued") {
     scheduleInspection("Footing & Foundation", 4, "AIRKULLA");
}
