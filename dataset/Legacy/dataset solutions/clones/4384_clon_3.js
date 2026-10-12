"use strict"

function parseInputNumbers(rawInputString) {
    const processedValues = rawInputString.split(/\s|\n/)
                                     .map(str => parseInt(str, 10))
                                     .filter(val => !isNaN(val));
    return processedValues.slice(1);
}

function generateExpandedAndSortedNumbers(baseNumbers) {
    const valueOffsets = [-1, 0, 1];
    const expandedSet = baseNumbers.flatMap(baseNum =>
        valueOffsets.map(offset => baseNum + offset)
    );
    expandedSet.sort((a, b) => a - b);
    return expandedSet;
}

function findMaxConsecutiveFrequency(numberSequence) {
    if (numberSequence.length === 0) {
        return 1;
    }

    let highestFrequency = 1;
    let currentRunFrequency = 1;
    let previousValue = numberSequence[0];

    for (let i = 1; i < numberSequence.length; i++) {
        const currentValue = numberSequence[i];
        if (currentValue === previousValue) {
            currentRunFrequency++;
        } else {
            highestFrequency = Math.max(highestFrequency, currentRunFrequency);
            previousValue = currentValue;
            currentRunFrequency = 1;
        }
    }
    highestFrequency = Math.max(highestFrequency, currentRunFrequency);
    return highestFrequency;
}

function processMainLogic(inputData) {
    const initialNumbers = parseInputNumbers(inputData);
    const processedAndSorted = generateExpandedAndSortedNumbers(initialNumbers);
    const resultFrequency = findMaxConsecutiveFrequency(processedAndSorted);
    console.log(resultFrequency);
}

processMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
