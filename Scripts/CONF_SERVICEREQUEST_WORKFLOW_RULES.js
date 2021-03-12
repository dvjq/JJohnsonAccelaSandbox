{
  "ServiceRequest/*/*/*": [
    {
      "Task": ["Final Notification"],
      "Status": ["Email Sent"],
      "Send_Notifications":[{
        "From":"Auto_Sender@Accela.com",
        "CC": null,
        "Notification_Template":"SR NOTIFICATION",
        "To_ContactTypes":["Complainant","individual"]
      }],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/CRM/CRM/NA",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Work Order",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The case you are tracking has been closed.  Property has been brought into compliance.  Please follow the link below for more information. $$altID$$",
              "Set_Status": "Close",
              "Disposition": "CLOSE",
              "Copy_wfComment_On_Fire_WTUA_Event": true,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": ["Inspection"],
      "Status": ["Note"],
      "Propogation_Rules_Current_Record": [
        {
          "Propogation_Rules": [
            {
              "WF_Process": "SR_STANDARD",
              "Task": "Inspection",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "altID = $$altID$$",
              "Set_Status": "Note",
              "Disposition": "LOOP",
              "Copy_wfComment_On_Fire_WTUA_Event": true,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": ["Intake"],
      "Status": ["Received"],
      "Send_Notifications":[{
        "From":"Auto_Sender@Accela.com",
        "CC": null,
        "Notification_Template":"SR_RECEIVED",
        "To_ContactTypes":["Complainant","individual"]
      }]
    }
  ]
}