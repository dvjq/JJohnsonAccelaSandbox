function multco_getAllAncestors(pAppType) {
    // deduplicates any ancestors from multco_getAllAncestorsTreeView() while removing level/depth info, 
    // and filters by pAppType (optional) [similar to getParents()]
    // returning a capId array of all parent caps.

    // Optional second parameter, cap ID to load from:
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1];

    var retArray = new Array();
    var loadedRecords = new Array();
    var ancestors = multco_getAllAncestorsTreeView(itemCap);
    var includeRecord = true;
    logDebug("ancestors " + ancestors.length);
    for (p in ancestors) {
        if (pAppType != null) {
            includeRecord = appMatch(pAppType, ancestors[p].record);
        }
        if (includeRecord && (loadedRecords.indexOf(ancestors[p].record + "") == -1)) {
            retArray.push(ancestors[p].record);
            loadedRecords.push(ancestors[p].record + "");
        }
    }
    return retArray;
}

function multco_getAllAncestorsTreeView(nodeId) {
    var allAncestors = new Array();
    multco_recurseAncestors(allAncestors, nodeId, 1);
    return allAncestors;
}

function multco_recurseAncestors(additiveArray, nodeId, depth) {
    var directParentsResult = aa.cap.getProjectByChildCapID(nodeId, 'R', null);
    if (directParentsResult.getSuccess()) {
        tmpdirectParents = directParentsResult.getOutput();
        var loopyArray = tmpdirectParents.slice();
        for (p in loopyArray) {

            var aObj = new Object();
            aObj.record = loopyArray[p].getProjectID();
            aObj.depth = depth;
            additiveArray.push(aObj);

            multco_recurseAncestors(additiveArray, aObj.record, depth + 1);
        }
    }
}

function multco_outputAncestorRecord(record, depth) {
    var id1 = record.getID1();
    var id2 = record.getID2();
    var id3 = record.getID3();
    if (depth > 0) {
        var indenter = "";
        for (var i = 0; i < depth; i++) {
            indenter = indenter + "     ";
        }
        logDebug(indenter + "level(s) up: " + depth + " capID: " + aa.cap.getCapID(id1, id2, id3).getOutput() + " altID: " + aa.cap.getCapID(id1, id2, id3).getOutput().getCustomID());
    } else {
        logDebug(" capID: " + aa.cap.getCapID(id1, id2, id3).getOutput() + " altID: " + aa.cap.getCapID(id1, id2, id3).getOutput().getCustomID());
    }
}