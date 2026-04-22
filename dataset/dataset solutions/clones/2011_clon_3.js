function FindNthSteppingNumber(rawInputData) {
    // Parse the input string to get the desired rank (K) of the stepping number.
    const desiredRank = parseInt(rawInputData, 10);

    // Helper function to extract a digit from a number string at a given index.
    // Index 0 is the leftmost digit.
    const getNumericDigit = (numString, index) => parseInt(numString[index], 10);

    // Helper function to calculate powers of 10.
    const powerOfTen = (exponent) => Math.pow(10, exponent);

    // Early exit for single-digit numbers.
    // All single-digit numbers (0-9) are stepping numbers.
    // If the desired rank is 1-9, the number itself is the answer.
    if (desiredRank < 10) {
        console.log(desiredRank);
        return;
    }

    // Helper function to determine if a given number is a "stepping number".
    // A stepping number has adjacent digits that differ by at most 1.
    const isNumberStepping = (numberToCheck) => {
        const numStr = String(numberToCheck);
        // Single-digit numbers are inherently stepping numbers.
        if (numStr.length === 1) {
            return true;
        }

        // Iterate through adjacent pairs of digits.
        for (let digitPosition = 0; digitPosition < numStr.length - 1; digitPosition++) {
            const currentDigit = getNumericDigit(numStr, digitPosition);
            const nextDigit = getNumericDigit(numStr, digitPosition + 1);

            // If the absolute difference between adjacent digits is greater than 1,
            // it's not a stepping number.
            if (Math.abs(currentDigit - nextDigit) > 1) {
                return false;
            }
        }
        // If all adjacent pairs satisfy the condition, it is a stepping number.
        return true;
    };

    // Initialize the count of stepping numbers found so far.
    // All numbers from 0 to 9 (10 numbers) are stepping numbers.
    let foundSteppingNumbersCount = 9; // We start counting from 9 because 0-9 are already handled/counted.
    // Initialize the current number being evaluated.
    // We start checking from 9, as the loop will increment it to 10 for the first check.
    let currentCandidateValue = 9;

    // Continue searching until we have found the desired rank of stepping numbers.
    while (foundSteppingNumbersCount < desiredRank) {
        // Increment to the next integer to evaluate.
        currentCandidateValue++;

        // Convert the current number to a string for digit-based operations.
        const candidateAsString = String(currentCandidateValue);
        const candidateLength = candidateAsString.length;

        // Apply optimizations to skip large blocks of non-stepping numbers,
        // similar to the original code's heuristic jumps.
        if (candidateLength > 1) { // Optimizations apply only to multi-digit numbers.
            const firstDigitVal = getNumericDigit(candidateAsString, 0);
            const secondDigitVal = getNumericDigit(candidateAsString, 1);

            // Optimization 1: If the second digit is too large relative to the first (e.g., 13, 24).
            // This means 'firstDigitVal' followed by 'secondDigitVal' is an invalid prefix.
            // We can jump to the next block of numbers starting with (firstDigitVal + 1)
            // followed by zeros. E.g., from 13x -> 200...
            if (secondDigitVal >= firstDigitVal + 2) {
                currentCandidateValue = (firstDigitVal + 1) * powerOfTen(candidateLength - 1);
                continue; // Skip the full stepping number check for this 'jumped' number.
            }

            // Optimization 2: If the first digit is too large relative to the second (e.g., 31, 40).
            // This means 'firstDigitVal' followed by 'secondDigitVal' is an invalid prefix.
            // We can jump to a number that starts with 'firstDigitVal' and has
            // (firstDigitVal - 1) as its second digit, preserving the remaining digits.
            // E.g., from 312 -> 322.
            if (firstDigitVal >= secondDigitVal + 2) {
                // Construct the new number:
                // 1. The block representing the first digit (e.g., 300 for 312).
                const firstDigitBlock = firstDigitVal * powerOfTen(candidateLength - 1);
                // 2. The block representing the adjusted second digit (e.g., 20 for 312, where 2 is 3-1).
                const adjustedSecondDigitBlock = (firstDigitVal - 1) * powerOfTen(candidateLength - 2);
                // 3. The remainder of the number (digits from the third position onwards, e.g., 2 for 312).
                const remainingDigits = currentCandidateValue % powerOfTen(candidateLength - 2);

                currentCandidateValue = firstDigitBlock + adjustedSecondDigitBlock + remainingDigits;
                continue; // Skip the full stepping number check for this 'jumped' number.
            }
        }

        // If no optimization jump occurred, or if the number is single-digit,
        // perform the full check.
        if (isNumberStepping(currentCandidateValue)) {
            foundSteppingNumbersCount++; // Increment the count if it's a stepping number.
        }
    }

    // Once the loop terminates, currentCandidateValue holds the desired N-th stepping number.
    console.log(currentCandidateValue);
}

// Standard competitive programming input reading.
// Reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to the main function.
FindNthSteppingNumber(require("fs").readFileSync("/dev/stdin", "utf8"));