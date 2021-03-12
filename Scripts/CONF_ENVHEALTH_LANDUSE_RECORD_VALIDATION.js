{
  "EnvHealth//Land Use/*/Application": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "Rule for all EnvHealth Land Use issuance",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  }
}