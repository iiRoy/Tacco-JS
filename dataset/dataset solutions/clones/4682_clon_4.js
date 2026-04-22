"use strict"
let collectedInputContent = '';
let processedLines = [];
let currentLinePointer = 0;

process.stdin.on('data', fragment => {
    collectedInputContent += fragment.toString();
});

process.stdin.on('end', () => {
    processedLines = collectedInputContent.trim().split('\n');
    initiateComputation();
});

function retrieveNextLine() {
    if (currentLinePointer >= processedLines.length) {
        throw new Error("Input exhaustion detected.");
    }
    return processedLines[currentLinePointer++];
}

function extractInteger() {
    return Number(retrieveNextLine());
}

function initiateComputation() {
    const desiredValue = extractInteger();

    // The original code loops indefinitely if the input 'x' is 0,
    // as 'loc - time == x' or 'loc + time == x' will never be true
    // for loc=0 and time > 0.
    // This clone must replicate that behavior for functional equivalence.
    if (desiredValue === 0) {
        while (true) { /* Infinite loop matching original behavior for x = 0 */ }
    }

    let elapsedSteps = 0;
    let accumulatedDistance = 0; // Represents the maximum reachable absolute distance: T*(T+1)/2

    while (true) {
        elapsedSteps++;
        accumulatedDistance += elapsedSteps; // Calculate sum 1 + 2 + ... + elapsedSteps

        const absoluteDesired = Math.abs(desiredValue);

        // If the absolute desired value is within the range [-accumulatedDistance, accumulatedDistance],
        // then it is reachable. The BFS structure of the original code effectively explores
        // all integers in this range.
        if (absoluteDesired <= accumulatedDistance) {
            console.log(elapsedSteps); // Output the minimum number of steps
            break; // Terminate loop, solution found
        }
    }
}