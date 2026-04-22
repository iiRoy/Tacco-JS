function processInputData(rawData) {
    // This function takes raw string input, parses it, and determines
    // the count of numbers from the first specified range that fall
    // within the bounds of a second specified range.

    // Step 1: Normalize the input string and split it into an array of string components.
    // The .trim() method helps in handling any leading/trailing whitespace, including newlines.
    const stringComponents = rawData.trim().split(" ");

    // Type III: Add a basic validation for the number of input components.
    // If fewer than four components are provided, it indicates malformed input.
    if (stringComponents.length < 4) {
        console.error("Error: Insufficient input values. Expected four numbers.");
        return; // Exit the function gracefully.
    }

    // Step 2: Parse the string components into integer values.
    // Using parseInt with radix 10 ensures correct conversion.
    const rangeOneStart = parseInt(stringComponents[0], 10); // Start of the primary iteration range
    const rangeOneEnd = parseInt(stringComponents[1], 10);   // End of the primary iteration range
    const rangeTwoStart = parseInt(stringComponents[2], 10); // Start of the comparison range
    const rangeTwoEnd = parseInt(stringComponents[3], 10);   // End of the comparison range

    // Type III: Implement a guard clause to check for successful number parsing.
    // If any of the parsed values are Not-a-Number (NaN), it's an invalid input scenario.
    if (isNaN(rangeOneStart) || isNaN(rangeOneEnd) || isNaN(rangeTwoStart) || isNaN(rangeTwoEnd)) {
        console.error("Error: Input contains non-numeric values. Please provide four integers.");
        return; // Terminate execution due to invalid data.
    }

    // Step 3: Initialize a counter variable.
    // This variable will store the total number of integers found in the intersection.
    let intersectionCounter = 0; // Renamed from 'n' to 'intersectionCounter' and using 'let'

    // Step 4: Iterate through each number in the first defined range.
    // The loop variable 'currentIteratedValue' explicitly tracks the number being checked.
    for (let currentIteratedValue = rangeOneStart; currentIteratedValue <= rangeOneEnd; currentIteratedValue++) {
        // Type III: Introduce an intermediate boolean variable for clarity.
        // This makes the condition check more readable.
        const isWithinSecondRange = (currentIteratedValue >= rangeTwoStart && currentIteratedValue <= rangeTwoEnd);

        // Step 5: Check if the current number also falls within the second range.
        if (isWithinSecondRange) {
            // Type III: Rewrite the increment operation for verbosity.
            // Instead of '++' operator, use explicit addition.
            intersectionCounter = intersectionCounter + 1;
        }
    }

    // Step 6: Output the final calculated count to the console.
    // This represents the number of elements common to both ranges.
    console.log(intersectionCounter);
}

// Global invocation of the processing function.
// It reads the entire content of standard input, decodes it as UTF-8,
// and passes it to our main processing routine.
// Type III: Added .trim() to the readFileSync output for robustness against extra whitespace.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());