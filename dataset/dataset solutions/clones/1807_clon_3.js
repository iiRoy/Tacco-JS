/*
 * Function to process raw input string, parse numerical data,
 * and compute the product of the first 'N' elements.
 * This version includes robust parsing, validation, and utilizes
 * modern JavaScript array methods for calculation.
 */
function computeProductOfFirstN(inputStringData) {
    // Ensure the input string is cleaned and split into individual lines.
    const linesOfData = inputStringData.trim().split('\n');

    // Validate that at least two lines of data are present for processing.
    if (linesOfData.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines.");
        return; // Terminate execution due to invalid input structure.
    }

    // Attempt to parse the first line as the count of numbers to multiply.
    const countString = linesOfData[0];
    const limitMultiplier = parseInt(countString, 10);

    // Validate the parsed count: it must be a valid positive integer.
    if (isNaN(limitMultiplier) || limitMultiplier <= 0) {
        console.error("Error: Invalid or non-positive count specified for multiplication limit.");
        return; // Terminate execution due to invalid count.
    }

    // Process the second line, splitting it into individual string representations of numbers.
    const numbersAsString = linesOfData[1].split(' ');

    // Convert string numbers to actual floating-point numbers for calculation.
    const processedNumbers = numbersAsString.map(str => parseFloat(str));

    // Validate that all elements successfully converted to numbers.
    if (processedNumbers.some(isNaN)) {
        console.error("Error: Input contains non-numeric values. Cannot compute product.");
        return; // Terminate execution if any factor is invalid.
    }

    // Determine the actual slice of numbers to multiply,
    // considering both the specified limit and the available numbers.
    const actualMultiplicationCount = Math.min(limitMultiplier, processedNumbers.length);
    const relevantFactors = processedNumbers.slice(0, actualMultiplicationCount);

    // If the count requested exceeds available numbers, issue a warning.
    if (limitMultiplier > processedNumbers.length) {
        console.warn(`Warning: Requested to multiply ${limitMultiplier} numbers, but only ${processedNumbers.length} were provided. Using available numbers.`);
    }

    // Initialize the product accumulator. If no factors are present (e.g., limitMultiplier was 0),
    // the product is typically 1 (multiplicative identity).
    let finalProductValue = 1;

    // Use the reduce method to iteratively multiply all relevant factors.
    // This provides a concise and functional way to compute the product.
    finalProductValue = relevantFactors.reduce((accumulator, currentValue) => {
        // Each step of multiplication contributes to the cumulative product.
        return accumulator * currentValue;
    }, 1); // The initial value for the accumulator is 1.

    // Display the final computed product to the standard output.
    console.log(finalProductValue);
}

// Main execution block:
// This section reads content from standard input and passes it to the
// primary processing function for calculation.
const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the product computation function with the gathered input.
computeProductOfFirstN(stdInputContent);