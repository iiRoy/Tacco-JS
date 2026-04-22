"use strict";

const convertToNumber = (textPart) => {
    return Number(textPart);
};

const parseAllTokens = (rawTextContent) => {
    return rawTextContent
        .split('\n')
        .flatMap(lineSection => lineSection.trim().split(' '))
        .filter(wordItem => wordItem !== '')
        .map(convertToNumber);
};

const computeFinalResult = (fullInputStream) => {
    const orderedNumbers = parseAllTokens(fullInputStream);

    const valueOne = orderedNumbers[0];
    const valueTwo = orderedNumbers[1];

    return valueOne - valueTwo + 1;
};

module.exports = computeFinalResult;