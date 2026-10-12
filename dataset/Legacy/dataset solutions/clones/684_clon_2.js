var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineBuffer = (rawData.trim()).split("\n");

while (true) {
    var numAndSum = lineBuffer.shift().split(" ").map(Number);

    var count = numAndSum[0];
    var targetSum = numAndSum[1];

    if (count === 0 && targetSum === 0) {
        break;
    }

    var numbersList = [];
    for (var idx1 = 0; idx1 < count; idx1++) {
        var currentNum = lineBuffer.shift() - 0;
        numbersList.push(currentNum);
    }

    numbersList.sort(function(valA, valB) {
        return valA - valB;
    });

    var sumCounts = [];
    for (var idx1 = 0; idx1 <= 200; idx1++) {
        sumCounts[idx1] = 0;
    }

    for (var idx1 = 0; idx1 < count; idx1++) {
        for (var idx2 = idx1 + 1; idx2 < count; idx2++) {
            sumCounts[numbersList[idx1] + numbersList[idx2]]++;
        }
    }

    var resultCount = 0;
    for (var idx1 = targetSum + 1; idx1 <= 200; idx1++) {
        resultCount += sumCounts[idx1];
    }

    console.log(resultCount);
}
