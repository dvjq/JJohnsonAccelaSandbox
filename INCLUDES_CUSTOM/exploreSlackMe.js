function exploreSlackMe(obj) {
	var body = {};
	var headers = aa.util.newHashMap();
	headers.put("Content-Type", "application/json");

	var now = new Date();
	var datetime = [now.getMonth() + 1,
		now.getDate(),
		now.getFullYear()
	].join('/') + ":" + [now.getHours(),
		now.getMinutes(),
		now.getSeconds()
	].join(':');

	var msg = "@here " + aa.getServiceProviderCode() + " says: \n";
	msg += "________________________________________________\n";
	msg += "# This is a description of **" + obj + "**\n";
	msg += "## Methods-\n";
	for (var x in obj) {
		if (typeof (obj[x]) == "function") {
			msg += "### " + x + " \n";
		}
	}
	msg += "________________________________________________\n";
	msg += "## Properties-\n";
	for (var i in obj) {
		if (typeof (obj[i]) != "function") {
			msg += "### " + i + " = " + obj[i] +" \n";
		}
	}
	msg += "________________________________________________\n";
	msg += datetime + "\n";
	msg += "________________________________________________\n";
	body.text = msg;

	var apiURL = 'https://hooks.slack.com/services/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';

	var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));
	if (!result.getSuccess()) {
		logDebug("Slack get anonymous token error: " + result.getErrorMessage());
	} else {
		aa.print("Slack Results: " + result.getOutput());
	}
}