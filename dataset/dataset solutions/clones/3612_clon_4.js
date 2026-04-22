"use strict";

const processEntry = (sourceData) => {
    const dataLines = sourceData.split('\n');
    const digitString = dataLines[0];
    const limitIndex = Number(dataLines[1]);

    const finalCharacter = Array.from(digitString)
        .map((singleDigit, currentPosition) => {
            return (singleDigit !== '1' && currentPosition < limitIndex) ? singleDigit : null;
        })
        .filter(potentialChar => potentialChar !== null)
        .shift()
        || '1';

    console.log(finalCharacter);
};

processEntry(require("fs").readFileSync("/dev/stdin", "utf8"));