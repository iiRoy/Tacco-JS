'use strict';

function Main(inputContent) {
    // N
    // A1 A2 A3...An
    // Q
    // B1 C1
    // B2 C2
    // ...
    // BQ CQ

    // Helper function to convert an array of string numbers to an array of BigInts
    const convertStringToBigIntArray = (stringArray) => {
        return stringArray.map((strVal) => BigInt(strVal));
    };

    let inputLines = inputContent.trim().split('\n');

    const countN = Number(inputLines[0]);

    // Process the initial numbers array
    let initialNumbersStringParts = inputLines[1].split(' ');
    // Preserve the original sorting behavior, even if its direct impact on the frequency map is minimal
    initialNumbersStringParts.sort((valA, valB) => Number(valA) - Number(valB));
    let initialNumbers = convertStringToBigIntArray(initialNumbersStringParts);

    const queryCount = Number(inputLines[2]);

    // Process the queries (B C pairs)
    let rawQueryLines = inputLines.splice(3);
    let queries = rawQueryLines.map((queryLine) => {
        const queryParts = queryLine.split(' ');
        return [BigInt(queryParts[0]), BigInt(queryParts[1])];
    });

    // Define a constant for the maximum possible value index
    const MAX_POSSIBLE_VALUE = 100001;
    // Initialize a frequency map for numbers, using BigInt for counts
    let frequencyMap = new Array(MAX_POSSIBLE_VALUE).fill(0n);

    // Populate the frequency map based on the initial numbers
    initialNumbers.forEach((currentNumberValue) => {
        // Ensure the index is a number for array access
        frequencyMap[Number(currentNumberValue)] += 1n;
    });

    // Calculate the initial total sum of (value * frequency)
    let currentTotalSum = 0n;
    for (let index = 0; index < MAX_POSSIBLE_VALUE; index++) {
        const frequencyAtIndex = frequencyMap[index];
        // Only add to sum if there are occurrences of this number
        if (frequencyAtIndex > 0n) {
            currentTotalSum += frequencyAtIndex * BigInt(index);
        }
    }

    // Process each query to update the sum and frequency map
    for (const queryPair of queries) {
        const oldValue = queryPair[0];
        const newValue = queryPair[1];

        // Get the frequency of the number being changed
        const frequencyOfOldValue = frequencyMap[Number(oldValue)];

        // Calculate the change in the total sum
        const valueDifference = newValue - oldValue;
        const sumAdjustment = valueDifference * frequencyOfOldValue;

        currentTotalSum += sumAdjustment;

        // Output the updated total sum for the current query
        console.log(String(currentTotalSum));

        // Update the frequency map
        const targetIndex = Number(newValue);
        const sourceIndex = Number(oldValue);

        // Add the frequency of the old value to the new value's frequency
        frequencyMap[targetIndex] += frequencyOfOldValue;
        // Set the frequency of the old value to zero as it has been "moved"
        frequencyMap[sourceIndex] = 0n;
    }

    return;
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
