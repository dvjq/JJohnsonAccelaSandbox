{
  "ApplicationSubmitBefore": {
    "StandardScripts": [
    ]
  },
  "ApplicationSubmitAfter": {
    "StandardScripts": [
    ]
  },
  "ConvertToRealCAPAfter": {
    "StandardScripts": [
      "STDBASE_COPY_RECORD_DATA"
    ]
  },
  "WorkflowTaskUpdateBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_RECORD_VALIDATION",
      "STDBASE_LICENSE_RENEWAL_ISSUANCE",
      "STDBASE_LICENSE_ISSUANCE",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "WorkflowTaskUpdateAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_RECORD_VALIDATION",
      "STDBASE_LICENSE_ISSUANCE",
      "STDBASE_LICENSE_RENEWAL_ISSUANCE",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "InspectionResultModifyAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION"
    ]
  },
  "InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION"
    ]
  },
  "InspectionScheduleAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_SCHEDULING",
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "V360InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION"
    ]
  }
}