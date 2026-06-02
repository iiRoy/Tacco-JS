const fileSystemModule = require('fs');

// Helper function to generate a specific numerical sequence based on an initial value.
// The sequence starts with 0, then the initial value, and subsequent terms
// are derived from the previous term: multiplied by 2 if the index is even,
// or divided by 3 if the index is odd.
function deriveNumericalSequence(startingValue) {
    const sequenceMaximumIndex = 10; // The sequence will have elements from index 0 to 10.
    let computedSequence = new Array(sequenceMaximumIndex + 1); // Array to hold 11 elements.

    computedSequence[0] = 0;
    computedSequence[1] = startingValue;

    // Populate the sequence from the third element (index 2) up to the maximum index.
    for (let currentPosition = 2; currentPosition <= sequenceMaximumIndex; currentPosition++) {
        const precedingTerm = computedSequence[currentPosition - 1];
        
        // Apply the rule based on the current position's parity.
        if (currentPosition % 2 === 0) { // If the current position is an even number
            computedSequence[currentPosition] = precedingTerm * 2;
        } else { // If the current position is an odd number
            computedSequence[currentPosition] = precedingTerm / 3;
        }
    }
    return computedSequence;
}

// Read the raw content from standard input.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace, split into lines, and convert each line to a number.
const cleanedInputString = rawInputContent.trim();
const inputLinesArray = cleanedInputString.split("\n");
const numericalInputValues = inputLinesArray.map(Number);

// Iterate over each numerical input value to perform the sequence generation and summation.
for (const singleInputNumber of numericalInputValues) {
    // Generate the sequence for the current input number using the helper function.
    const resultingSequence = deriveNumericalSequence(singleInputNumber);
    
    // Calculate the sum of all elements in the generated sequence.
    const finalSequenceSum = resultingSequence.reduce((accumulatedValue, currentSequenceElement) => {
        return accumulatedValue + currentSequenceElement;
    }, 0); // Start accumulation from 0.

    // Print the calculated sum, formatted to 8 decimal places.
    console.log(finalSequenceSum.toFixed(8));
}
