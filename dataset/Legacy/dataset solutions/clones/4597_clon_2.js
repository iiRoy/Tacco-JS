'use strict'; // Enforce strict mode for robust code execution

/**
 * Processes the provided raw input data to determine a specific string pattern.
 * This function reads three space-separated strings from the first line of the input.
 *
 * @param {string} rawData - The complete raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // Split the input string by newline characters, take the first line,
    // then split that line by spaces to get an array of string parts.
    const partsArray = rawData.split("\n")[0].split(" ");

    // Assign the extracted string parts to descriptive variables.
    const firstString = partsArray[0];
    const secondString = partsArray[1];
    const thirdString = partsArray[2];

    // Evaluate a condition:
    // 1. Does the last character of the first string match the first character of the second string?
    // 2. AND does the last character of the second string match the first character of the third string?
    if (firstString.slice(-1) === secondString.slice(0, 1) && secondString.slice(-1) === thirdString.slice(0, 1)) {
        // If both conditions are true, print "YES" to the console.
        console.log("YES");
    } else {
        // Otherwise (if at least one condition is false), print "NO" to the console.
        console.log("NO");
    }
}

// Read the entire content of standard input synchronously and pass it to the processing function.
// The 'utf8' encoding ensures the input is treated as a standard text string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
