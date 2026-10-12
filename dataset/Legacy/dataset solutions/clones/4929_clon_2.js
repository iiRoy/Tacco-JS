function ProcessInput(rawData) {
    // This function processes the given input string.
    let charArray = rawData.split(""); // Convert the input string into an array of characters.

    // Define the reference sequence for comparison.
    const targetSequence = [
        "C", "O", "D", "E", "F", "E", "S", "T", "I", "V", "A", "L", "2", "0", "1", "6"
    ];

    let mismatchCount = 0; // Initialize a counter for differing characters.

    // Iterate through the character array from the input.
    for (let idx = 0; idx < charArray.length; idx++) {
        // Compare the character from the input with the character in the reference sequence at the same position.
        if (charArray[idx] !== targetSequence[idx]) {
            mismatchCount++; // Increment the counter if a mismatch is found.
        }
    }

    // Output the final count of mismatches to the console.
    console.log(mismatchCount);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and pass to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
