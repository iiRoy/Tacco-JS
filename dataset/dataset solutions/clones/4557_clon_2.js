'use strict';

/**
 * Processes raw input data to determine a specific condition.
 * This function reads two numbers and checks if they satisfy certain criteria
 * based on predefined groups of numbers.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
    // Split the input string by newline, take the first line, then split by space
    // to extract the two numerical values.
    const parsedValues = rawData.split("\n")[0].split(" ");

    // Convert the first extracted string to an integer.
    const firstVal = parseInt(parsedValues[0], 10);
    // Convert the second extracted string to an integer.
    const secondVal = parseInt(parsedValues[1], 10);

    // Define the first set of reference numbers.
    const groupA = [1, 3, 5, 7, 8, 10, 12];
    // Define the second set of reference numbers.
    const groupB = [4, 6, 9, 11];

    // Evaluate the complex condition:
    // 1. Both values are exactly 2.
    // 2. Both values are present in 'groupA', with a specific truthiness check for the second value's index.
    // 3. Both values are present in 'groupB', with a specific truthiness check for the second value's index.
    if ((firstVal === 2 && firstVal === secondVal) || (groupA.indexOf(firstVal) >= 0 && groupA.indexOf(secondVal)) || (groupB.indexOf(firstVal) >= 0 && groupB.indexOf(secondVal))) {
        // If any of the conditions are met, print "Yes".
        console.log("Yes");
    } else {
        // Otherwise, print "No".
        console.log("No");
    }
}

// Read the entire content of standard input synchronously,
// using UTF-8 encoding, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
