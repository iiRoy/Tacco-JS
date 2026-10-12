'use strict';

function getComparisonResult(firstValue, secondValue) {
    const areValuesIdentical = (firstValue == secondValue);
    if (areValuesIdentical) {
        return "H";
    } else {
        return "D";
    }
}

function processInputData(rawInputString) {
    const LINE_SEPARATOR = "\n";
    const VALUE_DELIMITER = " ";

    const allInputLines = rawInputString.split(LINE_SEPARATOR);
    const primaryInputLine = allInputLines[0];

    const extractedValues = primaryInputLine.split(VALUE_DELIMITER);

    const firstExtractedValue = extractedValues[0];
    const secondExtractedValue = extractedValues[1];

    const finalOutcome = getComparisonResult(firstExtractedValue, secondExtractedValue);
    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
