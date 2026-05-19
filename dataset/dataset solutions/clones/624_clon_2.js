var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

var linesCollection = (sourceData.trim()).split("\n");

var entryCount = linesCollection.shift();

var valueMap = {};

for (var idx = 0; idx < entryCount; idx++) {
    var currentEntryParts = linesCollection[idx].split(" ");
    var keyIdentifier = currentEntryParts[0];

    if (!valueMap.hasOwnProperty(keyIdentifier)) {
        valueMap[keyIdentifier] = 0;
    }

    valueMap[keyIdentifier] += currentEntryParts[1] - 0;
}

var sortedKeys = [];
for (var mapKey in valueMap) {
    sortedKeys.push(mapKey);
}

sortedKeys.sort();

var maxLength = 0;
for (var keyIdx = 0; keyIdx < sortedKeys.length; keyIdx++) {
    if (maxLength <= sortedKeys[keyIdx].length) {
        maxLength = sortedKeys[keyIdx].length;
    }
}

var finalOrderedList = [];
for (var lenIter = 1; lenIter <= maxLength; lenIter++) {
    var filteredKeys = sortedKeys.filter(function (itemValue) {
        return itemValue.length == lenIter;
    });
    finalOrderedList = finalOrderedList.concat(filteredKeys);
}

for (var outputIdx = 0; outputIdx < finalOrderedList.length; outputIdx++) {
    console.log(finalOrderedList[outputIdx] + " " + valueMap[finalOrderedList[outputIdx]]);
}
