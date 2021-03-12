{
  "PublicWorks/ROW/Encroachment/Permit": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isACAEvent": true,
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": false,
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ],
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isACAEvent": false,
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": false,
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/License Agreement/Application": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": {
            "1 or 10 Year Agreement": "1"
          },
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": ""
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": [
            {
              "feeSchedule": "PW_LICENSE_AGREEMENT",
              "feeCode": "ROW_LA_10",
              "feeQuantity": 1,
              "feeInvoice": "Y",
              "feePeriod": "FINAL"
            }
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": {
            "1 or 10 Year Agreement": "10"
          },
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": ""
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": [
            {
              "feeSchedule": "PW_LICENSE_AGREEMENT",
              "feeCode": "ROW_LA_10",
              "feeQuantity": 10,
              "feeInvoice": "Y",
              "feePeriod": "FINAL"
            }
          ]
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/ROW/License Agreement/Renewal": {
    "ConvertToRealCAPAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": {
            "1 or 10 Year Agreement": "1"
          },
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": ""
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": [
            {
              "feeSchedule": "PW_LICENSE_AGREEMENT",
              "feeCode": "ROW_LA_10",
              "feeQuantity": 1,
              "feeInvoice": "Y",
              "feePeriod": "FINAL"
            }
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": {
            "1 or 10 Year Agreement": "10"
          },
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": ""
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": [
            {
              "feeSchedule": "PW_LICENSE_AGREEMENT",
              "feeCode": "ROW_LA_10",
              "feeQuantity": 10,
              "feeInvoice": "Y",
              "feePeriod": "FINAL"
            }
          ]
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/ROW/Loading Zone/Application": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Loading Zone/Renewal": {
    "ConvertToRealCAPAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Outdoor Seating/Application": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ],
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Outdoor Seating/Renewal": {
    "ConvertToRealCAPAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ],
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Pod or Dumpster/NA": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": true
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": "JSON_CUSTOM_FEE_UPDATE"
      }
    ],
    "PaymentReceiveAfter": [
      {
        "metadata": {
          "description": "Record Automation",
          "operators": {}
        },
        "preScript": " ",
        "criteria": {
          "customLists": "",
          "contactFields": "",
          "lpFields": "",
          "customFields": "",
          "addressFields": "",
          "parcelFields": "",
          "workFlow": "",
          "isCreatedByACA": "",
          "isACAEvent": "",
          "balanceAllowed": false
        },
        "action": {
          "recordStatus": "",
          "activateTask": "",
          "daysOut": "",
          "useCalendarDays": "",
          "deactivateTask": "",
          "deleteTask": "",
          "updateTask": "",
          "updateStatus": "",
          "invoiceFees": "",
          "createChild": "",
          "createParentOfType": "",
          "addCondition": "",
          "addConditionSeverity": "",
          "conditionType": "",
          "removeCondition": "",
          "addComment": "",
          "newStatus": "Active",
          "assignToUserID": "",
          "assessFees": ""
        },
        "postScript": ""
      }
    ]
  }
}