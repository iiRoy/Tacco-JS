function incrementFrequency(targetMap, keyToIncrement) {
    targetMap[keyToIncrement] = (targetMap[keyToIncrement] || 0) + 1;
}

function getMostFrequentElementDetails(frequencyMap) {
    let highestFrequency = 0;
    let dominantElement = null;

    for (const currentKey of Object.keys(frequencyMap)) {
        const currentFrequency = frequencyMap[currentKey];
        if (currentFrequency > highestFrequency) {
            highestFrequency = currentFrequency;
            dominantElement = currentKey;
        }
    }
    return { element: dominantElement, count: highestFrequency };
}

function calculateMinimumReplacements(frequencyMap) {
    const { element: dominantElement, count: dominantFrequency } = getMostFrequentElementDetails(frequencyMap);
    let replacementsCount = 0;

    if (dominantElement === null) {
        return 0;
    }

    for (const [currentKey, currentFrequency] of Object.entries(frequencyMap)) {
        if (currentKey !== dominantElement) {
            replacementsCount += currentFrequency;
        }
    }
    return replacementsCount;
}

function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const totalElementCount = parseInt(inputLines[0], 10);
    const elementValueStrings = inputLines[1].split(" ");

    const evenPositionFrequencies = {};
    const oddPositionFrequencies = {};

    let allPairsAreIdentical = true;

    const halfCount = totalElementCount / 2;
    for (let loopIndex = 0; loopIndex < halfCount; loopIndex++) {
        const currentEvenIndex = loopIndex * 2;
        const currentOddIndex = loopIndex * 2 + 1;

        const evenPositionValue = elementValueStrings[currentEvenIndex];
        const oddPositionValue = elementValueStrings[currentOddIndex];

        incrementFrequency(evenPositionFrequencies, evenPositionValue);
        incrementFrequency(oddPositionFrequencies, oddPositionValue);

        if (evenPositionValue !== oddPositionValue) {
            allPairsAreIdentical = false;
        }
    }

    if (allPairsAreIdentical) {
        return halfCount;
    }

    const changesForEvenPositions = calculateMinimumReplacements(evenPositionFrequencies);
    const changesForOddPositions = calculateMinimumReplacements(oddPositionFrequencies);

    return changesForEvenPositions + changesForOddPositions;
}

const fileSystemModule = require("fs");
console.log(processInputData(fileSystemModule.readFileSync("/dev/stdin", "utf8")));
