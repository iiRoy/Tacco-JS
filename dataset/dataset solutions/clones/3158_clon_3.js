"use strict";

const performRepeatedReplacement = (sourceString, patternToReplace) => {
    let currentStringState = sourceString;
    let previousStringState;

    do {
        previousStringState = currentStringState;
        currentStringState = previousStringState.split(patternToReplace).join("");
    } while (currentStringState !== previousStringState);

    return currentStringState;
};

const processInputData = (rawData) => {
    const targetString = rawData.split("\n")[0];
    
    const initialStringLength = targetString.length;

    let processedString = targetString;

    processedString = performRepeatedReplacement(processedString, "01");
    
    processedString = performRepeatedReplacement(processedString, "10");
 
    const finalStringLength = processedString.length;
    const totalCharactersRemoved = initialStringLength - finalStringLength;
    
    console.log(totalCharactersRemoved);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
