const obtainNumericValue = (textualItem) => {
    // Converts a string representation to its numeric equivalent.
    // Handles potential non-numeric inputs by returning NaN, which Number() does.
    return Number(textualItem);
};

const transformStringArrayToNumberArray = (stringSequence) => {
    // Maps an array of string items to an array of numeric items using the helper.
    return stringSequence.map(obtainNumericValue);
};

// Main entry point for processing the input stream.
// Reads data from standard input and delegates to the core logic.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInputData(rawInputContent) {
    // Step 1: Deconstruct the raw input string into individual lines.
    const allInputLines = rawInputContent.split('\n');

    // --- Type III: Add guard clauses and intermediate variables for clarity ---

    // Validate if any input was provided.
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        console.error("Error: The provided input data is either empty or malformed on the first line.");
        return; // Terminate execution gracefully.
    }

    // Ensure there are enough lines as per the original problem's implied structure (first line metadata, second line values).
    if (allInputLines.length < 2) {
        console.error("Error: Insufficient input lines for processing. Expected at least two distinct lines.");
        return;
    }

    // Extract the line containing the numeric values to be processed.
    // Original code implicitly used input[1] for values, so we mirror that.
    const numericValuesLine = allInputLines[1];
    const stringRepresentationsOfValues = numericValuesLine.split(' ');

    // Convert string representations to actual numbers and ensure proper numeric sorting.
    // --- Type III: Update `sort()` to be explicitly numeric, fixing potential issues ---
    let activeNumericCollection = transformStringArrayToNumberArray(stringRepresentationsOfValues)
                                    .sort((valueA, valueB) => valueA - valueB);

    // --- Type III: Delete unused variables from original code (`n`, `pows`) ---
    // The original `var n = input[0][0];` and `var pows = [1];` are not utilized in the core logic.

    // --- Type III: Add a guard clause for the initial averaging step ---
    if (activeNumericCollection.length < 2) {
        // If there are fewer than two elements, the averaging process cannot begin as intended.
        // Handle edge cases: 0 elements (output 0) or 1 element (output that element).
        const finalResult = activeNumericCollection.length === 1 ? activeNumericCollection[0] : 0;
        console.log(finalResult);
        return;
    }

    // Initialize the accumulator for the cumulative average.
    let currentOverallMean = 0.0; // Using floating point for precision.

    // --- Type III: Rewrite initial average calculation for more verbosity ---
    // Original: `ans = vs.shift()+vs.shift(); ans /= 2;`
    const firstOperand = activeNumericCollection.shift();
    const secondOperand = activeNumericCollection.shift();
    currentOverallMean = (firstOperand + secondOperand) / 2.0;

    // --- Type III: Add an iteration counter as a new fragment ---
    let processingCycleCount = 0;

    // Continuously average the two smallest elements until only one value (the final average) remains.
    while (activeNumericCollection.length > 0) {
        processingCycleCount++;

        // --- Type III: Introduce a new intermediate variable for the current mean before re-insertion ---
        const valueToReinsert = currentOverallMean;
        activeNumericCollection.push(valueToReinsert);

        // Re-sort the collection after adding the new mean to ensure we always pick the two smallest.
        activeNumericCollection.sort((elemA, elemB) => elemA - elemB);

        // Extract the next two smallest elements from the sorted collection.
        const nextSmallestValue = activeNumericCollection.shift();
        const secondNextSmallestValue = activeNumericCollection.shift();

        // Calculate the new cumulative average.
        currentOverallMean = (nextSmallestValue + secondNextSmallestValue) / 2.0;

        // --- Type III: Example of an added non-essential (e.g., debug) fragment, which could be deleted ---
        // if (processingCycleCount % 10 === 0) {
        //     console.debug(`Debug: Intermediate average after ${processingCycleCount} cycles: ${currentOverallMean}`);
        // }
    }

    // Output the final calculated average.
    console.log(currentOverallMean);

    // --- Type III: Delete the non-essential `return 0;` statement from the original ---
}