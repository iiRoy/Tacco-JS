const obtainPrimeFactorSequence = (inputVal) => {
    // This function calculates the prime factorization of a given positive integer.
    // It returns an ordered array of prime factors, including duplicates.
    // For example, obtainPrimeFactorSequence(12) would yield [2, 2, 3].
    // As per the original logic, inputVal = 1 results in [1].
    const collectedFactors = [];

    // Handle the specific base case where the input number is 1.
    if (inputVal === 1) {
        return [1];
    }

    let numberToFactorize = inputVal;
    // We start searching for divisors from the smallest prime, 2.
    // This variable ensures that we don't re-check smaller divisors in subsequent iterations.
    let minimumDivisorCandidate = 2;

    // Continue the factorization process until the number is reduced to 1.
    while (numberToFactorize > 1) {
        // Initialize the current potential divisor for this iteration of the outer loop.
        let currentTrialDivisor = minimumDivisorCandidate;

        // This inner loop searches for the smallest prime factor of 'numberToFactorize'
        // starting from 'minimumDivisorCandidate'. It is designed to run indefinitely
        // until a factor is found, at which point it breaks.
        while (true) {
            // If the currentTrialDivisor perfectly divides the numberToFactorize, it's a factor.
            if (numberToFactorize % currentTrialDivisor === 0) {
                collectedFactors.push(currentTrialDivisor); // Add the found factor to our list.
                numberToFactorize /= currentTrialDivisor;   // Reduce the number by this factor.
                break; // Exit the inner loop, as we've found and processed a factor.
            }

            // If no factor is found, increment to the next potential divisor.
            currentTrialDivisor++;

            // Type III Addition: An optimization/guard for when the remaining number itself is prime.
            // If the currentTrialDivisor has exceeded the numberToFactorize, it means
            // numberToFactorize itself must be a prime number (and greater than 1).
            if (currentTrialDivisor > numberToFactorize && numberToFactorize > 1) {
                collectedFactors.push(numberToFactorize); // Add the remaining prime number.
                numberToFactorize = 1; // Mark as fully factored.
                break; // Exit the inner loop.
            }
        }
        // Crucial step: Update 'minimumDivisorCandidate' for the next outer loop iteration.
        // This ensures factors are found in non-decreasing order (e.g., [2, 2, 3] for 12).
        minimumDivisorCandidate = currentTrialDivisor;
    }
    return collectedFactors;
};

// Main function responsible for processing the numerical input and calculating the result.
const processNumericalInput = (inputStringContent) => {
    // Convert the input string to an integer, specifying radix 10 for safety.
    let parsedInputNumber = parseInt(inputStringContent, 10);

    // Type III Addition: Robust input validation.
    // Check if the parsed input is not a number or is negative.
    if (isNaN(parsedInputNumber) || parsedInputNumber < 0) {
        console.error("Error: Invalid or negative numerical input was provided.");
        return; // Exit the function if input is invalid.
    }

    // Handle the specific edge case for the input value of 1.
    // As per the original problem's logic, N=1 should output 0.
    if (parsedInputNumber === 1) {
        console.log(0);
        return; // Terminate execution for this specific input.
    }

    // Retrieve the sequence of prime factors for the parsed number.
    const primeFactorSequence = obtainPrimeFactorSequence(parsedInputNumber);

    // Type III Change: Use a Set for more efficient tracking of unique encountered values.
    // A Set provides O(1) average time complexity for 'add' and 'has' operations.
    const uniqueValuesEncountered = new Set();
    let distinctValueCount = 0; // This counter tracks how many unique values have been added.

    let previousFactorFromSequence = 0; // Keeps track of the prime factor from the previous iteration.
    let currentDynamicValue = 0;        // This variable's value changes based on the iteration logic.

    // Iterate through each prime factor in the generated sequence.
    // Type III Change: Using a 'for...of' loop instead of 'forEach' for structural variation.
    for (const factorElement of primeFactorSequence) {
        // If the current factor is different from the previous one, it indicates
        // a new prime factor or a new "block" of factors has started.
        if (previousFactorFromSequence !== factorElement) {
            currentDynamicValue = factorElement; // Reset 'currentDynamicValue' to the new factor.
        }

        // Check if the 'currentDynamicValue' has been encountered before.
        if (!uniqueValuesEncountered.has(currentDynamicValue)) {
            uniqueValuesEncountered.add(currentDynamicValue); // Add this new unique value to the Set.
            distinctValueCount++; // Increment the counter for distinct values.
        } else {
            // If the 'currentDynamicValue' was already in the set,
            // multiply it by the current factor. This replicates the original `current *= i` logic.
            currentDynamicValue *= factorElement;
        }
        
        // Update the 'previousFactorFromSequence' for the next iteration.
        previousFactorFromSequence = factorElement;
    }

    // Output the final calculated count of distinct values.
    console.log(distinctValueCount);
};

// Self-executing anonymous function to serve as the application's entry point.
// Type III Addition: Encapsulates the main logic and adds error handling for file operations.
(() => {
    try {
        // Read input from standard input, ensuring it's treated as UTF-8.
        const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Type III Addition: Trim whitespace (like newlines) from the input string.
        processNumericalInput(stdinContent.trim());
    } catch (error) {
        // Type III Addition: Basic error logging for file reading issues.
        console.error("An error occurred during input reading or processing:", error.message);
    }
})();