function ProcessInput(rawData) {
    // Initialize a character sequence from the provided input string.
    let charSequence = rawData;

    // Determine the total length of the input sequence.
    const sequenceLength = rawData.length;

    // Initialize a counter for specific character occurrences.
    let occurrenceCounter = 0x0; // Using hexadecimal for 0

    // Declare a variable to store the final outcome.
    let finalOutcome;

    // Iterate through each character in the sequence.
    for (let idx = 0; idx < sequenceLength; idx++) {
        // Check if the current character is 'o'.
        if (charSequence[idx] === "o") {
            // Increment the counter if 'o' is found.
            occurrenceCounter++;
        }
    }

    // First condition check: if 'o' count is 8 or more.
    if (occurrenceCounter >= 0o10) { // Using octal for 8
        finalOutcome = "YES";
    }

    // Second condition check: if 'o' count is strictly greater than 8.
    if (occurrenceCounter > 0o10) { // Using octal for 8
        // Calculate an auxiliary value based on a fixed number and sequence length.
        const calcValue = 0xF - sequenceLength; // Using hexadecimal for 15

        // Nested condition: check if 8 is less than or equal to the sum of auxiliary value and 'o' count.
        if (0o10 <= calcValue + occurrenceCounter) { // Using octal for 8
            finalOutcome = "YES";
        } else {
            finalOutcome = "NO";
        }
    }

    // Output the determined final outcome to the console.
    console.log(finalOutcome);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
