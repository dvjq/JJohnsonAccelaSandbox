function sqlViaEMSE(sqlCMD, parameters) {
    var params = [];
    if (arguments.length == 2)
        params = parameters;

    var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
    var utilProcessor = new JavaAdapter(com.accela.aa.datautil.DBResultSetProcessor, {
        processResultSetRow: function (rs) {
            var meta = rs.getMetaData();
            var numcols = meta.getColumnCount();
            var record = {};
            var result = null;

            for (var i = 0; i < numcols; i++) {
                var columnName = meta.getColumnName(i + 1);
                columnName = columnName.toUpperCase();
                result = rs.getObject(i + 1);
                if (result == null) {
                    record[columnName] = String("");
                } else {
                    if (result.getClass && result.getClass().getName() == "java.sql.Timestamp") {
                        record[columnName] = String(new Date(rs.getTimestamp(i + 1).getTime()).toString("MM/dd/yyyy"));
                    } else {
                        record[columnName] = String(rs.getObject(i + 1));
                    }
                }
            }
            return record;
        }
    });

    var result = dba.select(sqlCMD, params, utilProcessor, null);

    var rowNum = 0;
    var res = result.toArray();
    return res;
}