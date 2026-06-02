'use strict'

const processInput = (sourceText) => {
    const numberMatches = sourceText.match(/(\d+)\s+(\d+)/);
    
    const firstVal = +(numberMatches[1]);
    const secondVal = +(numberMatches[2]);

    const difference = firstVal - secondVal;
    const finalResult = (difference + Math.abs(difference)) / 2;

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
