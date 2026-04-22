"use strict";

const obtainProcessedData = (rawTextualData) => {
    const lines = rawTextualData.trim().split("\n");
    const countOfEntries = parseInt(lines[0], 10);
    const relevantEntries = lines.slice(1, countOfEntries + 1);
    return relevantEntries;
};

const countDesignatedPrefixes = (listOfStrings) => {
    const targetPrefixes = ['M', 'A', 'R', 'C', 'H'];
    const prefixCounts = new Map();
    targetPrefixes.forEach(prefix => prefixCounts.set(prefix, 0));

    for (const item of listOfStrings) {
        const firstChar = item[0];
        if (prefixCounts.has(firstChar)) {
            prefixCounts.set(firstChar, prefixCounts.get(firstChar) + 1);
        }
    }

    return targetPrefixes.map(prefix => prefixCounts.get(prefix));
};

const computeTriadProductSum = (numericalSequence) => {
    let totalAccumulation = 0;
    const sequenceLength = numericalSequence.length;

    for (let firstIndex = 0; firstIndex < sequenceLength - 2; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < sequenceLength - 1; secondIndex++) {
            for (let thirdIndex = secondIndex + 1; thirdIndex < sequenceLength; thirdIndex++) {
                totalAccumulation += numericalSequence[firstIndex] * numericalSequence[secondIndex] * numericalSequence[thirdIndex];
            }
        }
    }
    return totalAccumulation;
};

const orchestrateSolution = (incomingData) => {
    const processedStrings = obtainProcessedData(incomingData);
    const designatedPrefixTallies = countDesignatedPrefixes(processedStrings);
    const finalResult = computeTriadProductSum(designatedPrefixTallies);
    console.log(finalResult);
};

orchestrateSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));