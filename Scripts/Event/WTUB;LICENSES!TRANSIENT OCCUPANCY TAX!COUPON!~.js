//PRJAUT-2017-00204 US #31 (462) 03/31/2019 (Yazan Barghouth)
if (wfTask == "Payment" && wfStatus == "Paid" && balanceDue != 0) {
	cancel = true;
	comment("Record balance is not $0.");
}