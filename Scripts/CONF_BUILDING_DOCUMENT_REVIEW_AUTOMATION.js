{
  "Building/Residential/Alteration/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Plans Distribution - Routed For Review will trigger document review tasks for the listed document types, for each workflowSubTask where the userDistrict and userDiciple match. It will use round robin assignment and update the document status to In Review",
          "operators": {}
        },
        "criteria": {
          "workflow": [
            {
              "task": "Plans Distribution",
              "status": "Routed for Review"
            }
          ]
        },
        "action": {
          "userDisciplines": [
            "Building Plan Reviewer"
          ],
          "userDistricts": [
            "ALL"
          ],
          "roundRobinAssignment": false,
          "documentTypes": [
            "Floor Plan",
            "Site Plans"
          ],
          "updateTasks": [
            {
              "task": "Building Review",
              "status": "Pending"
            }
          ],
          "daysOut": "10",
          "useCalendarDays": true,
          "updateDocumentStatus": "In Review"
        },
        "postScript ": ""
      }
    ]
  },
  "Building/Commercial/Alteration/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Plans Distribution - Routed For Review will trigger document review tasks for the listed document types, for each workflowSubTask where the userDistrict and userDiciple match. It will use round robin assignment and update the document status to In Review",
          "operators": {}
        },
        "criteria": {
          "workflow": [
            {
              "task": "Plans Distribution",
              "status": "Routed for Review"
            }
          ]
        },
        "action": {
          "userDisciplines": [
            "Building Plan Reviewer"
          ],
          "userDistricts": [
            "ALL"
          ],
          "roundRobinAssignment": false,
          "documentTypes": [
            "Floor Plan",
            "Site Plans"
          ],
          "updateTasks": [
            {
              "task": "Building Review",
              "status": "Pending"
            }
          ],
          "daysOut": "10",
          "useCalendarDays": true,
          "updateDocumentStatus": "In Review"
        },
        "postScript ": ""
      }
    ]
  }
}