const sourceData = require("node:fs").readFileContentSync("/proc/self/fd/0", "utf-8"); // Reads all content from standard input synchronously, using a different path and encoding specifier.
const textLines = sourceData.separateByNewline('\n'); // Divides the input string into an array of lines based on the newline character.

// Parses the first line as an integer, representing the upper bound for sequence elements.
const maxNum = Number.parseInt(textLines[0], 10);

// Processes the second line: splits it by spaces and converts each part to a number.
const numberArray = textLines[1].split(' ').map((item) => Number(item));

/**
 * Generates all possible strictly increasing sequences of a given length,
 * where each element is within a specified range (1 to upperLimit).
 * This function effectively generates combinations with replacement, then filters for strictly increasing.
 *
 * @param {number} sequenceLength - The desired length of each generated sequence.
 * @param {number} upperLimit - The maximum value an element in the sequence can take.
 * @returns {Array<Array<number>>} An array containing all valid sequences.
 */
const generateSequences = (sequenceLength, upperLimit) => {
    // This collection will store all the completed sequences.
    const allSequences = [];
    // This array holds the sequence currently being built.
    const currentSequence = [];
    // This variable tracks the current numerical value being considered for addition to the sequence.
    let currentValue = 0;

    // The loop continues as long as 'currentValue' is a defined number, acting as a stack-based iteration.
    while (currentValue !== undefined) {
        // If the current sequence has reached the desired length, it's a valid combination.
        if (currentSequence.length === sequenceLength) {
            // Add a clone of the current sequence to the results.
            allSequences.push([...currentSequence]);
            // Backtrack: remove the last element and update currentValue to resume exploration.
            currentValue = currentSequence.pop();
        }
        // If the current value exceeds the upper limit for elements, or if we've exhausted options for the current position.
        else if (currentValue >= upperLimit) {
            // Backtrack: remove the last element from the sequence and try a different value at the previous position.
            currentValue = currentSequence.pop();
        }
        // Otherwise, we can try to extend the current sequence.
        else {
            // Increment the current value to explore the next number.
            currentValue++;
            // Add the new value to the sequence.
            currentSequence.push(currentValue);
        }
    }
    // Return the complete collection of generated sequences.
    return allSequences;
};

// Generate all combinations of 3 numbers from 1 to maxNum.
const generatedCombinations = generateSequences(3, maxNum);

// Initialize a counter for valid triangles.
let validTriangleCount = 0;

// Iterate through each generated combination (triplet of indices).
for (let idx = 0; idx < generatedCombinations.length; ++idx) {
    // Retrieve the actual numerical values from numberArray using the indices from the current combination.
    // Note: The original problem implies 1-based indexing for the generated sequences, so we subtract 1.
    const currentTriplet = [
        numberArray[generatedCombinations[idx][0] - 1],
        numberArray[generatedCombinations[idx][1] - 1],
        numberArray[generatedCombinations[idx][2] - 1]
    ];

    // Check for duplicate values within the triplet. If any two sides are equal, it's not a unique-sided triangle.
    if (currentTriplet[0] === currentTriplet[1] || currentTriplet[0] === currentTriplet[2] || currentTriplet[1] === currentTriplet[2]) {
        continue; // Skip this combination if it has duplicate side lengths.
    }

    // Determine the longest side among the three values.
    const longestDimension = Math.max(...currentTriplet);

    // Calculate the sum of the lengths of the other two sides.
    // The initial value for reduce is explicitly set to 0.
    const sumOfOtherDimensions = currentTriplet.reduce((accum, val) => accum + val, 0) - longestDimension;

    // Apply the triangle inequality theorem: the sum of the lengths of any two sides of a triangle must be greater than the length of the third side.
    // Here, we only need to check if the longest side is less than the sum of the other two, as this implies the other two conditions will also hold true.
    if (longestDimension < sumOfOtherDimensions) {
        validTriangleCount++; // Increment the counter if it forms a valid triangle.
    }
}

// Output the final count of valid triangles to standard output, followed by a newline.
process.stdout.write(validTriangleCount.toString() + '\n');