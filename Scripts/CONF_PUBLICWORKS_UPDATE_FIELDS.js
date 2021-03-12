{
  "PublicWorks/Curb Cut/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date upon application submittal",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
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
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
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
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Street Cut/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date upon application submittal",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
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
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
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
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Driveway/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date upon application submittal",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
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
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
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
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Fiber and Cable/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date upon application submittal",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
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
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
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
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Sewer Connection/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date upon application submittal",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
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
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
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
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  }
}