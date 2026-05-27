"use strict";

function determineAndAdjustForNegabase(valueToProcess, oneDigitChar, zeroDigitChar) {
    let digitOutput;
    let adjustedValue = valueToProcess;

    if (adjustedValue % 2 !== 0) {
        adjustedValue--;
        digitOutput = oneDigitChar;
    } else {
        digitOutput = zeroDigitChar;
    }
    return { modifiedValue: adjustedValue, digit: digitOutput };
}

function ProcessInput(rawData) {
    const NEWLINE_DELIMITER = "\n";
    const WHITESPACE_REGEX = /\s/;
    const BASE_DIVISOR = -2;
    const ZERO_CHAR = "0";
    const ONE_CHAR = "1";

    let inputLines = rawData.split(NEWLINE_DELIMITER);
    let firstLineContent = inputLines.shift();
    let numString = firstLineContent.split(WHITESPACE_REGEX)[0];
    let currentNumber = Number(numString);

    let resultRepresentation = "";

    while (currentNumber !== 0) {
        let processingResult = determineAndAdjustForNegabase(currentNumber, ONE_CHAR, ZERO_CHAR);
        
        currentNumber = processingResult.modifiedValue;
        resultRepresentation = processingResult.digit + resultRepresentation;
        
        currentNumber /= BASE_DIVISOR;
    }

    if (resultRepresentation === "") {
        resultRepresentation = ZERO_CHAR;
    }

    console.log(resultRepresentation);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
