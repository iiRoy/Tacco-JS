var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

function getNextLine(dataLines) {
    return dataLines.shift();
}

function getNextLineAsInteger(dataLines) {
    return parseInt(dataLines.shift(), 10);
}

function handleBidirectionalAlias(aliasMap, keyA, keyB) {
    const hasKeyA = aliasMap.hasOwnProperty(keyA);
    const hasKeyB = aliasMap.hasOwnProperty(keyB);

    if (!hasKeyA && !hasKeyB) {
        aliasMap[keyA] = keyB;
        aliasMap[keyB] = keyA;
    } else if (hasKeyA && !hasKeyB) {
        aliasMap[keyB] = aliasMap[keyA];
        aliasMap[keyA] = keyB;
    } else if (!hasKeyA && hasKeyB) {
        aliasMap[keyA] = aliasMap[keyB];
        aliasMap[keyB] = keyA;
    } else { // Both exist
        const tempValue = aliasMap[keyA];
        aliasMap[keyA] = aliasMap[keyB];
        aliasMap[keyB] = tempValue;
    }
}

function handleUnidirectionalAlias(aliasMap, sourceKey, targetKey) {
    if (aliasMap.hasOwnProperty(targetKey)) {
        aliasMap[sourceKey] = aliasMap[targetKey];
    } else {
        aliasMap[sourceKey] = targetKey;
    }
}

var lines = rawData.trim().split("\n");

var numInitialOperations = getNextLineAsInteger(lines); // Original 'n', unused but read
var [firstTerm, commonDiff] = getNextLine(lines).split(" ").map(Number);

var aliasMap = {};
var numQueries = getNextLineAsInteger(lines);

for (var queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    var queryParts = getNextLine(lines).split(" ");
    var opType = queryParts[0];
    var key1 = queryParts[1];
    var key2 = queryParts[2];

    if (opType === "0") {
        handleBidirectionalAlias(aliasMap, key1, key2);
    } else {
        handleUnidirectionalAlias(aliasMap, key1, key2);
    }
}

var finalKeyCandidate = getNextLine(lines);

if (aliasMap.hasOwnProperty(finalKeyCandidate)) {
    finalKeyCandidate = aliasMap[finalKeyCandidate];
}

var finalKeyNumeric = parseInt(finalKeyCandidate, 10);

console.log(firstTerm + ((finalKeyNumeric - 1) * commonDiff));
