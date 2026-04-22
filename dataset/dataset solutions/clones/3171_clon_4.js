"use strict";

var fileSystemOperations = require("fs");

var calculateEntryValue = function(entryLine) {
    var components = entryLine.split(/\s+/);
    var numericalAmount = parseFloat(components[0]);
    var currencyIdentifier = components[1];

    var conversionMap = new Map();
    conversionMap.set('BTC', 380000.0);

    var factor = conversionMap.has(currencyIdentifier) ? conversionMap.get(currencyIdentifier) : 1.0;

    return numericalAmount * factor;
};

function processSourceMaterial(initialContent) {
    var dataRows = initialContent.toString().split(/\r?\n/);
    var entryCount = parseFloat(dataRows[0]);

    var accumulatedTotal = dataRows.slice(1, entryCount + 1).reduce(function(currentAccumulator, currentLine) {
        if (currentLine.trim() === '') {
            return currentAccumulator;
        }
        return currentAccumulator + calculateEntryValue(currentLine);
    }, 0.0);

    process.stdout.write(accumulatedTotal.toString() + '\n');
}

processSourceMaterial(fileSystemOperations.readFileSync("/dev/stdin", "utf8"));