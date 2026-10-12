"use strict";

const getAscendingSortedString = (sourceString) => {
    const characterArray = sourceString.split('');
    const sortedCharacterArray = characterArray.sort();
    const finalSortedString = sortedCharacterArray.join('');
    return finalSortedString;
};

const getDescendingSortedString = (sourceString) => {
    const characterArray = sourceString.split('');
    const tempSortedAscending = characterArray.sort();
    const sortedDescendingCharacterArray = tempSortedAscending.reverse();
    const finalReverseSortedString = sortedDescendingCharacterArray.join('');
    return finalReverseSortedString;
};

const processInput = (rawData) => {
    const cleanedInput = rawData.trim();
    const inputLines = cleanedInput.split('\n');

    const firstLineContent = inputLines[0];
    const secondLineContent = inputLines[1];

    const firstProcessedString = getAscendingSortedString(firstLineContent);
    const secondProcessedString = getDescendingSortedString(secondLineContent);

    const isFirstStringSmaller = firstProcessedString < secondProcessedString;

    if (isFirstStringSmaller) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
