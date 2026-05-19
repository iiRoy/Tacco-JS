function ProcessInput(rawData) {
    // This function analyzes a string of space-separated values.
    // It aims to determine if specific numeric strings are present among the first four elements.

    // Split the incoming raw data string into an array of substrings using space as a delimiter.
    let parsedValues = rawData.split(" ");

    // Initialize indicator flags for the presence of each target digit.
    // A value of 0 means the digit has not yet been found; 1 means it has.
    let foundOne = 0;
    let foundNine = 0;
    let foundSeven = 0;
    let foundFour = 0;

    // Initialize a counter to track how many of the target digits have been identified.
    let matchCount = 0;

    // Loop through the first four elements of the `parsedValues` array.
    // The loop variable `idx` goes from 0 up to (but not including) 4.
    for (let idx = 0; idx < 4; idx++) {
        // Check if the current element is the string "1".
        if (parsedValues[idx] === "1") {
            foundOne = 1; // Set the flag for "1" to true.
            matchCount++; // Increment the total count of matched digits.
        }
        // Check if the current element is the string "9".
        if (parsedValues[idx] === "9") {
            foundNine = 1; // Set the flag for "9" to true.
            matchCount++; // Increment the total count of matched digits.
        }
        // Check if the current element is the string "7".
        if (parsedValues[idx] === "7") {
            foundSeven = 1; // Set the flag for "7" to true.
            matchCount++; // Increment the total count of matched digits.
        }
        // Check if the current element is the string "4".
        if (parsedValues[idx] === "4") {
            foundFour = 1; // Set the flag for "4" to true.
            matchCount++; // Increment the total count of matched digits.
        }
    }

    // After iterating through all relevant elements, evaluate the final conditions.
    // All four specific digits ("1", "9", "7", "4") must have been found (their flags are 1),
    // AND the total count of matched digits must be exactly 4 (ensuring each was found once).
    if (foundOne === 1 && foundNine === 1 && foundSeven === 1 && foundFour === 1 && matchCount === 4) {
        console.log("YES"); // If all conditions are met, print "YES".
    } else {
        console.log("NO"); // Otherwise, print "NO".
    }
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this string to the `ProcessInput` function for analysis.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
