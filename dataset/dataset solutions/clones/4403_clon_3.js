/**
 * Processes raw input to identify two largest paired numeric values and calculates their product.
 * This function expects input in a specific format:
 * - The first line is usually metadata (ignored here).
 * - The second line contains space-separated numeric values.
 *
 * The goal is to find two distinct values (say X and Y) such that X appears at least twice,
 * Y appears at least twice, and X and Y are the largest such distinct values.
 * If fewer than two such pairs are found, the result will be 0.
 *
 * @param {string} rawInputString - The multi-line string input to be processed.
 * @returns {number} The product of the two largest paired dimensions, or 0 if not found.
 */
function calculateProductOfLargestPairedDimensions(rawInputString) {
    // Initialize an array to store the two largest paired dimensions found.
    // Default values are 0, so if fewer than two pairs are found, the product will be 0.
    let identifiedDimensions = [0, 0];
    let pairsDiscovered = 0; // Counter for how many distinct pairs have been found.

    // --- Input Parsing and Validation ---

    // Split the entire input string into individual lines.
    const inputLines = rawInputString.split('\n');

    // Basic validation: Ensure there's at least a second line containing the data.
    if (inputLines.length < 2 || !inputLines[1].trim()) {
        console.error("Error: Input string does not contain sufficient data (missing second line).");
        return 0; // Return 0 as per original implicit behavior for insufficient data.
    }

    // Extract the second line, which contains the numeric data.
    const dataLine = inputLines[1];

    // Split the data line by spaces and convert each part to a number.
    // Using map(Number) explicitly handles string-to-number conversion.
    let numericValues = dataLine.split(' ').map(Number);

    // Validate if all values were successfully converted to numbers.
    if (numericValues.some(isNaN)) {
        console.error("Error: Input data contains non-numeric values. Please provide valid numbers.");
        return 0; // Return 0 for invalid data.
    }

    // --- Data Processing ---

    // Sort the numeric values in descending order.
    // This makes it easy to find the largest pairs by iterating from the beginning.
    numericValues.sort((firstVal, secondVal) => secondVal - firstVal);

    // Iterate through the sorted array to find two pairs.
    // We need to check elements at `currentPosition` and `currentPosition + 1`.
    // The loop continues as long as we haven't reached the end of the array
    // and haven't found two distinct pairs yet.
    let currentPosition = 0;
    while (currentPosition < numericValues.length - 1 && pairsDiscovered < 2) {
        const currentValue = numericValues[currentPosition];
        const nextValue = numericValues[currentPosition + 1];

        // Check if the current element and the next element form a pair.
        if (currentValue === nextValue) {
            // A pair is found. Store this value as one of our dimensions.
            identifiedDimensions[pairsDiscovered] = currentValue;
            pairsDiscovered++; // Increment the count of pairs found.
            currentPosition += 2; // Skip both elements of the found pair.
        } else {
            // No pair found at this position, move to the next element.
            currentPosition++;
        }
    }

    // --- Final Calculation and Output ---

    // Calculate the product of the two identified dimensions.
    // If fewer than two dimensions were found, the default 0s will result in a product of 0.
    const finalCalculatedProduct = identifiedDimensions[0] * identifiedDimensions[1];

    // Display the final result to the console.
    console.log(finalCalculatedProduct);

    // For testing or further use, the product can also be returned.
    return finalCalculatedProduct;
}

// Entry point for execution: Read input from stdin and pass it to the main processing function.
// This setup is typical for competitive programming environments.
calculateProductOfLargestPairedDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));