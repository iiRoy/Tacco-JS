var logOutput = console.log;

function obtainSourceData(sourceData) {
    var dataRows = sourceData.split("\n");
    return function () {
        return dataRows.shift();
    };
}

String.prototype.repeatString = function repeatString(count) {
    var resultantString = "";
    for (var idx = 0; idx < count; idx++) {
        resultantString += this.toString();
    }
    return resultantString;
};

function parseLineOfIntegers(inputLine, adjustForOneBased) {
    var parts = inputLine.split(' ');
    var valueOffset = adjustForOneBased ? -1 : 0;
    var parsedNumbers = [];
    for (var k = 0; k < parts.length; k++) {
        parsedNumbers.push(parseInt(parts[k]));
    }
    return parsedNumbers;
}

function generateSequence(startVal, endVal) {
    var sequenceArray = [];
    for (; startVal < endVal; startVal++) {
        sequenceArray.push(startVal);
    }
    return sequenceArray;
}

function findMaximum(valA, valB) {
    return valA > valB ? valA : valB;
}

function findMinimum(valC, valD) {
    return valC < valD ? valC : valD;
}

function createSorterByKey(keyName) {
    return function (elem1, elem2) {
        if (elem1[keyName] < elem2[keyName]) return -1;
        else if (elem1[keyName] > elem2[keyName]) return 1;
        return 0;
    };
}

/**
 * @return {number}
 */
Array.prototype.calculateTotal = function calculateTotal() {
    var totalValue = 0;
    this.forEach(function (elementItem) {
        totalValue += elementItem;
    });
    return totalValue;
};

Array.prototype.formatArrayElements = function formatArrayElements(){
    return this.map(function(currentValue){return ('        ' + currentValue).slice(-5)});
};


/*
 * This section contains general utility functions and array prototypes.
 * The main processing logic is encapsulated in the processMainLogic function.
 * The program reads numerical data, processes it, and prints formatted output.
 */


// Main processing function for the input data
function processMainLogic(rawData) {

    var inputLines = rawData.split("\n");
    while (inputLines.length > 0) {
        var columnSums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var numRows = inputLines.shift() - 0;
        if (numRows === 0) {
            return;
        }
        for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
            var currentRowData = parseLineOfIntegers(inputLines.shift());
            currentRowData.push(currentRowData.calculateTotal());
            logOutput(currentRowData.formatArrayElements().join(''));
            for (var colIndex = 0; colIndex < numRows + 1; colIndex++) {
                columnSums[colIndex] += currentRowData[colIndex];
            }
        }
        logOutput(columnSums.splice(0, numRows + 1).formatArrayElements().join(''));
    }
}

// Execute the main logic by reading from a file
processMainLogic(require("fs").readFileSync("input.txt", "utf8"));
