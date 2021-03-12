{
  "PublicWorks/Valet/Long-Term/Renewal": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy Contact Info from parent record to renewal record",
          "operators": {}
        },
        "criteria": {
          "recordType": "PublicWorks/Valet/Long-Term/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
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
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Copy data from Permit to Renewal",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "PublicWorks/Valet/Long-Term/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
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
  },
  "PublicWorks/Sidewalk Use/NA/Renewal": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy data from parent record to renewal record",
          "operators": {}
        },
        "criteria": {
          "recordType": "PublicWorks/Sidewalk Use/NA/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy data from parent record to renewal record",
          "operators": {}
        },
        "criteria": {
          "recordType": "PublicWorks/Sidewalk Use/NA/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ]
  },
  "PublicWorks/Accessible Parking/NA/Renewal": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy data from parent record to renewal record",
          "operators": {}
        },
        "criteria": {
          "recordType": "PublicWorks/Sidewalk Use/NA/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy data from parent record to renewal record",
          "operators": {}
        },
        "criteria": {
          "recordType": "PublicWorks/Sidewalk Use/NA/NA"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
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
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
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