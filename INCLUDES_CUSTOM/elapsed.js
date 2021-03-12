function elapsed(st) {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return (thisTime - st) / 1000;
}