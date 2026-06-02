"use strict";

const processInput = (rawData) => {
    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineSegments = inputLines[0].split(" ");
    const elementCount = parseInt(firstLineSegments[0], 10);

    const numberStrings = inputLines[1].split(" ");
    const originalValues = numberStrings.map(numericString => parseInt(numericString, 10));

    const orderedValues = [...originalValues].sort((valA, valB) => valA - valB);

    const lowerMedianIndex = (elementCount / 2) - 1;
    const upperMedianIndex = elementCount / 2;

    const firstMedianValue = orderedValues[lowerMedianIndex];
    const secondMedianValue = orderedValues[upperMedianIndex];

    const outputResults = [];

    for (let currentIndex = 0; currentIndex < originalValues.length; currentIndex++) {
        const currentElement = originalValues[currentIndex];
        if (currentElement < secondMedianValue) {
            outputResults.push(secondMedianValue);
        } else {
            outputResults.push(firstMedianValue);
        }
    }

    console.log(outputResults.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
