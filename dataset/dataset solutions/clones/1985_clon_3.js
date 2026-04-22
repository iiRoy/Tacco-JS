function determineSharedFactor(valA, valB, valC) {
    // This variable will store the maximum of the three input values.
    // It defines the upper bound for the search of potential common divisors.
    var upperBoundVal = 0;

    // Determine the maximum value efficiently using Math.max.
    // This replaces multiple conditional assignments from the original structure.
    upperBoundVal = Math.max(valA, valB, valC);

    // This variable will accumulate the largest common factor found
    // that also satisfies a specific parity condition.
    var resultantFactor = 0;

    // Iterate through each number starting from 1 up to the determined upper limit.
    // Each 'candidateFactor' is tested to see if it's a common divisor.
    for (var candidateFactor = 1; candidateFactor <= upperBoundVal; candidateFactor++) {
        // Apply a specific filtering condition for candidate factors.
        // This logic includes 1, 2, and all odd numbers, but explicitly excludes
        // even numbers that are greater than 2.
        // The original logic `count <= 2 || count%2!=0` is rewritten for clarity.
        var isCandidateFactorValid = !(candidateFactor > 2 && candidateFactor % 2 === 0);

        if (isCandidateFactorValid) {
            // Check if the current candidateFactor divides all three input values without a remainder.
            // The redundant checks for `valX >= candidateFactor` have been removed,
            // as `valX % candidateFactor === 0` inherently implies this for positive integers.
            var dividesAllInputs = (valA % candidateFactor === 0 &&
                                    valB % candidateFactor === 0 &&
                                    valC % candidateFactor === 0);

            // If the candidateFactor is a common divisor and meets the parity condition,
            // update our resultantFactor. Since we iterate upwards, this ensures
            // 'resultantFactor' always holds the largest valid common divisor found so far.
            if (dividesAllInputs) {
                resultantFactor = candidateFactor;
            }
        }
    }

    // Return the final largest common factor that satisfied all conditions.
    return resultantFactor;
}

// Main function to orchestrate the input processing, computation, and output.
function executeComputation(rawInputString) {
    var upperLimit; // This variable will store the parsed integer value from the input.

    try {
        // Attempt to parse the input string into a base-10 integer.
        var parsedValue = parseInt(rawInputString, 10);

        // Input validation: Ensure the parsed value is a valid positive integer.
        // If not, an error message is printed, and the function terminates.
        if (isNaN(parsedValue) || parsedValue <= 0) {
            console.error("Error: Input must be a positive integer.");
            return; // Exit the function if input is invalid.
        }
        upperLimit = parsedValue; // Assign the validated parsed value.

    } catch (parseError) {
        // Catch any potential errors during the parsing process.
        console.error("Error parsing input string:", parseError.message);
        return; // Exit the function on parsing error.
    }

    // This variable will accumulate the sum of all results from the
    // determineSharedFactor calculations across the nested loops.
    var totalAccumulatedValue = 0;

    // Begin the first of three nested loops. This loop iterates for the first number.
    for (var firstIterVar = 1; firstIterVar <= upperLimit; firstIterVar++) {
        // Second nested loop, iterating for the second number.
        for (var secondIterVar = 1; secondIterVar <= upperLimit; secondIterVar++) {
            // Third and innermost nested loop, iterating for the third number.
            for (var thirdIterVar = 1; thirdIterVar <= upperLimit; thirdIterVar++) {
                // Call the helper function to calculate the specific common factor
                // for the current triplet of numbers (firstIterVar, secondIterVar, thirdIterVar).
                // The result is stored in a temporary variable for clarity before accumulation.
                var currentTripletFactor = determineSharedFactor(firstIterVar, secondIterVar, thirdIterVar);

                // Add the calculated factor to the running total.
                totalAccumulatedValue += currentTripletFactor;
            }
        }
    }

    // After all computations are complete, output the final accumulated sum to the console.
    console.log(totalAccumulatedValue);
}

// --- Program Entry Point and Input Handling ---
// Obtain a reference to the Node.js 'fs' (file system) module.
var fileSystemModule = require("fs");

// Read the entire content of '/dev/stdin' synchronously as a UTF-8 string.
// This is the standard way to get input in competitive programming environments on Linux.
var inputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Execute the main computation function with the input data obtained from stdin.
executeComputation(inputData);