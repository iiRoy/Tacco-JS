"use strict";

const acquireInputData = (sourceTxt) => {
    const rawLines = sourceTxt.trim().split("\n");
    const firstLineComponents = rawLines[0].split(" ");
    const valueLimit = Number(firstLineComponents[0]);
    const numberSequence = rawLines[1].split(" ").map(Number);
    return { valueLimit, numberSequence };
};

const computeOutcome = (inputParameters) => {
    const { valueLimit, numberSequence } = inputParameters;

    const occurrenceRegister = Array(valueLimit).fill(0);
    numberSequence.forEach(itemVal => {
        if (itemVal >= 1 && itemVal <= valueLimit) {
            occurrenceRegister[itemVal - 1]++;
        }
    });

    const sortedCounts = occurrenceRegister.filter(count => count > 0).sort((a, b) => b - a);

    const finalOutcome = Array(valueLimit).fill(0);
    finalOutcome[0] = valueLimit;

    for (let currentDistinctCount = 2; currentDistinctCount <= valueLimit; currentDistinctCount++) {
        const indexInSortedCounts = currentDistinctCount - 1;
        const countOfMaxFrequency = (indexInSortedCounts < sortedCounts.length) ? sortedCounts[indexInSortedCounts] : 0;
        
        const maxOccurrencesPerItem = Math.floor(valueLimit / currentDistinctCount);

        finalOutcome[currentDistinctCount - 1] = Math.min(countOfMaxFrequency, maxOccurrencesPerItem);
    }

    return finalOutcome.join("\n");
};

const obtainFileContent = (pathReference, encodingFormat) => {
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync(pathReference, encodingFormat);
};

const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

const problemInputContent = obtainFileContent(standardInputPath, utf8Encoding);
const processedDataStruct = acquireInputData(problemInputContent);
console.log(computeOutcome(processedDataStruct));