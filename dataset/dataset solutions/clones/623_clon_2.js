var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = (rawData.trim()).split("\n");

var entryCount = lineCollection.shift();

var dataMap = {};

for (var idx = 0; idx < entryCount; idx++) {
    var currentPair = lineCollection[idx].split(" ");
    var keyString = currentPair[0];

    if (!dataMap.hasOwnProperty(keyString)) {
        dataMap[keyString] = 0;
    }

    dataMap[keyString] += currentPair[1] - 0;
}

var sortedKeys = [];
for (var mapEntry in dataMap) {
    sortedKeys.push(mapEntry);
}

sortedKeys.sort();

for (var outputIdx = 0; outputIdx < sortedKeys.length; outputIdx++) {
    console.log(sortedKeys[outputIdx] + " " + dataMap[sortedKeys[outputIdx]]);
}
