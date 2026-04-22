"use strict";

function processInputText(fullData) {
    const lines = fullData.trim().split("\n");
    // The first line (containing 'n') is read by the original but not used in the core logic.
    // We extract the second line, which is the sequence string.
    const mainSequence = lines[1];
    return mainSequence;
}

function computeOptimalTransformation(inputSequence) {
    const sequenceLength = inputSequence.length;

    // This array stores the count of '#' characters from the beginning up to each index.
    // `leadingHashCounts[x]` holds the count of '#' in `inputSequence[0...x-1]`.
    const leadingHashCounts = new Array(sequenceLength + 1).fill(0);
    for (let x = 0; x < sequenceLength; x++) {
        leadingHashCounts[x + 1] = leadingHashCounts[x] + (inputSequence[x] === '#' ? 1 : 0);
    }

    // This array stores the count of '.' characters from each index to the end.
    // `trailingDotCounts[x]` holds the count of '.' in `inputSequence[x...sequenceLength-1]`.
    const trailingDotCounts = new Array(sequenceLength + 1).fill(0);
    for (let x = sequenceLength - 1; x >= 0; x--) {
        trailingDotCounts[x] = trailingDotCounts[x + 1] + (inputSequence[x] === '.' ? 1 : 0);
    }

    let minimumRequiredChanges = sequenceLength + 1; // Initialize with a value guaranteed to be higher than any valid count

    // Iterate through all possible partition points.
    // A partition at index `x` means `inputSequence[0...x-1]` should be '#' and `inputSequence[x...sequenceLength-1]` should be '.'.
    for (let x = 0; x <= sequenceLength; x++) {
        const currentPartitionChanges = leadingHashCounts[x] + trailingDotCounts[x];
        if (currentPartitionChanges < minimumRequiredChanges) {
            minimumRequiredChanges = currentPartitionChanges;
        }
    }

    return minimumRequiredChanges;
}

function activateTransformationLogic(rawData) {
    const targetString = processInputText(rawData);
    const resultValue = computeOptimalTransformation(targetString);
    console.log(resultValue);
}

// Entry point for execution, reading from standard input.
activateTransformationLogic(require("fs").readFileSync("/dev/stdin", "utf8"));