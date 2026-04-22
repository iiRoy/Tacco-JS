const inputReader = require('readline');
const outputDisplay = console.log;

async function initiateSequenceProcessing() {
    const dataStreamHandler = inputReader.createInterface({
        input: process.stdin,
        output: process.stdout,
        crlfDelay: Infinity
    });

    let collectedDataSegments = [];
    for await (const segment of dataStreamHandler) {
        collectedDataSegments.push(segment);
    }

    collectedDataSegments.shift();

    processDataSegmentPairs(collectedDataSegments);
}

function processDataSegmentPairs(remainingSegments) {
    if (remainingSegments.length === 0) {
        return;
    }

    try {
        const firstSource = remainingSegments[0];
        const secondSource = remainingSegments[1];

        const cleansedPrimary = extractAlphaLowercase(firstSource);
        const cleansedSecondary = extractAlphaLowercase(secondSource);

        const finalMetricValue = deriveComparativeMetric(cleansedPrimary, cleansedSecondary);
        outputDisplay(finalMetricValue);

        processDataSegmentPairs(remainingSegments.slice(2));

    } catch (issue) {
        outputDisplay(issue);
        return;
    }
}

function extractAlphaLowercase(sourceString) {
    return sourceString.replace(/[^a-z]/g, '');
}

function deriveComparativeMetric(sequenceA, sequenceB) {
    const lenA = sequenceA.length;
    const lenB = sequenceB.length;
    const memoMap = new Map();

    function calculateRecursiveMetric(idxA, idxB) {
        if (idxA < 0 || idxB < 0) {
            return 0;
        }

        const currentKey = `${idxA}-${idxB}`;
        if (memoMap.has(currentKey)) {
            return memoMap.get(currentKey);
        }

        const currentCharacterMatch = (sequenceA.codePointAt(idxA) === sequenceB.codePointAt(idxB) ? 1 : 0);

        let computedResult;
        if (idxA === 0 && idxB === 0) {
            computedResult = currentCharacterMatch;
        } else if (idxA === 0) {
            computedResult = Math.max(calculateRecursiveMetric(idxA, idxB - 1), currentCharacterMatch);
        } else if (idxB === 0) {
            computedResult = Math.max(calculateRecursiveMetric(idxA - 1, idxB), currentCharacterMatch);
        } else {
            const valueFromAbove = calculateRecursiveMetric(idxA - 1, idxB);
            const valueFromLeft = calculateRecursiveMetric(idxA, idxB - 1);
            const combinedPreviousValues = Math.max(valueFromAbove, valueFromLeft) + currentCharacterMatch;
            const capLimit = Math.min(idxA, idxB) + 1;
            computedResult = Math.min(combinedPreviousValues, capLimit);
        }

        memoMap.set(currentKey, computedResult);
        return computedResult;
    }

    return calculateRecursiveMetric(lenA - 1, lenB - 1);
}

if (typeof require !== 'undefined' && require.main === module) {
    initiateSequenceProcessing();
}