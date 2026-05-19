var processInput = require('process').stdin;
var receivedData = "";

processInput.on('data', function (chunk) {
    receivedData += chunk;
});

processInput.on('end', function () {
    var dataLines = receivedData.split('\n');

    var firstLineParts = dataLines[0].match(/(-?\d+)\s+(-?\d+)/);
    var pointCount = parseInt(firstLineParts[1], 10);
    var selectionSize = parseInt(firstLineParts[2], 10);

    if (selectionSize === 0) {
        console.log(0);
        return;
    }

    var coefficientSets = new Map([
        ['setA', [1, 1, 1]],
        ['setB', [1, 1, -1]],
        ['setC', [1, -1, 1]],
        ['setD', [1, -1, -1]],
        ['setE', [-1, 1, 1]],
        ['setF', [-1, 1, -1]],
        ['setG', [-1, -1, -1]],
    ]);

    var topSumsBySet = new Map();
    for (let key of coefficientSets.keys()) {
        topSumsBySet.set(key, []);
    }

    for (var i = 0; i < pointCount; i++) {
        var currentPointParts = dataLines[i + 1].match(/(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
        var coordX = parseInt(currentPointParts[1], 10);
        var coordY = parseInt(currentPointParts[2], 10);
        var coordZ = parseInt(currentPointParts[3], 10);

        for (let [setKey, coefficients] of coefficientSets.entries()) {
            var coeffA = coefficients[0];
            var coeffB = coefficients[1];
            var coeffC = coefficients[2];
            var transformedValue = coordX * coeffA + coordY * coeffB + coordZ * coeffC;
            var currentPQ = topSumsBySet.get(setKey);

            let insertIdx = 0;
            while (insertIdx < currentPQ.length && currentPQ[insertIdx] < transformedValue) {
                insertIdx++;
            }
            currentPQ.splice(insertIdx, 0, transformedValue);

            if (currentPQ.length > selectionSize) {
                currentPQ.shift();
            }
        }
    }

    var calculatedSetSums = [];
    for (let currentPQ of topSumsBySet.values()) {
        let currentSum = currentPQ.reduce((accumulator, value) => accumulator + value, 0);
        calculatedSetSums.push(currentSum);
    }

    var overallMaximum = -Infinity;
    for (let sumValue of calculatedSetSums) {
        if (sumValue > overallMaximum) {
            overallMaximum = sumValue;
        }
    }

    console.log(overallMaximum);
});
