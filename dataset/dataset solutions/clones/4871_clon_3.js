/*
 * This script processes a sequence of numerical inputs to determine if a specific
 * arithmetic relationship exists between the sorted values.
 *
 * The core logic involves parsing a string of space-separated numbers,
 * arranging them in ascending order, and then evaluating a condition
 * based on their relative sums.
 *
 * This version includes robust input handling and a more detailed
 * conditional check structure.
 */

// A hardcoded input string for demonstration purposes.
// In a real application, this would come from user input, file, or arguments.
const rawInputData = "1 2 3"; // Example test case. Try "5 1 2" or "0 0 0" or "-5 2 3"

// Function to perform the core validation logic.
function evaluateNumericalRelationship(inputStringForProcessing) {
    // Helper array to temporarily store parsed and validated numbers.
    let temporaryNumericStore = [];

    // Step 1: Input validation and parsing.
    // Ensure the input string is not null or empty.
    if (!inputStringForProcessing || inputStringForProcessing.trim() === '') {
        // Log an error or handle gracefully for empty input.
        return "No"; // Default "No" for invalid input
    }

    // Split the raw input string by whitespace and filter out any empty tokens.
    const inputTokenCollection = inputStringForProcessing.split(/\s+/).filter(Boolean);

    // This problem specifically expects exactly three numeric values.
    if (inputTokenCollection.length !== 3) {
        // A warning might be appropriate here, or simply return "No".
        return "No"; // Return "No" if the count of numbers is incorrect
    }

    for (let i = 0; i < inputTokenCollection.length; i++) {
        const currentNumericalCandidate = inputTokenCollection[i];
        const convertedInteger = parseInt(currentNumericalCandidate, 10); // Explicit integer conversion

        // Validate if the converted value is indeed a valid integer.
        if (isNaN(convertedInteger)) {
            // If any part is not a number, the input is invalid.
            return "No"; // Return "No" if any token is not a valid number
        }
        temporaryNumericStore.push(convertedInteger);
    }

    // Step 2: Manually sort the three numeric entries.
    // This avoids using the built-in .sort() method directly for a small, fixed number of elements.
    const valueAlpha = temporaryNumericStore[0];
    const valueBeta = temporaryNumericStore[1];
    const valueGamma = temporaryNumericStore[2];

    const minElement = Math.min(valueAlpha, valueBeta, valueGamma);
    const maxElement = Math.max(valueAlpha, valueBeta, valueGamma);
    const midElement = valueAlpha + valueBeta + valueGamma - minElement - maxElement;

    // Extract the sorted values into distinct variables for clarity in the condition.
    const smallestOperand = minElement;
    const middleOperand = midElement;
    const largestOperand = maxElement;

    // Step 3: Evaluate the primary arithmetic condition.
    // Check if the sum of the two smallest operands equals the largest operand.
    const primaryRelationshipHolds = (smallestOperand + middleOperand === largestOperand);

    // Step 4: Evaluate the secondary (less common) arithmetic condition.
    // This condition checks if the smallest operand equals the sum of the other two.
    // It's typically relevant for specific cases involving negative numbers or zeros.
    const secondaryRelationshipHolds = (smallestOperand === middleOperand + largestOperand);

    // Step 5: Determine the final outcome based on either condition being met.
    if (primaryRelationshipHolds || secondaryRelationshipHolds) {
        return "Yes";
    } else {
        return "No";
    }
}

// Main execution block:
// Process the prepared input data.
const finalOutcome = evaluateNumericalRelationship(rawInputData);

// Output the computed result to the standard output.
// In a Node.js environment, this is `process.stdout.write`.
// In a browser environment, `console.log` would be used.
process.stdout.write(finalOutcome);