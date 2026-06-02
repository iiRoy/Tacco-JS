'use strict';

// A very large numerical constant, used as a negative infinity substitute.
const MAX_VAL = 900719925474099;

/**
 * Processes the given input string to solve a dynamic programming problem.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInput(rawData) {
    // Split the input into individual lines and clean up whitespace.
    let lines = rawData.trim().split('\n');
    // Parse the first line to get the count of elements.
    let count = parseInt(lines[0]);
    // Prepare the array of values, prefixing with '0' for 1-based indexing convenience.
    let values = ('0 ' + lines[1]).split(' ').map((item) => parseInt(item));

    // Initialize the dynamic programming table.
    // It's a 2D array, where each row represents a step and columns represent states.
    let dynamicProg = [...new Array(count + 5)].map(() => new Array(2));
    // Base cases for the DP table.
    dynamicProg[0][0] = 0;
    dynamicProg[0][1] = -MAX_VAL;

    // Iterate through the elements to fill the DP table using the defined recurrence relations.
    for (let idx = 1; idx <= count; idx++) {
        // Calculate the state where the current element is NOT "flipped".
        dynamicProg[idx][0] = Math.max(dynamicProg[idx - 1][0] + values[idx], dynamicProg[idx - 1][1] - values[idx]);

        // Calculate the state where the current element IS "flipped".
        dynamicProg[idx][1] = Math.max(dynamicProg[idx - 1][0] - values[idx], dynamicProg[idx - 1][1] + values[idx]);
    }

    // Output the final result, which is the value in the DP table at the last element, state 0.
    // The commented line is for debugging and should not be included in the final output.
    // console.log([...dynamicProg].map((item) => item.join(',')));
    console.log(dynamicProg[count][0]);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
