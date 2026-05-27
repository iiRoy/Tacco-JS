"use strict";

const parseNumericStringArray = (inputStr) => {
    return inputStr.split(" ").map(valStr => parseInt(valStr, 10));
};

const processInputData = (rawInput) => {
    const processedLines = rawInput.trim().split("\n");

    const [firstLineContent, secondLineContent] = processedLines;

    const totalCount = parseInt(firstLineContent, 10);
    const dataElements = parseNumericStringArray(secondLineContent);
    
    let currentMatchSequence = 0;
    
    for (let elementIndex = 0; elementIndex < totalCount; elementIndex++) {
        const expectedValueInSequence = currentMatchSequence + 1;
        
        if (dataElements[elementIndex] === expectedValueInSequence) {
            currentMatchSequence++;
        }
    }
    
    let finalOutputValue;
    const hasAnyMatchOccurred = currentMatchSequence !== 0;

    if (hasAnyMatchOccurred) {
        finalOutputValue = totalCount - currentMatchSequence;
    } else {
        finalOutputValue = -1;
    }
    
    console.log(finalOutputValue);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
