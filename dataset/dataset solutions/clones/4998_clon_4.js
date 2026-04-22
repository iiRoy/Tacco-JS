const generateSumCounts = (dataCollection) => {
    const sumOccurrences = {};

    const traverseSubsets = (currentIndex, currentAccumulatedSum) => {
        if (currentIndex === dataCollection.length) {
            sumOccurrences[currentAccumulatedSum] = (sumOccurrences[currentAccumulatedSum] || 0) + 1;
            return;
        }

        traverseSubsets(currentIndex + 1, currentAccumulatedSum);
        traverseSubsets(currentIndex + 1, currentAccumulatedSum + dataCollection[currentIndex]);
    };

    traverseSubsets(0, 0);

    const finalSumArray = Array(2501).fill(0);
    for (const sumKey in sumOccurrences) {
        if (Object.prototype.hasOwnProperty.call(sumOccurrences, sumKey)) {
            const numericSum = parseInt(sumKey, 10);
            if (numericSum >= 0 && numericSum < 2501) {
                finalSumArray[numericSum] = sumOccurrences[sumKey];
            }
        }
    }
    return finalSumArray;
};

const calculateSubsetAverageCounts = (rawInputText) => {
    let totalCombinationCount = 0;
    const inputLines = rawInputText.trim().split('\n');
    const [arraySize, targetAverage] = inputLines[0].split(' ').map(Number);
    const numberElements = inputLines[1].split(' ').map(Number);

    const adjustedElements = numberElements.map(element => element - targetAverage);

    const positiveElements = adjustedElements.filter(val => val > 0);
    const negatedNegativeElements = adjustedElements.filter(val => val < 0).map(val => -val);
    const countOfZeros = adjustedElements.filter(val => val === 0).length;

    const positiveDistribution = generateSumCounts(positiveElements);
    const negativeDistribution = generateSumCounts(negatedNegativeElements);

    for (let sVal = 1; sVal < 2501; sVal++) {
        totalCombinationCount += positiveDistribution[sVal] * negativeDistribution[sVal];
    }

    const zeroElementOptions = Math.pow(2, countOfZeros);

    console.log((totalCombinationCount + 1) * (zeroElementOptions + 1) - 1);
};

calculateSubsetAverageCounts(require('fs').readFileSync('/dev/stdin', 'UTF-8'));