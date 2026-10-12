"use strict";

// Helper function for InputParser to ensure a line is processed
function ensureLineIsSplitForParser(lineArray, index) {
    if (typeof lineArray[index] === "string") {
        lineArray[index] = lineArray[index].split(" ").reverse();
    }
}

// Helper for InputParser methods that read multiple lines
function processMultipleInputLines(parserInstance, numLines, returnAsString, lineProcessor) {
    var startIndex = parserInstance._currentLineIndex;
    var endIndex = startIndex + numLines;
    var linesToExtract = parserInstance._sourceLines.slice(startIndex, endIndex);
    parserInstance._currentLineIndex = endIndex; // Advance the line index

    if (returnAsString) {
        return linesToExtract;
    } else {
        return linesToExtract.map(lineProcessor);
    }
}

var InputParserFactory = (function () {
    function createInputParser(sourceText) {
        return new InputParser(sourceText);
    }

    function InputParser(sourceText) {
        this._sourceLines = sourceText.trim().split("\n");
        this._currentLineIndex = 0;
    }

    InputParser.prototype.readNextValue = function (asString) {
        var lines = this._sourceLines;
        var lineIndex = this._currentLineIndex;
        ensureLineIsSplitForParser(lines, lineIndex); // Use the helper

        var extractedValue = lines[lineIndex].pop();

        if (!lines[lineIndex].length) {
            this._currentLineIndex++;
        }
        return asString ? extractedValue : +extractedValue;
    };

    InputParser.prototype.readLineValues = function (asString) {
        var currentLineContent = this._sourceLines[this._currentLineIndex++];
        var valuesOnLine = currentLineContent.split(" ");
        return asString ? valuesOnLine : valuesOnLine.map(val => +val);
    };

    InputParser.prototype.readMatrix = function (numberOfRows, asString) {
        return processMultipleInputLines(this, numberOfRows, asString, rowString => {
            var rowValues = rowString.split(" ");
            return asString ? rowValues : rowValues.map(val => +val);
        });
    };

    InputParser.prototype.readRawLines = function (numberOfLines, asString) {
        return processMultipleInputLines(this, numberOfLines, asString, lineString => +lineString);
    };

    return createInputParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create a multi-dimensional array without using eval
function createMultiDimensionalArray(initialValue) {
    var dimensions = Array.prototype.slice.call(arguments, 1);
    var numDimensions = dimensions.length;

    if (numDimensions === 0) {
        return initialValue; // Handle case with no dimensions specified, though original implies at least one.
    }

    function buildNestedArray(currentDimensionIndex) {
        if (currentDimensionIndex === numDimensions - 1) {
            return Array(dimensions[currentDimensionIndex]).fill(initialValue);
        } else {
            return Array(dimensions[currentDimensionIndex]).fill(0).map(() => buildNestedArray(currentDimensionIndex + 1));
        }
    }
    return buildNestedArray(0);
}

// Helper function for the main calculation loop
function calculateMaxCountForDivisor(currentDivisor, totalItems, sortedFrequencies) {
    var currentMaxThreshold = Math.floor(totalItems / currentDivisor);
    var effectiveRemainingItems = totalItems;

    for (var freqIndex = 0; freqIndex < sortedFrequencies.length; freqIndex++) {
        var currentFrequency = sortedFrequencies[freqIndex];
        if (currentMaxThreshold < currentFrequency) {
            effectiveRemainingItems -= (currentFrequency - currentMaxThreshold);
        } else {
            // Optimization: Frequencies are sorted in descending order.
            // If currentMaxThreshold is already greater than or equal to
            // the current frequency, it will be for all subsequent frequencies too.
            break;
        }
    }
    return Math.floor(effectiveRemainingItems / currentDivisor);
}

console.log(solveProblem());

function solveProblem() {
    var totalItemCount = inputReader.readNextValue();
    var itemValues = inputReader.readLineValues();

    // Initialize frequency map using a simpler array creation and forEach
    var itemFrequencyMap = new Array(totalItemCount).fill(0);
    itemValues.forEach(item => {
        itemFrequencyMap[item - 1]++;
    });

    // Filter out zero frequencies and sort in descending order
    var nonZeroSortedFrequencies = itemFrequencyMap.filter(freq => freq > 0).sort((a, b) => b - a);

    var finalResults = [totalItemCount]; // The first answer element is always n

    // Iterate for divisors from 2 up to n
    for (var divisor = 2; divisor <= totalItemCount; divisor++) {
        if (nonZeroSortedFrequencies.length < divisor) {
            // If there are fewer distinct frequencies than the current divisor,
            // it's impossible to form groups, so the max count is 0.
            finalResults.push(0);
        } else {
            var calculatedMax = calculateMaxCountForDivisor(divisor, totalItemCount, nonZeroSortedFrequencies);
            finalResults.push(calculatedMax);
        }
    }
    return finalResults.join("\n");
}
