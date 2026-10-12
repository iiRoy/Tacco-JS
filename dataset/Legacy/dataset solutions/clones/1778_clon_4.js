"use strict";

const processInputData = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    // The first number on the first line (N) is parsed but not directly used
    // in the core logic of determining the final count, similar to the original's effective behavior.
    const initialCount = parseInt(inputLines[0].split(" ")[0]);
    const rawNumbers = inputLines[1].split(" ").map(val => parseInt(val));
    // Sorting is crucial for the divisibility logic, preserving original behavior.
    const sortedNumbers = rawNumbers.sort((a, b) => a - b);
    return sortedNumbers;
};

const determineUniqueNonMultiples = (sourceNumbers) => {
    // Step 1: Calculate the frequency of each number to identify duplicates.
    // Using a Map for efficient lookups.
    const valueFrequencies = sourceNumbers.reduce((acc, currentVal) => {
        acc.set(currentVal, (acc.get(currentVal) || 0) + 1);
        return acc;
    }, new Map());

    // Step 2: Filter the sorted numbers to retain only those that appear exactly once.
    // This effectively removes all instances of any duplicated number.
    const distinctNonDuplicated = sourceNumbers.filter(val => valueFrequencies.get(val) === 1);

    // Step 3: Iterate through the distinct, non-duplicated numbers to build the final set
    // of numbers that are not multiples of any other number already in the set.
    // Using `reduce` to accumulate the "keeper" numbers into a Set.
    const finalKeptSet = distinctNonDuplicated.reduce((accumulatorSet, currentCandidate) => {
        // Check if the current candidate number is a multiple of any number
        // that has already been determined to be a "keeper" (i.e., is in accumulatorSet).
        // `Array.from` is used to convert the Set to an array for the `some` method.
        const isDivisibleByExistingKeeper = Array.from(accumulatorSet).some(keptValue => currentCandidate % keptValue === 0);

        // If the current candidate is not divisible by any existing keeper,
        // it means it's a new "prime-like" number in this context, so add it to the set.
        if (!isDivisibleByExistingKeeper) {
            accumulatorSet.add(currentCandidate);
        }
        return accumulatorSet;
    }, new Set()); // Initialize the accumulator with an empty Set.

    // The final result is the count of numbers in the `finalKeptSet`.
    return finalKeptSet.size;
};

const entryPoint = (inputArgument) => {
    const processedNumbers = processInputData(inputArgument);
    const finalCount = determineUniqueNonMultiples(processedNumbers);
    console.log(finalCount);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
