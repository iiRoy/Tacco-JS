// Helper utility function to determine the greatest common divisor (GCD) of two numerical values.
// This implementation employs the iterative Euclidean algorithm, which is efficient for finding GCDs.
function determineGreatestCommonDivisor(firstOperand, secondOperand) {
    // For robust processing, ensure inputs are valid finite numbers.
    // Although problem constraints often guarantee numeric input, adding checks enhances reliability.
    if (!Number.isFinite(firstOperand) || !Number.isFinite(secondOperand)) {
        // If non-finite numbers are encountered, we return 0,
        // as GCD is typically defined for integers, and 0 is a common neutral element.
        // Alternatively, an error could be thrown for stricter validation.
        return 0;
    }

    // The Euclidean algorithm works with non-negative integers.
    // Taking absolute values ensures correctness for any signed numeric input.
    let currentA = Math.abs(firstOperand);
    let currentB = Math.abs(secondOperand);

    // Iteratively apply the Euclidean algorithm:
    // Replace the larger number with its remainder when divided by the smaller number,
    // until the smaller number becomes zero. The non-zero number is then the GCD.
    while (currentB !== 0) {
        let temporaryValue = currentB;
        currentB = currentA % currentB;
        currentA = temporaryValue;
    }
    // At this point, currentA holds the GCD.
    return currentA;
}

// Function to compute the greatest common divisor for an entire collection of numbers.
// It leverages the pairwise GCD function to reduce the array to a single GCD value.
function computeArrayGCD(numericValuesCollection) {
    // Initial validation: check if the input is a valid array and not empty.
    if (!Array.isArray(numericValuesCollection) || numericValuesCollection.length === 0) {
        // An empty array implies no common divisor can be found.
        // Returning 0 signifies this edge case or an invalid input state.
        return 0; // Could also throw an error for stricter handling.
    }

    // Filter the collection to ensure only finite, non-negative numbers are considered for GCD computation.
    // This guards against potential issues with NaN, Infinity, or negative numbers (though Math.abs handles negatives).
    const filteredPositiveNumbers = numericValuesCollection.filter(val => Number.isFinite(val) && val >= 0);

    // If, after filtering, no valid numbers remain, return 0.
    if (filteredPositiveNumbers.length === 0) {
        return 0;
    }

    // If only one valid number remains, its GCD is itself.
    if (filteredPositiveNumbers.length === 1) {
        return filteredPositiveNumbers[0];
    }

    // Use the `reduce` method to iteratively apply the `determineGreatestCommonDivisor` function
    // across all numbers in the filtered collection. The first element serves as the initial accumulator.
    const finalCalculatedGCD = filteredPositiveNumbers.reduce((accumulatorGCD, nextNumber) => {
        return determineGreatestCommonDivisor(accumulatorGCD, nextNumber);
    });

    return finalCalculatedGCD;
}

// The primary function responsible for processing the input data,
// performing the necessary calculations, and delivering the final output.
function processInputAndCalculate(rawInputContent) {
    // Convert the raw input to a string, trim any leading/trailing whitespace,
    // and then split it into individual lines for easier parsing.
    const inputLines = rawInputContent.toString().trim().split('\n');

    // Implement a guard clause to ensure a minimum number of input lines are present.
    // The problem requires at least two lines of input.
    if (inputLines.length < 2) {
        console.error("Input processing error: Not enough data lines provided. Expected at least 2 lines.");
        return; // Terminate execution if input is insufficient.
    }

    // Parse the first line to extract global parameters.
    // It contains the total count (N) and the specific comparison point (X).
    const parsedFirstLineNumbers = inputLines[0].split(' ').map(Number);
    
    // Validate the parsed numbers from the first line.
    if (parsedFirstLineNumbers.some(isNaN) || parsedFirstLineNumbers.length < 2) {
        console.error("Input processing error: Invalid numeric data in the first line.");
        return;
    }
    
    // Extract the total count (N) and the target value (X) from the first line.
    // Note: 'totalCountN' is often provided but not directly used in the final GCD computation for this problem type.
    const totalCountN = parsedFirstLineNumbers[0];
    const comparisonTargetValue = parsedFirstLineNumbers[1];

    // Validate the extracted comparison target value.
    if (!Number.isFinite(comparisonTargetValue)) {
        console.error("Input processing error: Comparison target (X) is not a valid finite number.");
        return;
    }

    // Parse the second line, which contains the list of numbers to compare against X.
    const valuesForDifferenceCalculation = inputLines[1].split(' ').map(Number);

    // Validate the numbers from the second line.
    if (valuesForDifferenceCalculation.some(isNaN) || valuesForDifferenceCalculation.length === 0) {
        console.error("Input processing error: Invalid or empty list of numbers in the second line.");
        return;
    }

    // Calculate the absolute difference between each number in the second line and the comparison target.
    // This generates a new array containing these delta values.
    const absoluteDeltaValues = valuesForDifferenceCalculation.map(currentArrayElement => {
        // Ensure each element is a valid number before calculating difference.
        if (!Number.isFinite(currentArrayElement)) {
            // For invalid elements, we can treat the difference as 0 or skip it.
            // Returning 0 ensures it's handled by GCD, but filtering might be better depending on context.
            return 0; 
        }
        // Rewriting `Math.abs(A - B)` using a conditional (ternary) operator.
        return (currentArrayElement > comparisonTargetValue) ? 
               (currentArrayElement - comparisonTargetValue) : 
               (comparisonTargetValue - currentArrayElement);
    });

    // Filter out any zero differences from the list.
    // Including zeros in GCD calculation might yield 0 if other numbers are non-zero,
    // or lead to unexpected results if the problem implies positive differences.
    const nonZeroAbsoluteDeltas = absoluteDeltaValues.filter(delta => delta !== 0);

    // Handle the edge case where all differences turn out to be zero after filtering.
    // If all values in the second line were identical to 'comparisonTargetValue',
    // then all differences would be zero, and their GCD is typically considered 0.
    if (nonZeroAbsoluteDeltas.length === 0) {
        console.log(0);
        return;
    }

    // Compute the GCD of the filtered list of absolute differences.
    const finalComputedGCD = computeArrayGCD(nonZeroAbsoluteDeltas);

    // Output the calculated greatest common divisor to standard output.
    console.log(finalComputedGCD);
}

// Application's entry point: reads data from standard input and initiates processing.
try {
    // Access the Node.js 'fs' (file system) module to read from standard input.
    const fileSystemModule = require("fs");
    // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
    const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    // Invoke the main processing function with the read input data.
    processInputAndCalculate(standardInputData);
} catch (errorDetails) {
    // Catch and report any errors that occur during the file reading or initial setup phase.
    console.error("An unhandled exception occurred during input acquisition or initial setup:", errorDetails.message);
}