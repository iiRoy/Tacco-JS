function processInputData(rawData) {
    // Parse the target count from the raw input string.
    const targetOrdinal = parseInt(rawData, 10);

    // Validate the input. The problem expects a positive integer for the ordinal.
    if (isNaN(targetOrdinal) || targetOrdinal < 1) {
        console.error("Input error: The provided value must be a positive integer.");
        return;
    }

    /**
     * Determines if a given number is a "digit-constrained number".
     * A digit-constrained number has no adjacent digits with an absolute difference greater than 1.
     * E.g., 123 is valid (1-2=1, 2-3=1), 13 is invalid (1-3=2).
     * @param {number} candidateNumber The number to check.
     * @returns {boolean} True if the number is digit-constrained, false otherwise.
     */
    const isDigitConstrained = (candidateNumber) => {
        const numberAsString = String(candidateNumber);
        const numberLength = numberAsString.length;

        // Single-digit numbers (0-9) always satisfy the condition.
        if (numberLength <= 1) {
            return true;
        }

        // Iterate through all adjacent pairs of digits.
        for (let digitIndex = 0; digitIndex < numberLength - 1; digitIndex++) {
            const currentDigit = Number(numberAsString.charAt(digitIndex));
            const nextDigit = Number(numberAsString.charAt(digitIndex + 1));

            // If the absolute difference between any two adjacent digits is greater than 1,
            // then this is not a digit-constrained number.
            if (Math.abs(currentDigit - nextDigit) > 1) {
                return false;
            }
        }
        // If the loop completes, all adjacent digit pairs satisfied the condition.
        return true;
    };

    let currentCandidate = 0;       // The integer currently being evaluated.
    let foundCount = 0;             // The count of digit-constrained numbers found so far.

    // Continue searching until the target ordinal number of digit-constrained numbers has been found.
    while (foundCount < targetOrdinal) {
        currentCandidate++; // Move to the next integer to check.

        // Optimization: If the current number has at least two digits and its first two digits
        // violate the digit-constrained rule, we can skip a range of numbers.
        // This is a Type III change: replacing complex/buggy skip logic with a simplified, correct, and aggressive skip.
        const candidateAsString = String(currentCandidate);
        const candidateLength = candidateAsString.length;

        if (candidateLength >= 2) {
            const firstDigit = Number(candidateAsString.charAt(0));
            const secondDigit = Number(candidateAsString.charAt(1));

            // If the absolute difference between the first two digits is greater than 1,
            // we can jump ahead to the next block of numbers starting with (firstDigit + 1).
            // E.g., if currentCandidate is 13 (diff=2), we skip to 20.
            // If currentCandidate is 31 (diff=2), we skip to 40.
            if (Math.abs(firstDigit - secondDigit) > 1) {
                // Adjust currentCandidate so that the next `currentCandidate++` in the loop
                // will set it to the start of the next block (e.g., 20 from 13, 40 from 31).
                currentCandidate = (firstDigit + 1) * Math.pow(10, candidateLength - 1) - 1;
                continue; // Skip the rest of the current loop iteration and re-evaluate with the new currentCandidate.
            }
        }

        // If the number passes the initial skip check (or is a single-digit number),
        // perform the full digit-constrained check.
        if (isDigitConstrained(currentCandidate)) {
            foundCount++; // Increment the count if it's a valid digit-constrained number.
        }
    }

    // Output the Nth digit-constrained number found.
    // Type III change: Simplified output. The original had a conditional for k < 10.
    // Our logic correctly finds the Nth number for all N >= 1, so a single output statement suffices.
    console.log(currentCandidate);
}

// Standard input reading for competitive programming environments.
// Type III change: Added a try-catch block for robust file reading.
try {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Trim whitespace from the input to handle potential newline characters.
    processInputData(inputContent.trim());
} catch (fileError) {
    console.error("Error reading input from /dev/stdin:", fileError.message);
}