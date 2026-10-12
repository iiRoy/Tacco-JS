"use strict";

const calculateSortedCharacterFrequencies = (inputStringSegment) => {
    const characterCounts = Array.from({ length: 26 }, () => 0); // Initialize an array for 26 lowercase letters
    const asciiOffsetForA = 97; // ASCII value for 'a'

    for (let charPosition = 0; charPosition < inputStringSegment.length; charPosition++) {
        const charCodeValue = inputStringSegment.charCodeAt(charPosition);
        const alphabetIndex = charCodeValue - asciiOffsetForA;
        characterCounts[alphabetIndex]++;
    }

    characterCounts.sort((valueA, valueB) => valueA - valueB); // Sort numerically
    return characterCounts;
};

const processInputData = (rawInput) => {
    const inputLines = rawInput.trim().split("\n");
    const firstInputString = inputLines[0];
    const secondInputString = inputLines[1];

    const sortedFreqMapA = calculateSortedCharacterFrequencies(firstInputString);
    const sortedFreqMapB = calculateSortedCharacterFrequencies(secondInputString);

    // Compare the string representations of the sorted frequency maps
    const areFrequencyMapsEquivalent = sortedFreqMapA.join("") === sortedFreqMapB.join("");

    if (areFrequencyMapsEquivalent) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
