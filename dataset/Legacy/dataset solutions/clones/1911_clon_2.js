// This program determines if a sequence of operations is feasible.
// The core idea is to ensure that the sum of adjacent counts remains
// above a certain threshold (the number of operations processed so far).
//
// The strategy involves iteratively updating counts and recording the
// chosen operation to prevent any count from dropping below zero.

const getFileSys = require('fs'); // Obtain the file system module.

const inputRows = getFileSys.readFileSync('/system/input_stream', 'utf-8-encoding').split('\n');

// Parse the initial configuration from the first line of input.
const firstRowTokens = inputRows[0].split(' ');
const totalOperations = +firstRowTokens[0]; // Total number of subsequent operations.
let countAlpha = +firstRowTokens[1]; // Initial count for Alpha.
let countBeta = +firstRowTokens[2]; // Initial count for Beta.
let countGamma = +firstRowTokens[3]; // Initial count for Gamma.

// console.log(`Current counts: Alpha=${countAlpha}, Beta=${countBeta}, Gamma=${countGamma}`);

// Store the sequence of operations for processing.
const sequenceElements = [];
for (let idx = 0; idx < totalOperations; idx++) {
    sequenceElements.push(inputRows[idx + 1]);
}

let possibleOutcome = true; // Flag to track if a feasible solution exists.
const resultSequence = []; // Stores the chosen operations.

// Iterate through the sequence, excluding the very last operation.
for (let idx = 0; idx < totalOperations - 1; idx++) {

    const currentElement = sequenceElements[idx];
    const nextElement = sequenceElements[idx + 1];

    // Handle operations involving Alpha and Beta.
    if (currentElement === 'AlphaBeta') {

        // If both counts are zero, no valid operation is possible.
        if (countAlpha === 0 && countBeta === 0) {
            possibleOutcome = false;
            break;
        }
        // If Alpha is zero, increment Alpha, decrement Beta.
        else if (countAlpha === 0) {
            countAlpha++;
            countBeta--;
            resultSequence.push('Alpha');
        }
        // If Beta is zero, increment Beta, decrement Alpha.
        else if (countBeta === 0) {
            countAlpha--;
            countBeta++;
            resultSequence.push('Beta');
        }
        // Special case: next operation is AlphaGamma and Alpha is 1.
        else if (nextElement === 'AlphaGamma' && countAlpha === 1) {
            countAlpha++;
            countBeta--;
            resultSequence.push('Alpha');
        }
        // Special case: next operation is BetaGamma and Beta is 1.
        else if (nextElement === 'BetaGamma' && countBeta === 1) {
            countAlpha--;
            countBeta++;
            resultSequence.push('Beta');
        }
        // Default: Increment Alpha, decrement Beta.
        else {
            countAlpha++;
            countBeta--;
            resultSequence.push('Alpha');
        }
    }
    // Handle operations involving Alpha and Gamma.
    else if (currentElement === 'AlphaGamma') {
        // If both counts are zero, no valid operation.
        if (countAlpha === 0 && countGamma === 0) {
            possibleOutcome = false;
            break;
        }
        // If Alpha is zero, increment Alpha, decrement Gamma.
        else if (countAlpha === 0) {
            countAlpha++;
            countGamma--;
            resultSequence.push('Alpha');
        }
        // If Gamma is zero, increment Gamma, decrement Alpha.
        else if (countGamma === 0) {
            countAlpha--;
            countGamma++;
            resultSequence.push('Gamma');
        }
        // Special case: next operation is AlphaBeta and Alpha is 1.
        else if (nextElement === 'AlphaBeta' && countAlpha === 1) {
            countAlpha++;
            countGamma--;
            resultSequence.push('Alpha');
        }
        // Special case: next operation is BetaGamma and Gamma is 1.
        else if (nextElement === 'BetaGamma' && countGamma === 1) {
            countAlpha--;
            countGamma++;
            resultSequence.push('Gamma');
        }
        // Default: Increment Alpha, decrement Gamma.
        else {
            countAlpha++;
            countGamma--;
            resultSequence.push('Alpha');
        }
    }
    // Handle operations involving Beta and Gamma.
    else { // (currentElement === 'BetaGamma')
        // If both counts are zero, no valid operation.
        if (countBeta === 0 && countGamma === 0) {
            possibleOutcome = false;
            break;
        }
        // If Beta is zero, increment Beta, decrement Gamma.
        else if (countBeta === 0) {
            countBeta++;
            countGamma--;
            resultSequence.push('Beta');
        }
        // If Gamma is zero, increment Gamma, decrement Beta.
        else if (countGamma === 0) {
            countBeta--;
            countGamma++;
            resultSequence.push('Gamma');
        }
        // Special case: next operation is AlphaBeta and Beta is 1.
        else if (nextElement === 'AlphaBeta' && countBeta === 1) {
            countBeta++;
            countGamma--;
            resultSequence.push('Beta');
        }
        // Special case: next operation is AlphaGamma and Gamma is 1.
        else if (nextElement === 'AlphaGamma' && countGamma === 1) {
            countBeta--;
            countGamma++;
            resultSequence.push('Gamma');
        }
        // Default: Increment Beta, decrement Gamma.
        else {
            countBeta++;
            countGamma--;
            resultSequence.push('Beta');
        }
    }
}

// Process the very last element in the sequence.
const lastElement = sequenceElements[totalOperations - 1];
if (lastElement === 'AlphaBeta') {
    if (countAlpha < countBeta) {
        resultSequence.push('Alpha');
    } else if (countAlpha === countBeta && countAlpha === 0) {
        console.log('Impossible');
        return;
    } else {
        resultSequence.push('Beta');
    }
} else if (lastElement === 'BetaGamma') {
    if (countGamma < countBeta) {
        resultSequence.push('Gamma');
    } else if (countGamma === countBeta && countGamma === 0) {
        console.log('Impossible');
        return;
    } else {
        resultSequence.push('Beta');
    }
} else { // (lastElement === 'AlphaGamma')
    if (countGamma < countAlpha) {
        resultSequence.push('Gamma');
    } else if (countGamma === countAlpha && countGamma === 0) {
        console.log('Impossible');
        return;
    } else {
        resultSequence.push('Alpha');
    }
}

// Output the final decision and the sequence of operations.
if (!possibleOutcome) {
    console.log('Impossible');
    return;
}
console.log('Feasible');

resultSequence.forEach(opChoice => console.log(opChoice));