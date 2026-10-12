'use strict';

function extractFirstLine(fullInputContent) {
    const LINE_DELIMITER = "\n";
    const allInputLines = fullInputContent.split(LINE_DELIMITER);
    return allInputLines[0];
}

function processInputData(sourceContent) {
    const initialLine = extractFirstLine(sourceContent);
    const characterArray = initialLine.split("");

    const TARGET_MODIFICATION_INDEX = 3;
    const REPLACEMENT_VALUE = "8";

    // Create a mutable copy to perform the modification
    let currentCharacterSequence = [...characterArray];
    currentCharacterSequence[TARGET_MODIFICATION_INDEX] = REPLACEMENT_VALUE;

    const finalStringResult = currentCharacterSequence.join("");
    console.log(finalStringResult);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const inputEncoding = "utf8";

const rawInputBuffer = fileSystemHandler.readFileSync(standardInputPath, inputEncoding);
processInputData(rawInputBuffer);
