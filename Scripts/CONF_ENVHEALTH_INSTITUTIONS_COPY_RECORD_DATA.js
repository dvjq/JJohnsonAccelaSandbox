{
  "EnvHealth/Institutions/*/Renewal": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Copy data from License to Renewal",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "EnvHealth/Institutions/*/Permit"
        },
        "action": {
          "usageType": "copyFromParent",
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [
            "ALL"
          ],
          "ASIT": [
            "ALL"
          ],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "Renewal": true,
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "Pageflow": [
      {
        "metadata": {
          "description": "Copy data from License to Renewal in Pageflow",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "EnvHealth/Institutions/*/Permit"
        },
        "action": {
          "usageType": "copyFromParent",
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [
            "ALL"
          ],
          "ASIT": [
            "ALL"
          ],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "Renewal": true,
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "ConvertToRealCapAfter_test": [
      {
        "metadata": {
          "description": "Copy data from License to Renewal",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "EnvHealth/Institutions/*/Permit"
        },
        "action": {
          "usageType": "copyFromParent",
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [
            "ALL"
          ],
          "ASIT": [
            "ALL"
          ],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "Renewal": true,
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ]
  }
}