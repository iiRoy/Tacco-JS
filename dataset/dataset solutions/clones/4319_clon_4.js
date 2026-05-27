"use strict";

const processInputData = (sourceText) => {
    const cleanedLines = sourceText.trim().split("\n");
    const targetLine = cleanedLines[0];

    const foundOnes = targetLine.match(/1/g);
    
    const finalCount = foundOnes ? foundOnes.length : 0;
    
    console.log(finalCount);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
