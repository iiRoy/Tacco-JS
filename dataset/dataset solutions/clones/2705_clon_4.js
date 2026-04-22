const fileSystemOperations = require('fs');

const calculationEngine = (sourceData) => {
    const inputSeries = sourceData.trim();
    const moduloCoefficient = 1000000007;
    const desiredFinalRemainder = 5;
    const moduloDivisor = 13;

    // Initialize the state for an empty prefix: one way to get remainder 0.
    const initialRemainderCounts = new Array(moduloDivisor).fill(0);
    initialRemainderCounts[0] = 1;

    // Process each character in the input series using a functional reduction.
    const ultimateRemainderCounts = inputSeries.split('').reduce((priorCycleCounts, currentSymbol) => {
        const nextCycleCounts = new Array(moduloDivisor).fill(0);

        // Iterate through all possible remainders from the previous step.
        Array.from({ length: moduloDivisor }).forEach((_, lastRemainder) => {
            // If no paths led to this 'lastRemainder', skip.
            if (priorCycleCounts[lastRemainder] === 0) {
                return;
            }

            // Determine the possible digits for the current position.
            const potentialDigits = (currentSymbol === '?')
                ? Array.from({ length: 10 }).map((__, digitVal) => digitVal) // All digits 0-9
                : [Number(currentSymbol)]; // Only the specified digit

            // Update counts for the next cycle based on each potential digit.
            potentialDigits.forEach(currentDigitValue => {
                const computedRemainder = (lastRemainder * 10 + currentDigitValue) % moduloDivisor;
                nextCycleCounts[computedRemainder] = (nextCycleCounts[computedRemainder] + priorCycleCounts[lastRemainder]) % moduloCoefficient;
            });
        });
        return nextCycleCounts; // This becomes 'priorCycleCounts' for the next iteration.
    }, initialRemainderCounts); // Start the reduction with the initial state.

    global.console.log(ultimateRemainderCounts[desiredFinalRemainder]);
};

// Retrieve the program's input from standard input.
const rawInputContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");

// Execute the main calculation process.
calculationEngine(rawInputContent);