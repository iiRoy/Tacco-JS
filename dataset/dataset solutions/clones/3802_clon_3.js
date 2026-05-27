const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8').split('\n');

const elementCount = parseInt(rawInputData.shift(), 10);
const directionSequence = rawInputData.shift();

const WEST_CHAR = 'W';
const EAST_CHAR = 'E';

const westCumulativeCounts = new Array(elementCount + 1).fill(0);
const eastCumulativeCounts = new Array(elementCount + 2).fill(0); // Allocate for E[N+1] to replicate original behavior

// Calculate prefix sums for 'W'
// westCumulativeCounts[k] stores the count of 'W's in directionSequence[0...k-1]
for (let index = 0; index < elementCount; index++) {
    const isWest = (directionSequence[index] === WEST_CHAR) ? 1 : 0;
    westCumulativeCounts[index + 1] = westCumulativeCounts[index] + isWest;
}

// Calculate suffix sums for 'E'
// eastCumulativeCounts[k] stores the count of 'E's in directionSequence[k...elementCount-1]
// eastCumulativeCounts[elementCount] is already 0 from fill(0)
for (let index = elementCount - 1; index >= 0; index--) {
    const isEast = (directionSequence[index] === EAST_CHAR) ? 1 : 0;
    eastCumulativeCounts[index] = eastCumulativeCounts[index + 1] + isEast;
}

let minimumFlips = Number.MAX_SAFE_INTEGER;

// Iterate through all possible split points
// The original code calculates W[i] + E[i+1]
// This means: W's in S[0...i-1] + E's in S[i+1...N-1]
// The person at index 'i' is effectively ignored in the count.
for (let index = 0; index <= elementCount; index++) {
    const currentWestFlips = westCumulativeCounts[index];
    const currentEastFlips = eastCumulativeCounts[index + 1]; // This will be undefined when index = elementCount

    const totalCurrentFlips = currentWestFlips + currentEastFlips;

    // Replicate original comparison behavior: `min > W[i] + E[i+1]`
    // If `totalCurrentFlips` is NaN (due to `undefined + number`), `NaN < minimumFlips` is false.
    // This correctly prevents `minimumFlips` from being updated with NaN.
    if (totalCurrentFlips < minimumFlips) {
        minimumFlips = totalCurrentFlips;
    }
}

console.log(minimumFlips);
