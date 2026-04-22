// This function is designed to process raw input text,
// extract numerical data, perform calculations on sliding windows,
// and then output a sequence of comparisons.
function processData(rawInputText) {
    // --- Input Parsing and Initial Validation ---

    // Split the entire input string into an array of individual lines.
    const inputLines = rawInputText.split('\n');

    // Perform a basic check to ensure the input has the minimum required lines.
    // We expect at least two lines: one for parameters (N, K) and one for data.
    if (inputLines.length < 2) {
        console.error("Input data is incomplete. Expected at least two lines.");
        return; // Exit if input is insufficient.
    }

    // Process the first line to extract the array size (N) and window length (K).
    // Using `Number` for type conversion, which is robust for integer strings.
    const parameterTokens = inputLines[0].split(' ').map(Number);
    const arraySize = parameterTokens[0];       // Corresponds to original 'N'
    const windowLength = parameterTokens[1];    // Corresponds to original 'K'

    // Validate the extracted parameters to ensure they are positive integers.
    if (isNaN(arraySize) || isNaN(windowLength) || arraySize <= 0 || windowLength <= 0) {
        console.error("Invalid array size (N) or window length (K) provided. Must be positive integers.");
        return;
    }

    // If the window length exceeds the total array size, no valid windows can be formed.
    // In such a scenario, the original code would produce no output. We replicate this.
    if (windowLength > arraySize) {
        return;
    }

    // Parse the second line which contains the actual data elements.
    const numericDataElements = inputLines[1].split(' ').map(Number);

    // Validate that the count of parsed data elements matches the declared array size (N).
    // This is an added guard clause for robustness.
    if (numericDataElements.length !== arraySize) {
        console.error("The number of data elements does not match the declared array size (N).");
        return;
    }

    // --- Sliding Window Product Calculation ---

    // This array will store the product of elements for each sliding window.
    const sequentialWindowProducts = []; // Corresponds to original 'aryHyoten'

    // Iterate through the array to define the end position of each sliding window.
    // The `windowEndIndex` represents the inclusive last element of the current window.
    // The first window ends at `windowLength - 1`. The last window ends at `arraySize - 1`.
    for (let windowEndIndex = windowLength - 1; windowEndIndex < arraySize; windowEndIndex++) {
        let currentWindowProduct = 1; // Initialize product for the current window to 1.
                                      // This ensures correct multiplication, even with zeros.
        const windowStartIndex = windowEndIndex - windowLength + 1; // Calculate the start index for the window.

        // Calculate the product of all elements within the current window.
        for (let dataIndex = windowStartIndex; dataIndex <= windowEndIndex; dataIndex++) {
            // Add a check for non-numeric data within the loop for extra robustness.
            if (isNaN(numericDataElements[dataIndex])) {
                console.error(`Non-numeric value detected at data index ${dataIndex}. Aborting.`);
                return;
            }
            currentWindowProduct *= numericDataElements[dataIndex];
        }
        sequentialWindowProducts.push(currentWindowProduct); // Store the computed product.
    }

    // --- Comparison of Consecutive Window Products ---

    // This array will hold the 'Yes'/'No' results based on product comparisons.
    const comparisonOutcomeStrings = []; // Corresponds to original 'aryRslt'

    // A comparison requires at least two window products.
    // If fewer than two products are available, no comparisons can be made.
    if (sequentialWindowProducts.length >= 2) {
        // Initialize `previousProduct` with the very first product.
        let previousProductValue = sequentialWindowProducts[0]; // Corresponds to original 'pre'

        // Start iterating from the second product to compare it with its predecessor.
        for (let i = 1; i < sequentialWindowProducts.length; i++) {
            const currentProductValue = sequentialWindowProducts[i]; // Corresponds to original 'cur'

            // Compare the current product with the previous one.
            // If the current product is strictly greater, add 'Yes'. Otherwise, add 'No'.
            if (currentProductValue > previousProductValue) {
                comparisonOutcomeStrings.push('Yes');
            } else {
                comparisonOutcomeStrings.push('No');
            }

            // Update `previousProductValue` for the next iteration.
            previousProductValue = currentProductValue;
        }
    }
    // If sequentialWindowProducts.length < 2, comparisonOutcomeStrings remains empty,
    // which aligns with the original code's behavior.

    // --- Output Generation ---

    // Iterate through the final comparison results and print each one to the console.
    // Using a `for...of` loop for slightly different iteration syntax.
    for (const outcome of comparisonOutcomeStrings) {
        console.log(outcome);
    }
}

// --- Program Entry Point ---

// This standard competitive programming setup reads all input from `/dev/stdin`
// (standard input) as a UTF-8 string and passes it to the `processData` function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));