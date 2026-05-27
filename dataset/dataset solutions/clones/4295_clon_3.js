'use strict';

const retrieveInputContent = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

function processInputData(sourceText) {
    const firstLineOfInput = sourceText.split('\n')[0];
    const parsedTokens = firstLineOfInput.split(' ');

    const tokenA = parsedTokens[0];
    const tokenB = parsedTokens[1];
    const tokenC = parsedTokens[2];

    let finalOutputValue;

    if (tokenA === tokenB) {
        finalOutputValue = tokenC;
    } else {
        const isATokenEqualToCToken = (tokenA === tokenC);
        if (isATokenEqualToCToken) {
            finalOutputValue = tokenB;
        } else {
            finalOutputValue = tokenA;
        }
    }
    console.log(finalOutputValue);
}

processInputData(retrieveInputContent());
