"use strict";

const getStandardInputContent = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const createAscendingSortedString = (sourceText) => {
    const charList = sourceText.split("");
    const sortedCharList = charList.sort();
    return sortedCharList.join("");
};

const createDescendingSortedString = (sourceText) => {
    const charList = sourceText.split("");
    const sortedCharList = charList.sort();
    const reversedSortedCharList = sortedCharList.reverse();
    return reversedSortedCharList.join("");
};

const executeComparisonLogic = (inputPayload) => {
    const lineSegments = inputPayload.split("\n");
    
    const firstSegment = lineSegments[0];
    const secondSegment = lineSegments[1];
    
    const firstProcessedString = createAscendingSortedString(firstSegment);
    const secondProcessedString = createDescendingSortedString(secondSegment);
    
    const isFirstLexicographicallySmaller = firstProcessedString < secondProcessedString;
    
    console.log(isFirstLexicographicallySmaller ? "Yes" : "No");
};

executeComparisonLogic(getStandardInputContent());
