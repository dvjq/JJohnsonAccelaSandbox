{
  "EnvHealth/Personal Services/*/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Assess Time Accounting Based Fees",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
                   "Permit Issuance"
          ],
          "status": [
                     "Issued"
          ]
        },
        "action": {          
        },
        "postScript": ""
      }
    ]
  }
}