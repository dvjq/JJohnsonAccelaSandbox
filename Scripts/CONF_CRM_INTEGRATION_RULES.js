/**
 * CONF_CRM_INTEGRATION_RULES
 * @namespace CONF_CRM_INTEGRATION_RULES
 * @example CRM to Core integration rules are configured in script: CONF_CRM_INTEGRATION_RULES
 * Example routing rule: If custom fields match
 *  var rules = {
  "ServiceRequest/Vehicles/Abandoned Vehicle/NA": {
		"Propogation_Rules": {
			"Update_Core_WF" : true,
			"Task": "Intake",
			"Set_Status": "Investigation",
			"Fire_ASA_Event":true,
			"Fire_WTUA_Event": false
		},
		"Custom_Field_Map": {
			"Additional Location Information": "Location"
		}
	}
  }
 */

var rules = {
    "ServiceRequest/*/*/*": {
        "Propogation_Rules": {
            "Update_Core_WF": false,
            "Task": "",
			"Set_Status": "",
			"Initial_Task":"Intake",
			"Fire_ASA_Event":true,
			"Fire_WTUA_Event": false
        },
        "Custom_Field_Map": {}
    },
    "ServiceRequest/Vehicles/Abandoned Vehicle/NA": {
        "Propogation_Rules": {
            "Update_Core_WF": false,
            "Task": "",
			"Set_Status": "",
			"Fire_ASA_Event":true,
            "Fire_WTUA_Event": false
	    	
        },
        "Custom_Field_Map": {
            "Additional Location Information": "Location"
        }
    }
};