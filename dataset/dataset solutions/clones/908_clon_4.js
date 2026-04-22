const process = require('process');

let incomingDataBuffer = '';
process.stdin.on('data', (inputChunk) => {
    incomingDataBuffer += inputChunk;
});

process.stdin.on('end', () => {
    const tokenizedInput = incomingDataBuffer.trim().split(/\s+/);
    let tokenIndex = 0;

    const extractNumber = () => Number(tokenizedInput[tokenIndex++]);
    const extractString = () => tokenizedInput[tokenIndex++];
    const deliverOutput = (message) => console.log(message);

    executeParenthesesSolver(extractNumber, extractString, deliverOutput);
});

const analyzeSegmentBalance = (segmentText) => {
    const finalState = Array.from(segmentText).reduce((currentCounts, charSymbol) => {
        if (charSymbol === '(') {
            currentCounts.openParentheses++;
        } else { // charSymbol === ')'
            if (currentCounts.openParentheses > 0) {
                currentCounts.openParentheses--;
            } else {
                currentCounts.unmatchedClosing++;
            }
        }
        return currentCounts;
    }, { unmatchedClosing: 0, openParentheses: 0 });

    return { prefixDeficit: finalState.unmatchedClosing, suffixSurplus: finalState.openParentheses };
};

const determineSegmentOrder = (segmentA, segmentB) => {
    const netValueA = segmentA.suffixSurplus - segmentA.prefixDeficit;
    const netValueB = segmentB.suffixSurplus - segmentB.prefixDeficit;

    if (netValueA < 0 && netValueB < 0) {
        return segmentA.prefixDeficit - segmentB.prefixDeficit;
    } else {
        return netValueB - netValueA;
    }
};

const executeParenthesesSolver = (getNumber, getString, display) => {
    const totalSegments = getNumber();
    const rawInputSegments = Array.from({ length: totalSegments }, () => getString());

    const processedSegments = rawInputSegments.map(analyzeSegmentBalance);

    processedSegments.sort(determineSegmentOrder);

    let currentBalanceLevel = 0;
    let overallSuccess = true;
    const availableSegmentIndices = new Set(Array.from({ length: totalSegments }, (_, i) => i));

    for (let attempt = 0; attempt < totalSegments; attempt++) {
        let segmentAttachedInThisAttempt = false;
        const currentAvailable = Array.from(availableSegmentIndices); // Snapshot to avoid issues with Set modification during iteration
        for (const segmentIndex of currentAvailable) {
            const segmentDetails = processedSegments[segmentIndex];
            if (currentBalanceLevel >= segmentDetails.prefixDeficit) {
                currentBalanceLevel += (segmentDetails.suffixSurplus - segmentDetails.prefixDeficit);
                availableSegmentIndices.delete(segmentIndex);
                segmentAttachedInThisAttempt = true;
                break;
            }
        }

        if (!segmentAttachedInThisAttempt) {
            overallSuccess = false;
            break;
        }
    }

    display(overallSuccess && currentBalanceLevel === 0 ? 'Yes' : 'No');
};