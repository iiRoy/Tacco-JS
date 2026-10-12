'use strict';

function ProcessInput(rawData) {
    // This function processes the input data.
    // The input format is expected to be:
    // First line: N (number of elements)
    // Second line: A1 A2 A3...An (space-separated elements)
    // Third line: Q (number of queries)
    // Subsequent lines: B1 C1, B2 C2, ... BQ CQ (query pairs)
    let parsedLines = rawData.trim().split('\n');
    const countElements = Number(parsedLines[0]);
    let initialNumbers = parsedLines[1]
        .split(' ')
        .sort((valA, valB) => valA - valB)
        .map((elementValue) => BigInt(elementValue));
    const numQueries = Number(parsedLines[2]);
    const queryOperations = parsedLines.splice(3).map((queryPart) => queryPart.split(' ').map((queryPart) => BigInt(queryPart)));

    // Initialize a frequency array for numbers up to 100000
    let frequencyMap = new Array(100001).fill(0n);
    // Populate the frequency map with initial numbers
    for (const currentNum of initialNumbers) {
        frequencyMap[currentNum] += 1n;
    }

    // Calculate the initial sum based on frequencies
    let totalSum = frequencyMap.reduce((accumulator, freqCount, indexVal) => accumulator + freqCount * BigInt(indexVal));

    // Process each query operation
    for (const [oldVal, newVal] of queryOperations) {
        // Calculate the change in sum due to replacing 'oldVal' with 'newVal'
        const changeAmount = (newVal - oldVal) * frequencyMap[oldVal];
        totalSum += changeAmount;
        // Output the current total sum as a string
        console.log(String(totalSum));
        // Update the frequency map: move counts from 'oldVal' to 'newVal'
        frequencyMap[newVal] += frequencyMap[oldVal];
        frequencyMap[oldVal] = 0n; // Clear the count for 'oldVal'
    }

    return; // Function completes
}
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
