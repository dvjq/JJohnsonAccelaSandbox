{
  "Cannabis/Hemp/Cultivation/Application": {
    "InspectionResultSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Pre-Harvest Inspection and Sampling inspection has passed.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Pre-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "taskName": "Pre-Harvest Inspection and Sampling",
          "taskStatus": "Approved"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update the expiration date of record when an inspection has passed.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "expirationTypeUpdate": "Expiration Code",
          "expirationDaysToAdvance": 365
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field for permit expiration information when an inspection has passed",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "expirationTypeUpdate": "ASI:Permit Expiration Date",
          "expirationDaysToAdvance": 365
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Pre-Harvest Inspection and Sampling inspection is denied.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Pre-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Denied"
          ]
        },
        "action": {
          "taskName": "Pre-Harvest Inspection and Sampling",
          "taskStatus": "Denied"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Pre-Harvest Inspection and Sampling inspection is Pending.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Pre-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Pending"
          ]
        },
        "action": {
          "taskName": "Pre-Harvest Inspection and Sampling",
          "taskStatus": "Pending"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Pre-Harvest Inspection and Sampling inspection has cancelled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Pre-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Cancelled"
          ]
        },
        "action": {
          "taskName": "Pre-Harvest Inspection and Sampling",
          "taskStatus": "Cancelled"
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Hemp/Processor/Application": {
    "InspectionResultSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Post-Harvest Inspection and Sampling inspection has passed.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Post-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "taskName": "Post-Harvest Inspection and Sampling",
          "taskStatus": "Approved"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update the expiration date of record when an inspection has passed.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "expirationTypeUpdate": "Expiration Code",
          "expirationDaysToAdvance": 365
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field for permit expiration information when an inspection has passed",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [],
          "inspectionResult": [
            "Approved"
          ]
        },
        "action": {
          "expirationTypeUpdate": "ASI:Permit Expiration Date",
          "expirationDaysToAdvance": 365
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Post-Harvest Inspection and Sampling inspection is Denied.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Post-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Denied"
          ]
        },
        "action": {
          "taskName": "Post-Harvest Inspection and Sampling",
          "taskStatus": "Denied"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Post-Harvest Inspection and Sampling inspection is Cancelled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Post-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Cancelled"
          ]
        },
        "action": {
          "taskName": "Post-Harvest Inspection and Sampling",
          "taskStatus": "Cancelled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Post-Harvest Inspection and Sampling inspection is Pending.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Post-Harvest Inspection and Sampling"
          ],
          "inspectionResult": [
            "Pending"
          ]
        },
        "action": {
          "taskName": "Post-Harvest Inspection and Sampling",
          "taskStatus": "Pending"
        },
        "postScript": ""
      }
    ]
  }
}