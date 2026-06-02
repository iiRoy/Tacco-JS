var inputSource = require('process').stdin;
var rawDataBuffer = "";

inputSource.on('data', function (chunk) {
    rawDataBuffer += chunk;
});

inputSource.on('end', function () {
    var inputLines = rawDataBuffer.split('\n');

    function parseNumbersFromLine(lineString) {
        return lineString.split(' ').map(function (s) {
            return parseInt(s.trim(), 10);
        });
    }

    var firstLineNumbers = parseNumbersFromLine(inputLines[0]);
    var numItems = firstLineNumbers[0];
    var topCount = firstLineNumbers[1];

    if (topCount === 0) {
        console.log(0);
        return;
    }

    var coefficientCombinations = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1],
    ];

    var calculatedValuesPerCombination = coefficientCombinations.map(function () {
        return [];
    });

    function computeWeightedSum(coordX, coordY, coordZ, coeffA, coeffB, coeffC) {
        return coordX * coeffA + coordY * coeffB + coordZ * coeffC;
    }

    for (var itemIndex = 0; itemIndex < numItems; itemIndex++) {
        var currentCoords = parseNumbersFromLine(inputLines[itemIndex + 1]);
        var coordX = currentCoords[0];
        var coordY = currentCoords[1];
        var coordZ = currentCoords[2];

        for (var comboIndex = 0; comboIndex < coefficientCombinations.length; comboIndex++) {
            var currentCoefficients = coefficientCombinations[comboIndex];
            var coeffA = currentCoefficients[0];
            var coeffB = currentCoefficients[1];
            var coeffC = currentCoefficients[2];

            var sumValue = computeWeightedSum(coordX, coordY, coordZ, coeffA, coeffB, coeffC);
            calculatedValuesPerCombination[comboIndex].push(sumValue);
        }
    }

    function getSumOfTopMElements(dataArray, count) {
        var sortedArray = [...dataArray].sort(function (val1, val2) {
            return val2 - val1;
        });
        var topElements = sortedArray.slice(0, count);
        var sum = topElements.reduce(function (accumulator, currentVal) {
            return accumulator + currentVal;
        }, 0);
        return sum;
    }

    var maxSumsPerCombination = calculatedValuesPerCombination.map(function (currentArray) {
        return getSumOfTopMElements(currentArray, topCount);
    });

    maxSumsPerCombination.sort(function (sumA, sumB) {
        return sumB - sumA;
    });

    console.log(maxSumsPerCombination[0]);
});
