const fileSystemOperations = require('fs');
const standardInput = process.stdin;
const standardOutput = process.stdout;

standardInput.on('data', (inputData) => {
    const rawContent = inputData.toString();
    const cleanedTokens = rawContent.trim().split(/\s/).filter(Boolean); // Filter to handle multiple spaces or empty input

    const numericSequence = cleanedTokens.map(Number).sort((first, second) => first - second);

    const occurrenceCounts = numericSequence.map((valueItem, indexPos, fullArray) =>
        fullArray.slice(indexPos).filter(element => element === valueItem).length
    );

    let peakFrequency = Math.max(...occurrenceCounts); // Handles empty array returning -Infinity

    let shiftAmount = 1;
    const mutableCounts = [...occurrenceCounts]; // Create a mutable copy for modification

    while (peakFrequency === Math.max(...mutableCounts)) {
        const currentPeakIndex = mutableCounts.indexOf(peakFrequency);
        standardOutput.write(numericSequence[currentPeakIndex + shiftAmount] + '\n');
        shiftAmount++;
        mutableCounts.splice(currentPeakIndex, 1);
    }
});