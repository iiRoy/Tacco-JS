'use strict'; // Activates strict mode for the entire script, helping to catch common coding errors and "unsafe" actions.

/**
 * This function processes the provided raw input string to perform a calculation.
 * It expects the first line of the input to be an integer representing a radius.
 * The function then calculates and prints the circumference of a circle with that radius.
 *
 * @param {string} rawDataString - The complete input received, typically from standard input.
 */
function ProcessInputData(rawDataString) {
    // Split the entire input string into an array of individual lines.
    // This assumes each piece of data is on a new line.
    let inputLinesArray = rawDataString.split("\n");

    // Parse the first element of the array (the first line of input) as an integer.
    // The '10' specifies base-10 for parsing.
    let circleRadius = parseInt(inputLinesArray[0], 10);

    // Calculate the circumference of the circle using the formula 2 * pi * radius.
    // Then, print the calculated value to the console.
    console.log(2 * circleRadius * Math.PI);
}

// This is the entry point of the script.
// It reads the entire content of standard input synchronously as a UTF-8 string,
// and then passes that string to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
