"use strict";

const generateIntegerSequence = (startValue, endValue) => {
    const sequenceContainer = [];
    let currentNumber = startValue;
    while (currentNumber <= endValue) {
        sequenceContainer.push(currentNumber);
        currentNumber++;
    }
    return sequenceContainer;
};

const displaySegment = (sourceArray, startIndex, endIndex) => {
    for (let i = startIndex; i <= endIndex; i++) {
        console.log(sourceArray[i]);
    }
};

const processAndOutput = (rawInputData) => {
    const numericStrings = rawInputData.split(" ");
    const [paramA, paramB, paramK] = numericStrings.map(Number);

    const fullNumericSequence = generateIntegerSequence(paramA, paramB);
    const totalSequenceLength = fullNumericSequence.length;

    const limitForDisplay = paramK;

    // Determine and display the initial segment
    const firstSegmentUpperIndex = Math.min(limitForDisplay - 1, totalSequenceLength - 1);
    if (firstSegmentUpperIndex >= 0) {
        displaySegment(fullNumericSequence, 0, firstSegmentUpperIndex);
    }

    // Determine and display the trailing segment
    const lastSegmentLowerIndex = Math.max(0, totalSequenceLength - limitForDisplay);
    const lastSegmentUpperIndex = totalSequenceLength - 1;
    
    displaySegment(fullNumericSequence, lastSegmentLowerIndex, lastSegmentUpperIndex);
};

processAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
