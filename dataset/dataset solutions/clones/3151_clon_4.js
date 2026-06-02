"use strict";

const extractNumericValues = (rawInputContent) => {
    const firstLineSegment = rawInputContent.split('\n')[0];
    const spaceSeparatedTokens = firstLineSegment.split(' ');

    const numericalComponents = spaceSeparatedTokens.reduce((accumulator, currentToken, idx) => {
        if (idx < 3) {
            accumulator.push(parseInt(currentToken, 10));
        }
        return accumulator;
    }, []);

    return numericalComponents;
};

const processAndOutputResult = (inputDataString) => {
    const [alpha, beta, gamma] = extractNumericValues(inputDataString);

    const calculatedQuotient = Math.floor(beta / alpha);
    
    console.log(Math.min(gamma, calculatedQuotient));
};

processAndOutputResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
