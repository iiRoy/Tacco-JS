"use strict"; // Enforce strict mode for cleaner code and error prevention

function ProcessInput(rawData) {
    // Convert the incoming string data into an array of individual characters.
    const charArray = rawData.split("");

    // Initialize a counter to track the number of character mismatches.
    let mismatchCount = 0;

    // Iterate through the first half of the character array.
    // Math.ceil is used to correctly handle strings with an odd number of characters,
    // ensuring the loop covers up to the middle character (inclusive for the first half).
    for (let idx = 0; idx < Math.ceil(charArray.length / 2); idx++) {
        // Compare the character at the current index with its corresponding character
        // from the opposite end of the array.
        if (charArray[idx] !== charArray[charArray.length - 1 - idx]) {
            // If the characters do not match, increment the mismatch counter.
            mismatchCount++;
        }
    }

    // Output the final count of character mismatches to the console.
    console.log(mismatchCount);
}

// Read the entire content from standard input as a UTF-8 encoded string,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
