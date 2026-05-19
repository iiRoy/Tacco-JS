"use strict";

const getStandardInputContent = () => {
    const fileSystemModule = require('fs');
    const inputFilePath = '/dev/stdin';
    const fileEncoding = 'utf8';
    return fileSystemModule.readFileSync(inputFilePath, fileEncoding);
};

const processInputData = rawInputString => {
    const lineSeparator = "\n";
    const elementDelimiter = ",";
    const outputJoiner = " ";

    const trimmedInput = rawInputString.trim();
    const allInputLines = trimmedInput.split(lineSeparator);

    const targetLine = allInputLines[0];

    const parsedElements = targetLine.split(elementDelimiter);

    console.log(parsedElements.join(outputJoiner));
};

processInputData(getStandardInputContent());
