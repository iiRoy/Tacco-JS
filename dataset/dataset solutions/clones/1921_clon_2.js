"use strict";

// This function processes the entire input string to calculate a maximum score.
const processInput = (inputString) => {
    // Split the input into individual lines and remove leading/trailing whitespace.
    const lines = inputString.trim().split("\n");

    // Parse the first line to get the problem parameters:
    // numElements: The desired length of the sequence.
    // maxValue: The maximum value an element in the sequence can take.
    // numQueries: The total number of conditions to check.
    const [numElements, maxValue, numQueries] = lines[0].split(" ").map(elementStr => parseInt(elementStr, 10));

    // Initialize an array to store the details of each query.
    let queryDetails = [];
    // Populate the query details array from the subsequent input lines.
    for (let queryIndex = 1; queryIndex <= numQueries; queryIndex++) {
        queryDetails.push(lines[queryIndex].split(" ").map(valStr => parseInt(valStr, 10)));
    }

    // Initialize the maximum score found so far.
    let maxScore = 0;

    // Define a recursive depth-first search function to explore all valid sequences.
    // currentStartValue: The smallest value allowed for the next element in the sequence.
    // currentSequence: The sequence built so far.
    const exploreCombinations = function(currentStartValue, currentSequence) {
        // Base case: If the sequence has reached the desired length.
        if (currentSequence.length === numElements) {
            let currentScore = 0; // Initialize score for the current sequence.
            // Iterate through all queries to calculate the score for this sequence.
            for (let qIdx = 0; qIdx < numQueries; qIdx++) {
                // Check if the condition for the current query is met.
                // queryDetails[qIdx][1] is b, queryDetails[qIdx][0] is a, queryDetails[qIdx][2] is c, queryDetails[qIdx][3] is d.
                if (currentSequence[queryDetails[qIdx][1] - 1] - currentSequence[queryDetails[qIdx][0] - 1] === queryDetails[qIdx][2]) {
                    currentScore += queryDetails[qIdx][3]; // Add d to the score if condition holds.
                }
            }
            // Update the overall maximum score if the current sequence's score is higher.
            maxScore = Math.max(maxScore, currentScore);
            return; // End recursion for this path.
        }

        // Recursive step: Extend the current sequence.
        // Iterate from the currentStartValue up to maxValue.
        for (let nextVal = currentStartValue; nextVal <= maxValue; nextVal++) {
            currentSequence.push(nextVal); // Add the next value to the sequence.
            exploreCombinations(nextVal, currentSequence); // Recurse with the extended sequence.
            currentSequence.pop(); // Backtrack: remove the last added value to explore other paths.
        }
    };

    // Start the depth-first search with an initial value of 1 and an empty sequence.
    exploreCombinations(1, []);

    // Output the final maximum score.
    console.log(maxScore);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
