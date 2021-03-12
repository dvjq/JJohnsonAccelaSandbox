function isMatchStringSplit(testString, matchString) {
	var wild = arguments[2] ? arguments[2] : "*";
	var split = arguments[3] ? arguments[3] : "/";
	var matchCount = 0;
	var loopsCount = 0;

	var testStringArray = String(testString).split(split);
	var matchStringArray = String(matchString).split(split);
	if (testStringArray.length == matchStringArray.length) {
		loopsCount = testStringArray.length;
		for (var i in testStringArray) {
			if (testStringArray[i].equals(matchStringArray[i]) || matchStringArray[i].equals(wild)) {
				matchCount++;
			}
		}
	} else {
		return false;
	}

	return matchCount == loopsCount;
}
