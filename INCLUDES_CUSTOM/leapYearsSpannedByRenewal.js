this.leapYearsSpannedByRenewal = function() {
            var count = 0;

            var renewalDate = convertDate(sysDate);
            if(arguments.length == 1)
                renewalDate = convertDate(arguments[0]);

            if(renewalDate > b1ExpDate) {
                while(renewalDate.getFullYear() > b1ExpDate.getFullYear()) {
                    renewalDate.setFullYear(renewalDate.getFullYear() - 1);
                    aa.print(renewalDate.getFullYear());
                    if(renewalDate.getFullYear() % 4 == 0) {
                        count++;
                    }
                }
            } else {
                while(renewalDate.getFullYear() < b1ExpDate.getFullYear()) {
                    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                    aa.print(renewalDate.getFullYear());
                    if(renewalDate.getFullYear() % 4 == 0) {
                        count++;
                    }
                }
            }

            return count;
        };
