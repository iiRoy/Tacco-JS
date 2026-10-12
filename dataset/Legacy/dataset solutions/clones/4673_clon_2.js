'use strict';

/*
 * This function processes raw text input to determine a specific outcome.
 * It's designed to compare two parsed values from the input string.
 */
function ProcessInput(rawData) {
    // Split the input by newline, take the first line, then split by space.
    const parsedValues = rawData.split("\n")[0].split(" ");

    // Extract the first component from the parsed array.
    const firstValue = parsedValues[0];
    // Extract the second component from the parsed array.
    const secondValue = parsedValues[1];

    // Compare the two extracted values.
    if (firstValue == secondValue) {
        // If they are identical, log 'H'.
        console.log("H");
    } else {
        // Otherwise, if they differ, log 'D'.
        console.log("D");
    }
}

// Read the content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
