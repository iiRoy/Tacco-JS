var individualPairs;

function ProcessInput(rawData) {
    const processedLines = rawData.split('\n');
    const numList = processedLines[1].split(' ').map(val => parseInt(val, 10));

    const MAX_VALUE_LIMIT = 20010;
    let freqCounts = Array(MAX_VALUE_LIMIT).fill(0);

    let currentListIndex = 0;
    const listElementCount = numList.length;
    while (currentListIndex < listElementCount) {
        const currentNumberValue = numList[currentListIndex];
        freqCounts[currentNumberValue]++;
        currentListIndex++;
    }

    let totalPairsSum = 0;
    individualPairs = Array(MAX_VALUE_LIMIT).fill(0);

    const calculateCombinationsOfTwo = (count) => {
        if (count < 2) {
            return 0;
        }
        return (count * (count - 1)) / 2;
    };

    for (let frequencyArrayIndex = 0; frequencyArrayIndex < freqCounts.length; frequencyArrayIndex++) {
        const currentFrequencyValue = freqCounts[frequencyArrayIndex];
        const pairsForThisFrequency = calculateCombinationsOfTwo(currentFrequencyValue);
        totalPairsSum += pairsForThisFrequency;
        individualPairs[frequencyArrayIndex] = pairsForThisFrequency;
    }

    for (let outputIterationIndex = 0; outputIterationIndex < numList.length; outputIterationIndex++) {
        const numberToConsider = numList[outputIterationIndex];
        const frequencyOfConsideredNumber = freqCounts[numberToConsider];
        const finalCalculatedValue = totalPairsSum - frequencyOfConsideredNumber + 1;
        console.log(finalCalculatedValue);
    }
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const inputEncodingFormat = "utf8";
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, inputEncodingFormat).trim();

ProcessInput(rawInputContent);
