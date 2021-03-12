{
  "Enforcement/Zoning/Case/Case": [
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found - NOV Issued"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Appeal and Hearing"
      ],
      "Status": [
        "Appeal Filed"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "An appeal has been filed for the illegal sign violation.",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Appeal and Hearing"
      ],
      "Status": [
        "Hearing Scheduled"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The appeal hearing has been scheduled.",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Appeal and Hearing"
      ],
      "Status": [
        "Hearing Held"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The appeal hearing has been held. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Re-inspection"
      ],
      "Status": [
        "Re-Inspection - Citation"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "A citation has been issued for the violation. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Collections"
      ],
      "Status": [
        "Paid"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Work Complete",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The service request has been completed. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        },
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Final Notification",
              "Set_Status": "Send Email",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": false,
              "Copy_To_Record_Comments": false,
              "Set_Comment_Static": "",
              "Send_Notifications": [
                {
                  "From": "",
                  "CC": "",
                  "Notification_Template": "",
                  "To_ContactTypes": []
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    }
  ],
  "Enforcement/Property Maintenance/Case/Case": [
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found - NOV Issued"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found - NOV Issued"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Re-inspection"
      ],
      "Status": [
        "In Violation - Env Crew Referred"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "A citation has been issued for the violation, a crew will be onsite soon to cut the grass. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Abatement"
      ],
      "Status": [
        "Corrected - Env Crew"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Work Complete",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The service request has been completed. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        },
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Final Notification",
              "Set_Status": "Send Email",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": false,
              "Copy_To_Record_Comments": false,
              "Set_Comment_Static": "",
              "Send_Notifications": [
                {
                  "From": "",
                  "CC": "",
                  "Notification_Template": "",
                  "To_ContactTypes": []
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    }
  ],
  "Enforcement/Incident/Abatement/Abandoned Vehicle": [
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Inspection"
      ],
      "Status": [
        "Violation Found - NOV Issued"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "SR_CRM",
              "Task": "Processing",
              "Set_Status": "Note",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The initial inspection has been completed and violations were found at the property.",
              "Disposition": "UPDATE",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Pre-tow Notice"
      ],
      "Status": [
        "Issued"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "A tow notice has been issued to the owner of the vehicle.",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Re-inspection"
      ],
      "Status": [
        "Violation Found - Tow Vehicle"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Note",
              "Disposition": "UPDATE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "A citation has been issued for the violation. The vehicle will be removed from the property.",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    },
    {
      "Task": [
        "Tow Vehicle"
      ],
      "Status": [
        "Vehicle Towed"
      ],
      "Send_Notifications": [
        {
          "From": "",
          "CC": "",
          "Notification_Template": "",
          "To_ContactTypes": []
        }
      ],
      "Propogation_Rules_Other_Records": [
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Processing",
              "Set_Status": "Work Complete",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": true,
              "Copy_To_Record_Comments": true,
              "Set_Comment_Static": "The service request has been completed. The vehicle has been towed from the property. ",
              "Send_Notifications": [
                {
                  "From": "civic.solutions@accela.com",
                  "CC": null,
                  "Notification_Template": "SR_GENERAL_UPDATE",
                  "To_ContactTypes": [
                    "Complainant",
                    "individual"
                  ]
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        },
        {
          "Record_Type": "ServiceRequest/*/*/*",
          "Record_Types_Excluded": null,
          "Propogation_Rules": [
            {
              "WF_Process": "",
              "Task": "Final Notification",
              "Set_Status": "Send Email",
              "Disposition": "CLOSE",
              "Activate_Task": false,
              "Assign_Task": null,
              "Make_Public": false,
              "Copy_To_Record_Comments": false,
              "Set_Comment_Static": "",
              "Send_Notifications": [
                {
                  "From": "",
                  "CC": "",
                  "Notification_Template": "",
                  "To_ContactTypes": []
                }
              ],
              "Copy_wfComment_On_Fire_WTUA_Event": false,
              "Fire_WTUA_Event": false
            }
          ]
        }
      ]
    }
  ]
}