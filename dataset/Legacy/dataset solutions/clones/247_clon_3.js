const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';
const moduloBase = 10; // Constant representing the base for the modulo operation

const rawInputData = fileSystem.readFileSync(standardInputPath, encodingType);
const inputLineSegments = rawInputData.split('\n');

// Helper function to convert a string segment into an array of numeric digits.
// This replaces the inline `map(function(n){return +n;})` logic.
const parseDigitString = (segment) => {
    const numericDigits = [];
    // Iterate through each character of the segment string
    for (let charIndex = 0; charIndex < segment.length; charIndex++) {
        // Convert the character to a number. The `Number()` constructor
        // provides equivalent behavior to the unary plus operator (`+`)
        // for single-digit string conversions.
        numericDigits.push(Number(segment[charIndex]));
    }
    return numericDigits;
};

let currentInputSegment;

// Process each line segment obtained from the input data.
// The loop condition is split for clarity, separating the check from the assignment.
while (inputLineSegments.length > 0) {
    currentInputSegment = inputLineSegments.shift();

    // Convert the current line segment (e.g., "1234") into an array of numbers (e.g., [1, 2, 3, 4]).
    let digitSequence = parseDigitString(currentInputSegment);
    let sequenceLength = digitSequence.length;

    // This inner loop performs the reduction process until only a single digit remains in the sequence.
    while (sequenceLength > 1) {
        const nextSequence = []; // Array to store the results of the current reduction step.
        
        // Define the upper bound for the inner iteration explicitly.
        // It's one less than the current sequence length because we're summing adjacent pairs.
        const innerLoopUpperBound = sequenceLength - 1;

        for (let index = 0; index < innerLoopUpperBound; index++) {
            // Extract the two adjacent digits for the current step.
            const firstAdjacentDigit = digitSequence[index];
            const secondAdjacentDigit = digitSequence[index + 1];
            
            // Calculate their sum.
            const sumOfAdjacentDigits = firstAdjacentDigit + secondAdjacentDigit;
            
            // Apply the modulo 10 operation to get the reduced digit.
            const reducedValue = sumOfAdjacentDigits % moduloBase;
            
            // Add the calculated reduced digit to the next sequence.
            nextSequence.push(reducedValue);
        }
        
        // Update the sequence and its length for the next iteration of the reduction process.
        // Assigning `nextSequence.length` is equivalent to `sequenceLength--` in this context,
        // as each reduction step decreases the array length by one.
        sequenceLength = nextSequence.length;
        digitSequence = nextSequence;
    }
    
    // After the reduction, `digitSequence` will contain a single element.
    // Output this final digit to the console.
    console.log(digitSequence[0]);
}
