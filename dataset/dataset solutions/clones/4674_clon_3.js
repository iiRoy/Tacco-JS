"use strict";

const PRIMARY_INDICATOR_MATCH = "D";
const SECONDARY_VALUE_TARGET = "H";
const DEFAULT_INPUT_ENCODING = 'utf8';
const SYSTEM_INPUT_PATH = '/dev/stdin';

const presentOutcome = (finalResult) => {
    console.log(finalResult);
};

const processComplexInput = (payloadString) => {
    if (!payloadString || typeof payloadString !== 'string' || payloadString.trim() === '') {
        presentOutcome("INPUT_EMPTY_OR_INVALID");
        return;
    }

    const allLines = payloadString.split("\n");
    const firstRelevantLine = allLines[0];

    if (!firstRelevantLine || firstRelevantLine.trim() === '') {
        presentOutcome("EMPTY_LINE_ENCOUNTERED");
        return;
    }

    const separatedTokens = firstRelevantLine.split(" ");

    if (separatedTokens.length < 2) {
        presentOutcome("INSUFFICIENT_DATA_ELEMENTS");
        return;
    }

    const principalMark = separatedTokens[0];
    const subordinateValue = separatedTokens[1];

    let computedResult;

    if (principalMark === PRIMARY_INDICATOR_MATCH) {
        if (subordinateValue === SECONDARY_VALUE_TARGET) {
            computedResult = PRIMARY_INDICATOR_MATCH;
        } else {
            computedResult = SECONDARY_VALUE_TARGET;
        }
    } else {
        computedResult = subordinateValue;
    }

    presentOutcome(computedResult);
};

try {
    const rawContent = require('fs').readFileSync(SYSTEM_INPUT_PATH, DEFAULT_INPUT_ENCODING);
    processComplexInput(rawContent);
} catch (fileReadError) {
    console.error("Critical error during file read operation:", fileReadError.message);
    presentOutcome("FILE_READ_ERROR");
}