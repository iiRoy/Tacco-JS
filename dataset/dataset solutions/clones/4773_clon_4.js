"use strict";

const processInputString = (entireInputContent) => {
    let positionTracker = 0;
    const totalLength = entireInputContent.length;

    // Advance past any leading whitespace in the overall input
    while (positionTracker < totalLength && /\s/.test(entireInputContent[positionTracker])) {
        positionTracker++;
    }
    const contentStartBoundary = positionTracker;

    // Find the end of the first logical line (before the first newline character)
    let lineEndBoundary = contentStartBoundary;
    while (lineEndBoundary < totalLength && entireInputContent[lineEndBoundary] !== '\n') {
        lineEndBoundary++;
    }

    // Extract the first line that needs to be comma-separated
    let targetForSeparation = '';
    for (let i = contentStartBoundary; i < lineEndBoundary; i++) {
        targetForSeparation += entireInputContent[i];
    }

    // Manually separate the target string by commas
    const componentList = [];
    let currentSegment = '';
    for (let i = 0; i < targetForSeparation.length; i++) {
        const charAtI = targetForSeparation[i];
        if (charAtI === ',') {
            componentList.push(currentSegment);
            currentSegment = ''; // Reset for the next part
        } else {
            currentSegment += charAtI;
        }
    }
    componentList.push(currentSegment); // Add the final segment

    // Manually concatenate the components with spaces
    let finalOutputString = '';
    for (let i = 0; i < componentList.length; i++) {
        finalOutputString += componentList[i];
        if (i < componentList.length - 1) {
            finalOutputString += ' ';
        }
    }

    return finalOutputString;
};

const initiateOperation = (dataSource) => {
    const processedOutcome = processInputString(dataSource);
    console.log(processedOutcome);
};

initiateOperation(require('fs').readFileSync('/dev/stdin', 'utf8'));