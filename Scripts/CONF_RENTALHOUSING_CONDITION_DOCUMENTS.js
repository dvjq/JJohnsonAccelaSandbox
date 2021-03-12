{
  "RentalHousing/Licenses/Short Term/Application": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Required Documents - Short Team Rental Application - Proof of Ownership",
          "operators": {}
        },
        "criteria": {
          "customFields": {
            "Are you the owner of the property?": "Yes"
          }
        },
        "action": {
          "requiredDocuments": [
            "Proof of Ownership"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required"
        },
        "postScript ": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Required Documents - Short Team Rental Application - Proof of Lease Agreement and Property Owner Consent",
          "operators": {}
        },
        "criteria": {
          "customFields": {
            "Are you the owner of the property?": "No"
          }
        },
        "action": {
          "requiredDocuments": [
            "Proof of Lease Agreement"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required"
        },
        "postScript ": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Required Documents - Short Team Rental Application - Proof of Lease Agreement",
          "operators": {}
        },
        "criteria": {
          "customFields": {
            "Is this property a part of a gated community?": "Yes"
          }
        },
        "action": {
          "requiredDocuments": [
            "Homeowners Association Approval Letter"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required"
        },
        "postScript ": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "General Required Documents - Short Team Rental Application",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [
            "Floor Plan",
            "Notice to Neighbors"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required"
        },
        "postScript ": ""
      }
    ],
    "ApplicationSubmitAfter": [
      {
        "preScript": " ",
        "metadata": {
          "description": "Update Document Categories",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [],
          "updateDocumentCategories": true
        },
        "postScript ": " "
      }
    ],
    "ConvertToRealCAPAfter": [
      {
        "preScript": " ",
        "metadata": {
          "description": "Update Document Categories",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [],
          "updateDocumentCategories": true
        },
        "postScript ": " "
      }
    ]
  },
  "RentalHousing/Registration/Application/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": " ",
        "metadata": {
          "description": "Update Document Categories",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [],
          "updateDocumentCategories": true
        },
        "postScript ": " "
      }
    ],
    "ConvertToRealCAPAfter": [
      {
        "preScript": " ",
        "metadata": {
          "description": "Update Document Categories",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [],
          "updateDocumentCategories": true
        },
        "postScript ": " "
      }
    ],
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Required Documents - Rental registration - Proof of Ownership",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "requiredDocuments": [
            "Proof of Ownership"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required"
        },
        "postScript ": ""
      }
    ]
  }
}