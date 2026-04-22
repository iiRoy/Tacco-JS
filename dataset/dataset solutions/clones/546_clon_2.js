// This program processes input from standard input to calculate scores for two entities.

// Define a constant for the standard input file path.
const standardInputPath = '/dev/stdin';

// Access the Node.js file system module.
const fileUtility = require('fs');

// Read the entire content of the standard input file as a UTF-8 string.
let rawInputData = fileUtility.readFileSync(standardInputPath, 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
let processedLines = rawInputData
    .trim() // Remove any surrounding whitespace.
    .split('\n'); // Divide the string into an array of substrings based on newline characters.

// Extract the first line, which represents the total number of data rounds to process.
// Convert this string value into an integer using parseInt.
let totalRounds = parseInt(processedLines.shift(), 10); // The '10' specifies base-10 for parsing.

// Initialize accumulators for two distinct scoring categories.
let firstEntityScore = 0; // Score for the initial entity or condition.
let secondEntityScore = 0; // Score for the secondary entity or condition.

// Begin a loop that iterates 'totalRounds' times to process each round's data.
for (
    let currentIteration = 0; // Initialize the loop counter.
    currentIteration < totalRounds; // Loop continues as long as the counter is less than totalRounds.
    currentIteration++ // Increment the counter after each iteration.
) {
    // Retrieve the next line of data representing the current round's values.
    let currentRoundString = processedLines.shift();

    // Split the current round's string by space and convert each part to an integer.
    let numericValues = currentRoundString
        .split(' ') // Break the string into an array of substrings using space as a delimiter.
        .map(valueString => parseInt(valueString, 10)); // Convert each substring to an integer.

    // Apply scoring logic based on the comparison of the two numeric values from the current round.

    // If the first value is strictly greater than the second value:
    if (numericValues[0] > numericValues[1]) {
        // Add the sum of both values to the first entity's score.
        firstEntityScore += numericValues[0] + numericValues[1];
    }

    // If the first value is strictly less than the second value:
    if (numericValues[0] < numericValues[1]) {
        // Add the sum of both values to the second entity's score.
        secondEntityScore += numericValues[0] + numericValues[1];
    }

    // If both values are equal:
    if (numericValues[0] === numericValues[1]) {
        // Assign the first value directly to the first entity's score.
        firstEntityScore = numericValues[0];
        // Assign the second value directly to the second entity's score.
        secondEntityScore = numericValues[1];
    }
}

// Output the final accumulated scores for both entities, separated by a space.
console.log(firstEntityScore + ' ' + secondEntityScore);