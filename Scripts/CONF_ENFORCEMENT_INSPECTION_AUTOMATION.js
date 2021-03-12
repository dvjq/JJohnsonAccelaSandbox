{
  "Enforcement/Property Maintenance/Site Visit/NA": {
    "InspectionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "Inspection",
          "taskStatus": "Reinspection",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      },
      {
        "preScript": "PRESCRIPT_VALIDATE_CHKLIST_ITEM_RESULT",
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": []
        },
        "action": {
          "caseCreationType": "Checklist",
          "caseFailureStatus": [
            "Demo Referral"
          ],
          "caseType": "Enforcement/Property Maintenance/Demolition/NA"
        },
        "postScript": "JSON_CUSTOM_COPY_APO"
      }
    ]
  },
  "Enforcement/Property Maintenance/*/*": {
    "InspectionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "",
          "taskStatus": "",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ],
    "InspectionResultModifyAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "",
          "taskStatus": "",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ]
  },
  "Enforcement/Incident/*/*": {
    "InspectionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "Inspection",
          "taskStatus": "Reinspection",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ],
    "InspectionResultModifyAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "Inspection",
          "taskStatus": "Reinspection",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ]
  },
  "Enforcement/Zoning/*/*": {
    "InspectionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "Inspection",
          "taskStatus": "Reinspection",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ],
    "InspectionResultModifyAfter": [
      {
        "metadata": {
          "description": "Inspection Automation",
          "operators": {}
        },
        "criteria": {
          "inspectionTypePerformed": [
            "New Complaint",
            "Follow-Up"
          ],
          "inspectionResult": [
            "Citation",
            "Citation Referral",
            "Violation Notice",
            "Emergency Referral"
          ]
        },
        "action": {
          "costRangeType": "",
          "costRange": "",
          "costFeeType": "",
          "costFeeSchedule": "",
          "costFeeName": "",
          "costFeeAmount": "",
          "newAppStatus": "",
          "caseCreationType": "",
          "caseFailureStatus": "",
          "caseType": "",
          "caseCopyComments": "",
          "inspectionType": "",
          "inspectionCopyComment": false,
          "rangeType": "Days",
          "range": "0",
          "expirationTypeUpdate": "",
          "expirationDaysToAdvance": "",
          "sameInspector": false,
          "createCondition": "",
          "createConditionType": "",
          "createConditionSeverity": "",
          "feeSchedule": "",
          "feeName": "",
          "feeAmount": "",
          "taskName": "Inspection",
          "taskStatus": "Reinspection",
          "removeCondition": "",
          "removeConditionType": ""
        },
        "postScript": "IRSA_PROCESS_ENF_VIOLATIONS"
      }
    ]
  }
}