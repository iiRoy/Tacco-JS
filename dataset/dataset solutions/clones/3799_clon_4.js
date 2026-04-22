"use strict";

function retrieveNumericSequenceData(sourceTextContent) {
    const elements = sourceTextContent.split(/\s+/).filter(unit => unit.length > 0);
    let elementCursor = 0;

    const fetchNextInteger = () => {
        if (elementCursor >= elements.length) {
            throw new Error("Insufficient data units for parsing.");
        }
        return parseInt(elements[elementCursor++], 10);
    };

    const fetchIntegerCollection = (quantity) => {
        const collectionResult = new Array(quantity);
        for (let k = 0; k < quantity; k++) {
            collectionResult[k] = fetchNextInteger();
        }
        return collectionResult;
    };

    return { fetchNextInteger, fetchIntegerCollection };
}

function computePermissibleSubarrays(inputDatasetString) {
    const dataInterpreter = retrieveNumericSequenceData(inputDatasetString);
    const arraySize = dataInterpreter.fetchNextInteger();
    const numericArray = dataInterpreter.fetchIntegerCollection(arraySize);

    const maxRelevantBitPositions = 20;
    let totalAcceptableSequences = 0;
    let currentWindowStart = 0;
    const bitFrequencyCounters = new Array(maxRelevantBitPositions).fill(0);

    const checkBitCollisionStatus = (frequencies) => {
        for (let bitIndex = 0; bitIndex < maxRelevantBitPositions; bitIndex++) {
            if (frequencies[bitIndex] > 1) {
                return true; // Collision detected for this bit position
            }
        }
        return false; // No collisions within the current window
    };

    for (let currentWindowEnd = 0; currentWindowEnd < arraySize; currentWindowEnd++) {
        const incomingValue = numericArray[currentWindowEnd];

        // Incorporate the new value into the sliding window
        for (let currentBitPosition = 0; currentBitPosition < maxRelevantBitPositions; currentBitPosition++) {
            if ((incomingValue >> currentBitPosition) & 1) {
                bitFrequencyCounters[currentBitPosition]++;
            }
        }

        // Adjust the window from the left if any bit collision is found
        while (checkBitCollisionStatus(bitFrequencyCounters)) {
            const outgoingValue = numericArray[currentWindowStart];
            for (let currentBitPosition = 0; currentBitPosition < maxRelevantBitPositions; currentBitPosition++) {
                if ((outgoingValue >> currentBitPosition) & 1) {
                    bitFrequencyCounters[currentBitPosition]--;
                }
            }
            currentWindowStart++;
        }

        // All subarrays ending at currentWindowEnd and starting from currentWindowStart are valid
        totalAcceptableSequences += (currentWindowEnd - currentWindowStart + 1);
    }

    console.log(totalAcceptableSequences);
}

if (typeof window === "undefined") {
    computePermissibleSubarrays(require("fs").readFileSync("/dev/stdin", "utf8"));
}