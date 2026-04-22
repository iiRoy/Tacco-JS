// Helper function to output results to the console.
function printFinalResult(outputPayload) {
    console.log(outputPayload);
}

// Function to determine if a number has exactly eight divisors.
// This helper abstracts the divisor counting logic, a Type III structural addition.
function checkEightDivisors(numToCheck) {
    // Guard clause: numbers less than or equal to zero cannot have 8 positive divisors.
    if (numToCheck <= 0) {
        return false;
    }

    let currentDivisorCount = 0; // Renamed from 'div'
    // Iterates through all possible factors up to the number itself.
    // For performance, this could be optimized to sqrt(numToCheck) but maintains original logic structure.
    for (let factorCandidate = 1; factorCandidate <= numToCheck; factorCandidate++) { // Renamed from 'j'
        if (numToCheck % factorCandidate === 0) {
            currentDivisorCount++; // Increment count if 'factorCandidate' is a divisor.
        }
    }
    return currentDivisorCount === 8; // Returns true if exactly 8 divisors are found.
}

// Primary execution routine for processing the provided data.
function ExecuteProcessingRoutine(rawDataInput) { // Renamed from 'Main', 'input'
    // Attempt to convert the raw input string into a numerical upper boundary.
    // Using Number() for parsing, a Type II change from parseInt().
    let numericalUpperBound = Number(rawDataInput.trim()); // Renamed from 'input'

    // --- Input Validation (Type III addition: guard clauses and checks) ---
    if (isNaN(numericalUpperBound) || numericalUpperBound < 1 || !Number.isInteger(numericalUpperBound)) {
        // Output an error message for invalid input.
        printFinalResult("Error: Invalid numerical input provided. Please ensure it's a positive integer.");
        return; // Terminate execution early for invalid input.
    }
    // --- End Input Validation ---

    let qualifyingNumbersTally = 0; // Renamed from 'count'

    // Iterate through numbers from 1 up to the specified upper bound.
    for (let currentEvaluatedNumber = 1; currentEvaluatedNumber <= numericalUpperBound; currentEvaluatedNumber++) { // Renamed from 'i'
        // Check if the current number is odd using a bitwise AND operation,
        // which is an equivalent but structurally different way of checking 'i % 2 == 1' (Type III update).
        const isCurrentNumberOdd = (currentEvaluatedNumber & 1) !== 0; // Type III: intermediate variable for clarity

        if (isCurrentNumberOdd) {
            // Utilize the newly introduced helper function to check for the divisor condition.
            const hasEightDivisors = checkEightDivisors(currentEvaluatedNumber); // Type III: using new helper

            if (hasEightDivisors) {
                qualifyingNumbersTally++; // Increment the counter for numbers meeting all criteria.
            }
        }
    }
    // Display the final tally of numbers that meet the criteria.
    printFinalResult(qualifyingNumbersTally);
}

// Entry point: Read input from standard input and pass it to the main processing function.
ExecuteProcessingRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));