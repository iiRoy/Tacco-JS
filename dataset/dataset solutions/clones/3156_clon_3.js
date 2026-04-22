/**
 * Processes a raw string input to identify the Kth largest common divisor
 * shared between two positive integers.
 *
 * @param {string} inputStringData - A space-separated string containing three numerical values:
 *                                   the first number, the second number, and the rank (K).
 */
function calculateNthLargestCommonDivisor(inputStringData) {

    // --- Phase 1: Input Parsing and Initial Verification ---
    const segments = inputStringData.split(' '); // Divide the input string into individual components

    // Ensure all expected parameters are present.
    if (segments.length < 3) {
        console.error("Input Error: Expected three numeric parameters (num1, num2, K), but fewer were provided.");
        return;
    }

    // Convert string segments to integer types.
    // Using parseInt with radix 10 for explicit base conversion.
    const primaryValueOne = parseInt(segments[0], 10);
    const primaryValueTwo = parseInt(segments[1], 10);
    const desiredRank = parseInt(segments[2], 10);

    // Validate that the parsed values are indeed numbers and positive.
    if (isNaN(primaryValueOne) || isNaN(primaryValueTwo) || isNaN(desiredRank)) {
        console.error("Input Error: One or more provided values are not valid integers.");
        return;
    }

    if (primaryValueOne <= 0 || primaryValueTwo <= 0 || desiredRank <= 0) {
        console.error("Input Error: All numerical inputs (number1, number2, and K) must be positive integers.");
        return;
    }

    // Determine the smaller and larger of the two primary numbers.
    // This helps optimize the divisor search range.
    let smallestInputNumber;
    let largestInputNumber;

    if (primaryValueOne < primaryValueTwo) {
        smallestInputNumber = primaryValueOne;
        largestInputNumber = primaryValueTwo;
    } else {
        smallestInputNumber = primaryValueTwo;
        largestInputNumber = primaryValueOne;
    }

    // --- Phase 2: Identification of All Common Divisors ---
    const discoveredCommonDivisors = []; // Array to store all common divisors found.

    // Iterate from 1 up to the smallest of the two numbers.
    // A common divisor cannot exceed the smaller of the two numbers.
    for (let currentDivisorCandidate = 1; currentDivisorCandidate <= smallestInputNumber; currentDivisorCandidate++) {

        // Check if the current candidate divides the first number without a remainder.
        const dividesPrimaryOne = (primaryValueOne % currentDivisorCandidate === 0);
        // Check if the current candidate divides the second number without a remainder.
        const dividesPrimaryTwo = (primaryValueTwo % currentDivisorCandidate === 0);

        // If the candidate divides both numbers, it's a common divisor.
        if (dividesPrimaryOne && dividesPrimaryTwo) {
            discoveredCommonDivisors.push(currentDivisorCandidate);
        }
    }

    // --- Phase 3: Selection and Output of the Nth Largest Divisor ---

    const totalDivisorsFound = discoveredCommonDivisors.length;

    // Guard clause: Ensure the requested rank K is valid for the found divisors.
    if (desiredRank > totalDivisorsFound) {
        console.warn(`Warning: The requested rank (${desiredRank}) is greater than the total number of common divisors found (${totalDivisorsFound}). Cannot retrieve result.`);
        return;
    }

    // Common divisors are collected in ascending order.
    // To find the Kth largest, we access the element from the end of the array.
    // For example: 1st largest is at index (length - 1), 2nd largest at (length - 2), etc.
    const targetIndexFromEnd = totalDivisorsFound - desiredRank;

    // Retrieve the specific common divisor at the calculated index.
    const finalDesiredCommonDivisor = discoveredCommonDivisors[targetIndexFromEnd];

    // Display the computed result.
    console.log(finalDesiredCommonDivisor);
}