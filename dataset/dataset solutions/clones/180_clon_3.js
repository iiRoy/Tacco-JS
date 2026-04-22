// Function to ascertain if a given integer is a prime number.
// This implementation uses an optimized approach by checking divisibility
// by 2, 3, and then numbers of the form 6k ± 1.
function testForPrimality(candidateValue) {
    // Input validation: Ensure the candidate is a valid integer.
    if (typeof candidateValue !== 'number' || !Number.isInteger(candidateValue)) {
        // Prime numbers are defined for positive integers. Non-integers or other types are not prime.
        return false;
    }

    // Primes are positive integers greater than 1.
    if (candidateValue <= 1) {
        return false;
    }

    // Handle the first few prime numbers directly for efficiency.
    // This also covers 2 and 3, which are special cases in the 6k ± 1 rule.
    if (candidateValue === 2 || candidateValue === 3) {
        return true;
    }

    // If divisible by 2 or 3, it's not prime (and already handled 2, 3 above).
    if (candidateValue % 2 === 0 || candidateValue % 3 === 0) {
        return false;
    }

    // All primes greater than 3 can be expressed in the form 6k ± 1.
    // We only need to check for divisors up to the square root of the candidate.
    // Using Math.floor to ensure integer limit.
    const divisorCheckLimit = Math.floor(Math.sqrt(candidateValue));

    let k_factor = 1; // Our 'k' in 6k ± 1
    // Loop through numbers of the form 6k - 1 and 6k + 1.
    // The loop continues as long as the potential divisor (6k - 1) is within the check limit.
    while ((6 * k_factor - 1) <= divisorCheckLimit) {
        const potentialDivisorA = 6 * k_factor - 1;
        const potentialDivisorB = 6 * k_factor + 1;

        // Check divisibility by both forms.
        if (candidateValue % potentialDivisorA === 0 || candidateValue % potentialDivisorB === 0) {
            return false; // Found a divisor, so it's not prime.
        }
        k_factor++; // Increment k for the next pair of potential divisors.
    }

    // If no divisors were found within the limit, the number is prime.
    return true;
}

// Helper function to abstract input reading from standard input.
function retrieveInputRecords() {
    try {
        // Attempt to read file content from /dev/stdin.
        const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Trim leading/trailing whitespace and split into lines.
        // Filter out any empty lines that might result from extra newlines.
        return rawFileContent.trim().split('\n').filter(lineEntry => lineEntry.length > 0);
    } catch (error) {
        // Log an error if input reading fails.
        console.error("Error encountered while attempting to read input:", error.message);
        // Return an empty array to prevent further processing on invalid input.
        return [];
    }
}

// Main execution block: Process each numerical record from the input.
const arrayOfNumberStrings = retrieveInputRecords();

for (let recordIndex = 0; recordIndex < arrayOfNumberStrings.length; recordIndex++) {
    const currentInputString = arrayOfNumberStrings[recordIndex];
    // Convert string to number, explicitly specifying base 10 for robustness.
    const primaryTargetNumber = Number.parseInt(currentInputString, 10);

    // Basic validation for the parsed number. Skip if it's not a valid integer.
    if (Number.isNaN(primaryTargetNumber) || !Number.isInteger(primaryTargetNumber)) {
        // Optionally, a warning could be logged here.
        // console.warn(`Skipping invalid or non-integer input: "${currentInputString}"`);
        continue; // Move to the next input record.
    }

    let greatestPrecedingPrime = null; // Variable to store the largest prime less than primaryTargetNumber.
    let smallestFollowingPrime = null;  // Variable to store the smallest prime greater than primaryTargetNumber.

    // Flags to track if we've found the required primes.
    let foundPrecedingPrime = false; // This flag is more for logical clarity than strict loop control.
    let foundFollowingPrime = false;

    // Search for primes.
    // Start search from 2, as it's the smallest prime.
    let primeSearchIterator = 2;

    // Continue searching until both the preceding and following primes are identified.
    while (!foundFollowingPrime || (primaryTargetNumber > 2 && greatestPrecedingPrime === null)) {
        // Check if the current searchIterator is prime.
        const isCurrentIterPrime = testForPrimality(primeSearchIterator);

        // Logic to find the greatest prime less than primaryTargetNumber.
        if (isCurrentIterPrime && primeSearchIterator < primaryTargetNumber) {
            greatestPrecedingPrime = primeSearchIterator;
            // The flag 'foundPrecedingPrime' is set, but we continue searching for a larger one.
            foundPrecedingPrime = true;
        }

        // Logic to find the smallest prime greater than primaryTargetNumber.
        if (!foundFollowingPrime && isCurrentIterPrime && primeSearchIterator > primaryTargetNumber) {
            smallestFollowingPrime = primeSearchIterator;
            foundFollowingPrime = true; // Once found, this value is final.
        }

        // Increment the iterator. Optimized to check only odd numbers after 2.
        if (primeSearchIterator === 2) {
            primeSearchIterator++; // Move from 2 to 3.
        } else {
            primeSearchIterator += 2; // Move to the next odd number.
        }

        // Introduce a heuristic break condition to prevent excessively long loops
        // in cases where `primaryTargetNumber` is large or edge cases.
        // If smallestFollowingPrime is found and we've searched significantly past the target,
        // and a preceding prime has been identified (or target is 2 and it's null).
        if (foundFollowingPrime && primeSearchIterator > primaryTargetNumber + 200) {
            // This is an added optimization/guard, assuming primes are not extremely sparse.
            break;
        }
    }

    // Output the identified primes for the current input number.
    console.log(greatestPrecedingPrime, smallestFollowingPrime);
}