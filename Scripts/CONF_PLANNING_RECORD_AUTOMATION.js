{
  "Planning/Amendment/Simple/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "test records",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Amendment Review"
          ],
          "status": [
            "Not Accepted",
            "Accepted"
          ]
        },
        "action": {
          "updateExpDate": {
            "expirationType": "Days",
            "expirationPeriod": "0",
            "destination": "ASI",
            "asiName": "DATES AND PARENT INFO.Amendment Decision Date",
            "customExpirationFunction": ""
          }
        },
        "postScript": ""
      }
    ]
  }
}