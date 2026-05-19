"use strict";

/**
 * This function processes input data to find a specific character based on certain conditions.
 * It reads two lines from the input: a target string and a numerical limit.
 * @param {string} rawData The complete input string received from standard input.
 */
function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    let dataRows = rawData.split("\n");

    // Extract the first line, remove leading/trailing whitespace, and store it as the target string.
    let targetString = dataRows.shift().trim();

    // Extract the second line, remove whitespace, and store it as the limit index.
    let limitIndex = dataRows.shift().trim();

    // Iterate through the target string. The loop continues as long as the current index
    // is less than the specified limit and also less than the length of the target string.
    for (let idx = 0; idx < limitIndex && idx < targetString.length; idx++) {
        // Check if the character at the current position is not the digit '1'.
        if (targetString.charAt(idx) !== '1') {
            // If a character other than '1' is found, print it to the console.
            console.log(targetString.charAt(idx));
            // Immediately exit the function after printing the first non-'1' character.
            return;
        }
    }

    // If the loop completes without finding any character other than '1' (meaning all
    // characters up to 'limitIndex - 1' were '1'), then print the character at the 'limitIndex'.
    console.log(targetString.charAt(limitIndex));
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
