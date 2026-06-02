"use strict";

const processInput = (inputContent) => {
    const processedLines = inputContent.trim().split("\n");

    const THRESHOLD_VALUE = 3200;

    const parsedNumber = parseInt(processedLines[0]);
    const outputString = processedLines[1];
    
    let finalResult;

    if (parsedNumber >= THRESHOLD_VALUE) {
        finalResult = outputString;
    } else {
        finalResult = "red";
    }
    
    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
