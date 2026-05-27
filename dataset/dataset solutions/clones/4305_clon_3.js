"use strict";

const readStandardInput = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const CHAR_COUNT_TO_REMOVE = 8;

const processInputData = (inputBuffer) => {
    const trimmedContent = inputBuffer.trim();
    const lines = trimmedContent.split("\n");

    const firstLine = lines[0];

    const initialChars = firstLine.split("");

    const targetLength = initialChars.length - CHAR_COUNT_TO_REMOVE;

    const resultChars = initialChars.slice(0, targetLength);

    console.log(resultChars.join(""));
};

processInputData(readStandardInput());
