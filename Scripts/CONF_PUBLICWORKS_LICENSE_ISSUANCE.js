{
  "PublicWorks/ROW/Accessible Parking Zone/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "License Issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "PublicWorks/ROW/Accessible Parking Zone/License",
          "issuedStatus": "Active",
          "copyCF": true,
          "copyCT": true,
          "expirationType": "",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "",
          "contactType": "",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": "JSON_CUSTOM_EXP_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/License Agreement/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "License Issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "PublicWorks/ROW/License Agreement/License",
          "issuedStatus": "Active",
          "copyCF": true,
          "copyCT": true,
          "expirationType": "",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "",
          "contactType": "",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": "JSON_CUSTOM_EXP_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Loading Zone/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "License Issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "PublicWorks/ROW/Loading Zone/License",
          "issuedStatus": "Active",
          "copyCF": true,
          "copyCT": true,
          "expirationType": "",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "",
          "contactType": "",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": "JSON_CUSTOM_EXP_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Outdoor Seating/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "License Issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "PublicWorks/ROW/Outdoor Seating/License",
          "issuedStatus": "Active",
          "copyCF": true,
          "copyCT": true,
          "expirationType": "",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "",
          "contactType": "",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": "JSON_CUSTOM_EXP_UPDATE"
      }
    ]
  },
  "PublicWorks/ROW/Pole Banner/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "License Issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "PublicWorks/ROW/Pole Banner/License",
          "issuedStatus": "Active",
          "copyCF": true,
          "copyCT": true,
          "expirationType": "Days",
          "customExpirationFunction": "",
          "expirationPeriod": "365",
          "refLPType": "",
          "contactType": "",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        }
      }
    ]
  }
}