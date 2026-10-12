'use strict';

// This function serves as the primary entry point for processing input data.
// It takes a raw string input, parses it, and applies specific logic.
function ProcessInput(rawData) {
    // The input string is expected to contain multiple lines, with the first line
    // holding two space-separated integer values.
    const parsedLine = rawData.split("\n")[0].split(" ");

    // Extract and convert the first value from the parsed line to an integer.
    const firstVal = parseInt(parsedLine[0], 10);
    // Extract and convert the second value from the parsed line to an integer.
    const secondVal = parseInt(parsedLine[1], 10);

    // Define a collection of specific integer values, referred to as 'groupA'.
    const groupA = [1, 3, 5, 7, 8, 10, 12];
    // Define another collection of specific integer values, referred to as 'groupB'.
    const groupB = [4, 6, 9, 11];

    // Evaluate a compound conditional expression to determine the output.
    // The condition checks if:
    // 1. Both values are exactly 2.
    // OR
    // 2. Both values are found within 'groupA' (with a specific truthiness check for the second value's index).
    // OR
    // 3. Both values are found within 'groupB' (with a specific truthiness check for the second value's index).
    if ((firstVal == 2 && firstVal == secondVal) || (groupA.indexOf(firstVal) >= 0 && groupA.indexOf(secondVal)) || (groupB.indexOf(firstVal) >= 0 && groupB.indexOf(secondVal))) {
        // If any of the conditions are met, print "Yes" to the console.
        console.log("Yes");
    } else {
        // Otherwise, if none of the conditions are met, print "No" to the console.
        console.log("No");
    }
}

// Execute the main processing function by reading input from standard input.
// This is a common pattern for scripts designed to run in environments like competitive programming platforms.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
