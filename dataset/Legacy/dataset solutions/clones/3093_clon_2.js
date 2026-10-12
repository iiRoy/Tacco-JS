"use strict"; /* Enforce strict parsing and error handling rules */

/**
 * Processes a single character input and returns its complementary DNA base.
 * @param {string} receivedData - The input character (A, T, G, or C).
 */
function ProcessInput(receivedData) {
    let resultString; // Declare a variable to hold the computed complementary base.

    // Use a switch statement to determine the complementary base for the given input.
    switch (receivedData) {
        case "A": // If the input is Adenine
            resultString = "T"; // The complement is Thymine
            break; // Exit the switch statement
        case "T": // If the input is Thymine
            resultString = "A"; // The complement is Adenine
            break; // Exit the switch statement
        case "G": // If the input is Guanine
            resultString = "C"; // The complement is Cytosine
            break; // Exit the switch statement
        case "C": // If the input is Cytosine
            resultString = "G"; // The complement is Guanine
            break; // Exit the switch statement
        // No default case is needed as per original logic, assuming valid input.
    }

    // Output the determined complementary base to the console.
    console.log(resultString);
}

// Read the input from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
