'use strict';

// Function to determine the largest perfect square not exceeding a given input value.
function findLargestPerfectSquare(rawInputData) {
    // Step 1: Prepare the input string by removing leading/trailing whitespace.
    // This creates an intermediate string variable.
    let trimmedString = rawInputData.trim();

    // Step 2: Convert the cleaned string into a numerical value.
    // Using Number() for parsing, which can handle more cases than parseInt()
    // and also explicitly signals a data type conversion.
    let parsedInteger = Number(trimmedString);

    // Step 3: Implement robust initial validation for the numerical input.
    // This extended guard clause checks for non-numeric input or values that are zero or negative.
    // If the input is invalid, a warning is issued, and the function exits without further processing.
    if (isNaN(parsedInteger) || parsedInteger <= 0) {
        console.warn(`Warning: Invalid or non-positive input provided. Received: "${rawInputData}". Expected a positive integer.`);
        return; // Early exit for invalid scenarios.
    }

    // Step 4: Iterate downwards from the parsed input value to find the first perfect square.
    // A 'while' loop is used instead of a 'for' loop for structural variation,
    // explicitly managing the decrementing counter.
    let currentCandidate = parsedInteger;
    while (currentCandidate > 0) {
        // Step 5: Calculate the square root of the current candidate number.
        // This intermediate step stores the square root for clarity.
        let potentialRoot = Math.sqrt(currentCandidate);

        // Step 6: Check if the calculated square root is an integer.
        // This is an updated method for determining if a number is a perfect square,
        // offering better readability and potentially precision over the modulo operator for floating points.
        if (Number.isInteger(potentialRoot)) {
            // Step 7: Log the discovered perfect square.
            // Using template literals for a more descriptive output message.
            // This clearly indicates what value has been found.
            console.log(`Discovered the largest perfect square not exceeding ${parsedInteger}: ${currentCandidate}`);
            return; // Exit immediately after the first (and largest) perfect square is found.
        }

        // Step 8: Decrement the candidate number to check the next smaller integer.
        currentCandidate--;
    }

    // Optional: If the loop completes without finding any perfect square (e.g., input was 0 or 1, but 1 is a perfect square).
    // For inputs greater than 0, 1 will always be found as a perfect square unless the initial input is 0.
    // Given the `parsedInteger <= 0` guard, this line is practically unreachable for valid inputs.
    // However, as a Type III change, adding a default message for such edge cases can be considered.
    // For this specific problem, it's implied that a square will always be found if input > 0 (1 is always a square).
    // So, this additional print is not strictly necessary for *correctness* but demonstrates an added fragment.
    // For now, let's omit an "unfound" message as it implies an error for valid > 0 input.
}


// The following section handles standard input/output operations.
// It is explicitly marked not to be edited as per the original problem statement,
// however, the function name called must be updated to match the new function name.
// This part reads all input at once and passes it to the primary processing function.
findLargestPerfectSquare(require("fs").readFileSync("/dev/stdin", "utf8"));