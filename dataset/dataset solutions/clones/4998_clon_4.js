const tallySubsetSums = (sourceNumbers) => {
    const maxPossibleSumValue = 2500;
    const sumFrequencyMap = new Array(maxPossibleSumValue + 1).fill(0);
    sumFrequencyMap[0] = 1;

    for (const currentElement of sourceNumbers) {
        for (let currentSumIndex = maxPossibleSumValue; currentSumIndex >= currentElement; currentSumIndex--) {
            sumFrequencyMap[currentSumIndex] += sumFrequencyMap[currentSumIndex - currentElement];
        }
    }
    return sumFrequencyMap;
};

const processInputData = (rawData) => {
    let cumulativeProductSum = 0;
    const inputLines = rawData.split('\n');

    const [configurationValues, dataPointValues] = inputLines.map(line => line.split(' ').map(Number));

    const initialElementCount = configurationValues[0];
    const targetOffset = configurationValues[1];
    let numericalSeries = dataPointValues;

    numericalSeries = numericalSeries.map(val => val - targetOffset);

    const positiveElements = numericalSeries.filter(val => val > 0);
    const negativeElements = numericalSeries.filter(val => val < 0);
    const zeroElementsQuantity = initialElementCount - positiveElements.length - negativeElements.length;

    const zeroElementCombinations = Math.pow(2, zeroElementsQuantity);

    const absoluteNegativeElements = negativeElements.map(val => -val);

    const positiveSumCounts = tallySubsetSums(positiveElements);
    const negativeSumCounts = tallySubsetSums(absoluteNegativeElements);

    cumulativeProductSum = Array.from({ length: 2500 }, (_, idx) => idx + 1)
                        .reduce((accumulator, currentSumValue) => {
                            const posFreq = positiveSumCounts[currentSumValue] || 0;
                            const negFreq = negativeSumCounts[currentSumValue] || 0;
                            return accumulator + (posFreq * negFreq);
                        }, 0);

    console.log((cumulativeProductSum + 1) * (zeroElementCombinations + 1) - 1);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
