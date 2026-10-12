function findPosition(arraySource, desiredValue, startIndex, endIndex, exclusiveComparison) {
    let lowPointer = startIndex;
    let highPointer = endIndex;
    let resultPosition = endIndex + 1;

    while (lowPointer <= highPointer) {
        const midPosition = lowPointer + Math.floor((highPointer - lowPointer) / 2);
        const comparisonCondition = exclusiveComparison ?
            arraySource[midPosition] > desiredValue :
            arraySource[midPosition] >= desiredValue;

        if (comparisonCondition) {
            resultPosition = midPosition;
            highPointer = midPosition - 1;
        } else {
            lowPointer = midPosition + 1;
        }
    }
    return resultPosition;
}

function tallyProducts(elementArray, thresholdValue) {
    const arrayLength = elementArray.length;
    let countedPairs = 0n;

    for (let idxA = 0; idxA < arrayLength; ++idxA) {
        const valA = elementArray[idxA];

        if (valA === 0n) {
            if (thresholdValue > 0n) {
                countedPairs += BigInt(arrayLength - 1 - idxA);
            }
        } else if (valA > 0n) {
            const targetForB = thresholdValue / valA;
            const upperBoundIdx = findPosition(elementArray, targetForB, idxA + 1, arrayLength - 1, false);
            countedPairs += BigInt(upperBoundIdx - (idxA + 1));
        } else { // valA < 0n
            const targetForB = thresholdValue / valA;
            const lowerBoundIdx = findPosition(elementArray, targetForB, idxA + 1, arrayLength - 1, true);
            countedPairs += BigInt(arrayLength - lowerBoundIdx);
        }
    }
    return countedPairs;
}

function deriveKthSmallestProduct(inputString) {
    const dataLines = inputString.trim().split('\n');
    const parameters = dataLines[0].split(' ').map(BigInt);
    const totalElements = Number(parameters[0]);
    const targetRank = parameters[1];

    const numberSet = dataLines[1].split(' ').map(BigInt);
    numberSet.sort((firstVal, secondVal) => firstVal < secondVal ? -1 : (firstVal > secondVal ? 1 : 0));

    let lowerBound = -2000000000000000000n;
    let upperBound = 2000000000000000000n;
    let finalAnswer = 0n;

    while (lowerBound <= upperBound) {
        const midValue = lowerBound + (upperBound - lowerBound) / 2n;
        const countBelowMid = tallyProducts(numberSet, midValue);

        if (countBelowMid >= targetRank) {
            finalAnswer = midValue;
            upperBound = midValue - 1n;
        } else {
            lowerBound = midValue + 1n;
        }
    }

    return finalAnswer.toString();
}

// Emulate the original's input reading and execution
if (typeof process !== 'undefined' && process.stdin) {
    let accumulatedInput = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
        accumulatedInput += chunk;
    });
    process.stdin.on('end', () => {
        process.stdout.write(deriveKthSmallestProduct(accumulatedInput));
    });
}