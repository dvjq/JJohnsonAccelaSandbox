{
  "Enforcement/Property Maintenance/*/*": {
    "14 Days Past Due": {
      "notificationTemplate": "14_DAYS_PAST_DUE_NOTICE",
      "notificationReport": false,
      "notifyContactTypes": "Violator",
      "mailerSetType": "Invoice",
      "mailerSetStatus": "Open",
      "mailerSetPrefix": "INVOICE_14_DAY_PAST_DUE",
      "updateExpirationStatus": false,
      "updateRecordStatus": false,
      "updateWorkflowTask": "Payment",
      "updateWorkflowStatus": "Awaiting Payment",
      "nextNotificationDays": 15,
      "nextNotification": "30 Days Past Due",
      "assessFees": []
    },
    "30 Days Past Due": {
      "notificationTemplate": "30_DAYS_PAST_DUE_NOTICE",
      "notificationReport": false,
      "notifyContactTypes": "Violator",
      "mailerSetType": "Lien Notice",
      "mailerSetStatus": "Open",
      "mailerSetPrefix": "LIEN_PROCESSING",
      "updateExpirationStatus": false,
      "updateRecordStatus": false,
      "updateWorkflowTask": "Payment",
      "updateWorkflowStatus": "Lien Ready to File",
      "nextNotificationDays": 15,
      "nextNotification": "45 Days Past Due",
      "assessFees": []
    }
  },
  "Enforcement/Property Maintenance/Site Visit/*": {
    "45 Days Past Due": {
      "notificationTemplate": "45_DAYS_PAST_DUE_NOTICE",
      "notificationReport": false,
      "notifyContactTypes": "Violator",
      "mailerSetType": "Lien Notice",
      "mailerSetStatus": "Open",
      "mailerSetPrefix": "LIEN_PROCESSING",
      "updateExpirationStatus": false,
      "updateRecordStatus": false,
      "updateWorkflowTask": "Payment",
      "updateWorkflowStatus": "Lien Filed",
      "nextNotificationDays": 0,
      "nextNotification": "File Lien",
      "assessFees": [
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM",
          "feeCode": "C_R_ENF_20",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        },
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM",
          "feeCode": "C_R_ENF_30",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        }
      ]
    }
  },
  "Enforcement/Property Maintenance/Demolition/*": {
    "45 Days Past Due": {
      "notificationTemplate": "45_DAYS_PAST_DUE_NOTICE",
      "notificationReport": false,
      "notifyContactTypes": "Violator",
      "mailerSetType": "Lien Notice",
      "mailerSetStatus": "Open",
      "mailerSetPrefix": "LIEN_PROCESSING",
      "updateExpirationStatus": false,
      "updateRecordStatus": false,
      "updateWorkflowTask": "Payment",
      "updateWorkflowStatus": "Lien Filed",
      "nextNotificationDays": 0,
      "nextNotification": "File Lien",
      "assessFees": [
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM_DEMO",
          "feeCode": " ENF_PM_06",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        },
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM_DEMO",
          "feeCode": " ENF_PM_07",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        }
      ]
    }
  },
  "AMS/Property Maintenance/*/*": {
    "45 Days Past Due": {
      "notificationTemplate": "45_DAYS_PAST_DUE_NOTICE",
      "notificationReport": false,
      "notifyContactTypes": "Violator",
      "mailerSetType": "Lien Notice",
      "mailerSetStatus": "Open",
      "mailerSetPrefix": "LIEN_PROCESSING",
      "updateExpirationStatus": false,
      "updateRecordStatus": false,
      "updateWorkflowTask": "Payment",
      "updateWorkflowStatus": "Awaiting Payment - Lien Filed",
      "nextNotificationDays": 0,
      "nextNotification": "File Lien",
      "assessFees": [
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM_WO",
          "feeCode": "CR_WO_10",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        },
        {
          "issue_fee_if_balance_exists": false,
          "feeSchedule": "ENF_PM_WO",
          "feeCode": "CR_WO_30",
          "feeQuantity": 1,
          "feeInvoice": "Y",
          "feePeriod": "FINAL"
        }
      ]
    }
  }
}