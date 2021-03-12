/*
 This function finds the JSON file associated to the module of the record running. 
 The naming convention for the JSON is CONFIGURABLE_RULESET_[solution/module name], 
	for instance CONFIGURABLE_RULESET_LICENSES
 The JSON includes the scripts to be called by event for that solution/module, as an array.
 This function is called from every event Master Script. 
 Sample JSON:
 {
  "WorkflowTaskUpdateAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_INSPECTION_SCHEDULING",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "ApplicationSubmitBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION",
      "STDBASE_ADDRESS_VALIDATION",
      "STDBASE_PARCEL_VALIDATION"
    ]
  },
  "ApplicationSubmitAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  }
}
 */

function doConfigurableScriptActions() {
	var module = "";

	if (appTypeArray && appTypeArray[0] != undefined) {
		module = appTypeArray[0];
	}

	if (typeof capId !== 'undefined') {
		if (module == "") {
			var itemCap = aa.cap.getCap(capId).getOutput();
			var itemCapModel = itemCap.getCapModel();
			module = itemCapModel.getModuleName();
		}
	}

	if (module != "") {
		rulesetName = "CONFIGURABLE_RULESET_" + module;
		rulesetName = rulesetName.toUpperCase();
		logDebug("rulesetName: " + rulesetName);

		try {
			var configRuleset = getScriptText(rulesetName);
			if (configRuleset == "") {
				logDebug("No JSON file exists for this module.");
			} else {
				var configJSON = JSON.parse(configRuleset);

				// match event, run appropriate configurable scripts
				settingsArray = [];
				if (configJSON[controlString]) {
					var ruleSetArray = configJSON[controlString];
					var scriptsToRun = ruleSetArray.StandardScripts;
					var customScriptsToRun = ruleSetArray.CustomScripts;
					var script;
					var validScript;

					for (var s in scriptsToRun) {

						if (exists(scriptsToRun[s], customScriptsToRun)) {
							logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s] + " Overridden in CustomScripts, Skipped.");
							continue;
						}

						logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
						script = scriptsToRun[s];
						validScript = getScriptText(script);
						if (validScript != "") {
							logDebug("Script " + script + " exist and executed from Non-Master scripts");
							eval(validScript);
						} else {
							eval(getScriptText(script, null, true)); // now calling this section from master scripts
						}
					}
					for (var cs in customScriptsToRun) {
						logDebug("doConfigurableScriptActions customScriptsToRun[cs]: " + customScriptsToRun[cs]);
						script = customScriptsToRun[cs];
						validScript = getScriptText(script);
						if (validScript == "") {
							logDebug("Configurable custom script " + script + " does not exist.");
						} else {
							eval(validScript);
						}
					}
				}
			}
		} catch (err) {
			logDebug("ERROR: doConfigurableScriptActions " + rulesetName + " Error Message:" + err.message);
			handleError(err);
		}
	}
}