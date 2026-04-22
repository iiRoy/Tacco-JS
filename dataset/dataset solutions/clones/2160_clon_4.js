let inputBuffer = '';
process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    const rawLines = inputBuffer.split('\n').filter(line => line.trim() !== '');
    const firstLineValues = rawLines[0].split(' ').map(Number);
    const elementCount = firstLineValues[0]; // Not directly used in final logic, but parsed
    const targetRank = BigInt(firstLineValues[1]);
    const numericValues = rawLines[1].split(' ').map(BigInt).sort((a, b) => a < b ? -1 : (a > b ? 1 : 0));

    const finalAnswer = determineKthSmallestProduct(numericValues, targetRank);

    process.stdout.write(finalAnswer.toString() + '\n');
});

function findLastMatchingIndex(collection, conditionFunction, startPoint = 0, endPoint = collection.length - 1) {
    let resultIndex = -1;
    while (startPoint <= endPoint) {
        const midPoint = Math.floor((startPoint + endPoint) / 2);
        if (conditionFunction(collection[midPoint])) {
            resultIndex = midPoint;
            startPoint = midPoint + 1;
        } else {
            endPoint = midPoint - 1;
        }
    }
    return resultIndex;
}

function findFirstMatchingIndex(collection, conditionFunction, startPoint = 0, endPoint = collection.length - 1) {
    let resultIndex = -1;
    while (startPoint <= endPoint) {
        const midPoint = Math.floor((startPoint + endPoint) / 2);
        if (conditionFunction(collection[midPoint])) {
            resultIndex = midPoint;
            endPoint = midPoint - 1;
        } else {
            startPoint = midPoint + 1;
        }
    }
    return resultIndex;
}

function tallyProductsBelowLimit(dataArray, limitValue) {
    const dataLength = BigInt(dataArray.length);
    let pairAccumulator = 0n;

    for (let currentIdx = 0; currentIdx < dataArray.length; currentIdx++) {
        const currentElement = dataArray[currentIdx];

        if (currentElement === 0n) {
            if (limitValue >= 0n) {
                pairAccumulator += (dataLength - 1n - BigInt(currentIdx));
            }
            continue;
        }

        let searchStartIdx = currentIdx + 1;

        if (currentElement > 0n) {
            const upperBoundary = limitValue / currentElement;
            const lastValidIdx = findLastMatchingIndex(dataArray, val => val <= upperBoundary, searchStartIdx, dataArray.length - 1);
            if (lastValidIdx !== -1) {
                pairAccumulator += BigInt(lastValidIdx - searchStartIdx + 1);
            }
        } else { // currentElement < 0n
            const lowerBoundary = limitValue / currentElement;
            const firstValidIdx = findFirstMatchingIndex(dataArray, val => val >= lowerBoundary, searchStartIdx, dataArray.length - 1);
            if (firstValidIdx !== -1) {
                pairAccumulator += BigInt(dataArray.length - firstValidIdx);
            }
        }
    }
    return pairAccumulator;
}

function determineKthSmallestProduct(sortedNumbers, requiredRank) {
    let lowerBound = -1000000000000000005n;
    let upperBound = 1000000000000000005n;

    while (lowerBound < upperBound) {
        const midValue = lowerBound + (upperBound - lowerBound) / 2n;
        if (tallyProductsBelowLimit(sortedNumbers, midValue) >= requiredRank) {
            upperBound = midValue;
        } else {
            lowerBound = midValue + 1n;
        }
    }
    return lowerBound;
}