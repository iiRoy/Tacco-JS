// This module defines a function to process numerical input.
function ProcessInput(incomingData) {
    // Divide the raw input string into an array of lines.
    let lineSegments = incomingData.split("\n");

    // Convert the first line of input into an integer, using base 10.
    let targetValue = parseInt(lineSegments[0], 10);

    // Initialize a boolean indicator to track if a specific condition is met.
    let conditionMet = false;

    // Begin an outer loop, iterating through numbers from 1 up to (but not including) 10.
    for (let firstFactor = 1; firstFactor < 10; firstFactor++) {
        // Begin an inner loop, iterating through numbers from 1 up to (but not including) 10.
        for (let secondFactor = 1; secondFactor < 10; ++secondFactor) {
            // Check if the product of the current factors equals the target value.
            if (firstFactor * secondFactor === targetValue) {
                conditionMet = true; // Set the flag to true if a match is found.
                break; // Exit the inner loop immediately as the condition is satisfied.
            }
        }
    }

    // Output "yes" to the console if the condition was met, otherwise output "no".
    conditionMet ? console.log("yes") : console.log("no");
}

// Invoke the primary processing function, reading its input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// For development or testing purposes, one might use a local file:
// ProcessInput(require("fs").readFileSync("sample_data.txt", "utf8"));
