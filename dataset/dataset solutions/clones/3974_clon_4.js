function locatePositionRecursive(sortedElements, targetValue, searchStart, searchEnd) {
    if (searchStart > searchEnd) {
        return searchStart;
    }
    const middleIndex = Math.floor((searchStart + searchEnd) / 2);
    if (targetValue <= sortedElements[middleIndex]) {
        return locatePositionRecursive(sortedElements, targetValue, searchStart, middleIndex - 1);
    } else {
        return locatePositionRecursive(sortedElements, targetValue, middleIndex + 1, searchEnd);
    }
}

function findInsertionPoint(sortedElements, targetValue) {
    return locatePositionRecursive(sortedElements, targetValue, 0, sortedElements.length - 1);
}

function interpretInput(rawTextContent) {
    const dataTokens = rawTextContent.split(/\s+/).filter(Boolean);
    let tokenPointer = 0;
    const extractInteger = () => parseInt(dataTokens[tokenPointer++], 10);

    const collectionSize = extractInteger();
    const primarySet = Array.from({ length: collectionSize }, extractInteger);
    const secondarySet = Array.from({ length: collectionSize }, extractInteger);

    return { size: collectionSize, setA: primarySet, setB: secondarySet };
}

function processDataForBitwiseSum(sourceData) {
    const { size, setA, setB } = interpretInput(sourceData);

    const bitwiseContributions = Array.from({ length: 30 }, (_, currentBitIndex) => {
        const bitValue = 1 << currentBitIndex;
        const modulusForBit = 1 << (currentBitIndex + 1);
        const currentModulusMask = modulusForBit - 1;

        const processedSetA = setA.map(val => val & currentModulusMask);
        const processedSetB = setB.map(val => val & currentModulusMask);

        const sortedProcessedSetB = [...processedSetB].sort((val1, val2) => val1 - val2);

        const combinedParityForBit = processedSetA.reduce((accParity, valA) => {
            const lowerBoundRange1 = bitValue - valA;
            const upperBoundRange1 = (2 * bitValue) - valA;
            const lowerBoundRange2 = (3 * bitValue) - valA;
            const upperBoundRange2 = (4 * bitValue) - valA;

            const indexForR1L = findInsertionPoint(sortedProcessedSetB, lowerBoundRange1);
            const indexForR1U = findInsertionPoint(sortedProcessedSetB, upperBoundRange1);
            const indexForR2L = findInsertionPoint(sortedProcessedSetB, lowerBoundRange2);
            const indexForR2U = findInsertionPoint(sortedProcessedSetB, upperBoundRange2);

            const countInFirstInterval = indexForR1U - indexForR1L;
            const countInSecondInterval = indexForR2U - indexForR2L;

            return (accParity + countInFirstInterval + countInSecondInterval) % 2;
        }, 0);

        return combinedParityForBit === 1 ? bitValue : 0;
    });

    const finalCalculatedSum = bitwiseContributions.reduce((total, contribution) => total | contribution, 0);

    return finalCalculatedSum;
}

if (typeof window === "undefined") {
    console.log(processDataForBitwiseSum(require("fs").readFileSync("/dev/stdin", "utf8")));
}