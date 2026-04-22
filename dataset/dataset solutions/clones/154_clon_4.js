const nodeFileSystem = require('node:fs');
const nodeProcess = require('node:process');

const entireInputContent = nodeFileSystem.readFileSync(nodeProcess.stdin.fd, 'utf8');
const contentLines = entireInputContent.trim().split('\n');

const deriveValueFrequency = (numericSequence) => {
    const valueMap = new Map();
    for (const entryValue of numericSequence) {
        valueMap.set(entryValue, (valueMap.get(entryValue) || 0) + 1);
    }
    return Array.from(valueMap.values()).sort((countA, countB) => countB - countA);
};

const verifySuccessiveOrder = (numericSequence) => {
    // Standard consecutive sequence (e.g., 5,4,3,2,1)
    let isStandardProgression = true;
    for (let ptr = 0; ptr < numericSequence.length - 1; ptr++) {
        if (numericSequence[ptr] !== numericSequence[ptr + 1] + 1) {
            isStandardProgression = false;
            break;
        }
    }
    if (isStandardProgression) return true;

    // Special Ace-high sequence (K,Q,J,10,A represented as 13,12,11,10,1)
    return numericSequence[0] === 13 && numericSequence[1] === 12 &&
           numericSequence[2] === 11 && numericSequence[3] === 10 &&
           numericSequence[4] === 1;
};

const classifyNumericSet = (processedValues) => {
    const frequencyDistribution = deriveValueFrequency(processedValues);

    // Rule for "four card": four values are identical
    if (frequencyDistribution[0] === 4) {
        return "four card";
    }

    // Rule for "full house": three values are identical, and two other values are identical
    if (frequencyDistribution[0] === 3 && frequencyDistribution[1] === 2) {
        return "full house";
    }

    // Rule for "straight": five values are in successive order
    if (verifySuccessiveOrder(processedValues)) {
        return "straight";
    }

    // Default classification if no specific pattern is found
    return "null";
};

const executeProcessing = (allLines) => {
    for (const singleLine of allLines) {
        const orderedNumericData = singleLine
            .trim()
            .split(',')
            .map(strVal => parseInt(strVal, 10))
            .sort((valOne, valTwo) => valTwo - valOne); // Sort descending

        const determinedCategory = classifyNumericSet(orderedNumericData);
        nodeProcess.stdout.write(determinedCategory + '\n');
    }
};

executeProcessing(contentLines);