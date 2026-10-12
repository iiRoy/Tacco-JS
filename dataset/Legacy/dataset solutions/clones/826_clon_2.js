var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineBuffer = (rawData.trim()).split("\n");

while (true) {
    var entryCount = lineBuffer.shift() - 0;

    if (entryCount === 0) {
        break;
    }

    var resultsList = [];

    for (var idx = 0; idx < entryCount; idx++) {
        var currentEntry = (lineBuffer.shift()).split(" ");
        var entityName = currentEntry.shift();

        currentEntry = currentEntry.map(Number);
        currentEntry.unshift(entityName);

        (function (label, price, valA, valB, valC, valD, valE, valF, valS, valM) {
            var calcTime = valA + valB + valC + ((valD + valE) * valM);
            var calcProfit = (valF * valS * valM) - price;
            resultsList.push([label, calcProfit / calcTime]);
        }).apply(null, currentEntry);
    }

    resultsList.sort(function (itemA, itemB) {
        if (itemA[1] === itemB[1]) {
            return itemA[0] > itemB[0];
        } else {
            return itemB[1] - itemA[1];
        }
    });

    resultsList.forEach(function (item) {
        console.log(item[0]);
    });

    console.log("#");
}
