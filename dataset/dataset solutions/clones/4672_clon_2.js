var inputBuffer = [];

var lineReaderModule = require('readline');

var inputHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

inputHandler.on('close', function () {
    var initialConfigStr = inputBuffer.shift();

    var totalElements = initialConfigStr.split(" ")[0];
    var minSelection = initialConfigStr.split(" ")[1];
    var maxSelection = initialConfigStr.split(" ")[2];
    var dataValues = Array(totalElements);

    initialConfigStr = inputBuffer.shift().split(" ");
    for (var idx = 0; idx < totalElements; idx++) {
        dataValues[idx] = Number(initialConfigStr[idx]);
    }

    dataValues.sort(function (firstVal, secondVal) { return (secondVal - firstVal); });
    var calculatedAverage = 0;
    var valueCounts = {};

    for (var idx = 0; idx < totalElements; idx++) {
        if (idx < minSelection) calculatedAverage += dataValues[idx];
        if (valueCounts[dataValues[idx]] === undefined) { valueCounts[dataValues[idx]] = 0; }

        valueCounts[dataValues[idx]]++;
    }
    calculatedAverage /= minSelection;
    console.log(calculatedAverage);


    var processedCount = 0; var tempVarOne = 1;

    if (dataValues[0] !== dataValues[maxSelection - 1]) {
        var totalCombinations = 1;
        for (var idx = 0; idx < totalElements; idx++) {
            if (valueCounts[dataValues[idx]] >= 2) {
                var numToSelect;
                if (valueCounts[dataValues[idx]] > (minSelection - processedCount)) {
                    numToSelect = minSelection - processedCount;
                } else {
                    numToSelect = valueCounts[dataValues[idx]];
                }
                totalCombinations *= calculateCombinations(valueCounts[dataValues[idx]], numToSelect);
                processedCount += valueCounts[dataValues[idx]];
                idx += valueCounts[dataValues[idx]] - 1;
            }
            else {
                processedCount += valueCounts[dataValues[idx]];
            }
        }
    }
    else {
        var totalCombinations = 0;
        for (var loopIndex = 1; loopIndex <= maxSelection; loopIndex++) {
            totalCombinations += calculateCombinations(maxSelection, loopIndex);
        }
    }
    console.log(totalCombinations);

});

function calculatePermutations(totalItems, selectedItems) {
    var resultProduct = 1;
    for (var idx = 0; idx < selectedItems; idx++) {
        resultProduct *= totalItems - idx;
    }
    return resultProduct;
}

function calculateCombinations(totalItems, selectedItems) {
    return calculatePermutations(totalItems, selectedItems) / calculatePermutations(selectedItems, selectedItems);
}
