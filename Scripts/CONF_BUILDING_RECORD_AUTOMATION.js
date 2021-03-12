{
    "Building/*/*/*": {
      "WorkflowTaskUpdateAfter": [
        {
          "metadata": {
            "description": "Create bluebeam session and upload document",
            "operators": {}
          },
          "preScript": "",
          "criteria": {
            "customFields": {
            },
            "task": [
              "Plans Distribution"
            ],
            "status": [
              "Route for Review"
            ],
            "workFlow": {},
            "isCreatedByACA": false,
            "isACAEvent": false,
            "recordStatus": [],
            "balanceAllowed": true
          },
          "action": {
            "updateOpenDate": false,
            "saveCreationDate": false,
            "activateTask": [],
            "daysOut": "10",
            "useCalendarDays": false,
            "deactivateTask": [],
            "deleteTask": [],
            "updateTask": [
              {
                "task": "",
                "status": ""
              }
            ],
            "invoiceFees": "",
            "createChild": "",
            "createParent": "",
            "addCondition": "Bluebeam Review Condition",
            "addConditionSeverity": " ",
            "addConditionType": "Bluebeam",
            "removeConditionType": "",
            "removeCondition": "",
            "addComment": "",
            "newStatus": "",
            "assignToUserID": "",
            "assessFees": [
              {
                "feeSchedule": "",
                "feeCode": "",
                "feeQuantity": 1,
                "feeInvoice": "",
                "feePeriod": ""
              }
            ],
            "updateExpDate": {
              "expirationType": "",
              "expirationPeriod": "",
              "destination": "",
              "asiName": "",
              "customExpirationFunction": ""
            },
            "primaryContactType": ""
          },
          "postScript": "INT_BLUEBEAM_INITSESSION"
        }
      ]
    }
  }