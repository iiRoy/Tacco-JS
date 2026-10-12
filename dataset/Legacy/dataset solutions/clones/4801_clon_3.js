'use strict'
const processInputAndLog = (rawData) => {
    const trimmedData = rawData.trim();
    const processedLines = trimmedData.split("\n");
    const expressionToEvaluate = processedLines[0];
    console.log(eval(expressionToEvaluate));
};
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInputAndLog(standardInputContent);
