const dataVault = [];

const interactionAgent = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

interactionAgent.on('line', (entry) => {
    dataVault.push(entry);
});

interactionAgent.on('close', () => {
    processCapturedInput(dataVault);
});

function processCapturedInput(allEntries) {
    const configLine = allEntries[0].split(" ");
    const sequenceLength = Number(configLine[0]);
    const maxZeroFlips = Number(configLine[1]);

    const binarySequence = allEntries[1];

    const segmentMeasures = deriveSegmentLengths(binarySequence);

    const finalOutcome = computeMaximalConsecutiveOnes(segmentMeasures, maxZeroFlips);

    console.log(finalOutcome);
}

function deriveSegmentLengths(sourceString) {
    const spanCollection = [];
    let activeSegmentType = 1; 
    let currentRunCount = 0;   

    for (let i = 0; i < sourceString.length; i++) {
        const currentDigit = Number(sourceString[i]);
        if (currentDigit === activeSegmentType) {
            currentRunCount++;
        } else {
            spanCollection.push(currentRunCount);
            activeSegmentType = 1 - activeSegmentType; 
            currentRunCount = 1; 
        }
    }

    if (currentRunCount !== 0) {
        spanCollection.push(currentRunCount);
    }

    if (spanCollection.length % 2 === 0) {
        spanCollection.push(0);
    }

    return spanCollection;
}

function computeMaximalConsecutiveOnes(segmentCounts, allowedFlips) {
    const cumulativeSums = new Array(segmentCounts.length + 1).fill(0);
    for (let i = 0; i < segmentCounts.length; i++) {
        cumulativeSums[i + 1] = cumulativeSums[i] + segmentCounts[i];
    }

    let greatestLength = 0;
    const windowBlockCount = 2 * allowedFlips + 1;

    for (let currentStartIdx = 0; currentStartIdx < segmentCounts.length; currentStartIdx += 2) {
        let windowEndIdx = currentStartIdx + windowBlockCount;

        if (windowEndIdx > segmentCounts.length) {
             windowEndIdx = segmentCounts.length;
        }

        const currentWindowSum = cumulativeSums[windowEndIdx] - cumulativeSums[currentStartIdx];
        if (currentWindowSum > greatestLength) {
            greatestLength = currentWindowSum;
        }
    }

    return greatestLength;
}