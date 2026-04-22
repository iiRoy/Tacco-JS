const fileSystem = require("fs");

/**
 * Defines the standard input path for reading data.
 */
const standardInputPath = "/dev/stdin";

/**
 * Initiates the primary data processing workflow.
 * Reads raw input from stdin, delegates it for calculation, and prints the final result.
 */
function initiateProcessing() {
    let rawInputContent;
    try {
        // Attempt to synchronously read the entire content of the standard input.
        rawInputContent = fileSystem.readFileSync(standardInputPath, "utf8");
    } catch (errorReadingInput) {
        // If an error occurs during file reading, log it and terminate gracefully.
        console.error("Failed to read input from stdin:", errorReadingInput.message);
        return; // Exit the function as input is unavailable.
    }

    // Call the core calculation function with the obtained raw input string.
    const finalComputedResult = calculateWeightedSum(rawInputContent);

    // Display the final computed numerical result to the console.
    console.log(finalComputedResult);
}

/**
 * Processes a multi-line string of numerical data, applying a specific
 * weighted sum algorithm with conditional adjustments.
 *
 * The algorithm involves parsing numbers, sorting them, calculating
 * a preliminary weighted sum based on a middle split point, and then
 * applying a final adjustment determined by the count's parity and
 * values around the middle of the sorted list.
 *
 * @param {string} inputDataString - The raw input string containing numbers,
 *                                   where the first line is the count of subsequent numbers.
 * @returns {number} The final calculated weighted sum. Returns 0 if input is invalid or empty.
 */
function calculateWeightedSum(inputDataString) {
    // --- Step 1: Input Validation and Initial Parsing ---

    // Guard clause for empty or purely whitespace input.
    if (!inputDataString || inputDataString.trim() === '') {
        console.warn("Empty or whitespace-only input received. Returning default value of 0.");
        return 0;
    }

    // Process the input string:
    // 1. Trim leading/trailing whitespace (including newlines).
    // 2. Split into an array of strings, one for each line.
    // 3. Convert each line string to an integer.
    // 4. Filter out any results that are not valid numbers (NaN).
    const preProcessedNumbers = inputDataString
                                .trim()
                                .split('\n')
                                .map(lineText => parseInt(lineText, 10))
                                .filter(numValue => !isNaN(numValue));

    // The first number in the input is expected to be the count of actual data elements.
    const declaredElementCount = preProcessedNumbers.shift(); // Removes and returns the first element.

    // Validate the extracted count. It must be a non-negative number.
    if (typeof declaredElementCount !== 'number' || isNaN(declaredElementCount) || declaredElementCount < 0) {
        console.error("Invalid or missing declared element count in input. Expected a non-negative integer.");
        return 0; // Indicate an error by returning 0.
    }

    // Extract the actual data elements, limiting to the declared count.
    // This handles cases where there might be more lines than declared.
    let numericDataElements = preProcessedNumbers.slice(0, declaredElementCount);

    // Provide a warning if the number of available data elements doesn't match the declared count.
    if (numericDataElements.length !== declaredElementCount) {
        console.warn(`Mismatch: Declared count (${declaredElementCount}) vs. actual data elements (${numericDataElements.length}). Proceeding with available data.`);
    }

    // If, after all parsing, there are no elements, return 0.
    if (numericDataElements.length === 0 && declaredElementCount > 0) {
        console.warn("No valid data elements found despite a positive declared count. Returning 0.");
        return 0;
    }

    // --- Step 2: Data Ordering ---

    // Sort the collected numeric data elements in ascending order.
    numericDataElements.sort((firstVal, secondVal) => firstVal - secondVal);

    // --- Step 3: Preliminary Weighted Sum Calculation ---

    let interimWeightedSum = 0; // Accumulator for the initial sum.
    const currentElementCount = numericDataElements.length; // The actual count of elements being processed.

    // Determine the split point (equivalent to 'm' in original code, which is ceil(n/2)).
    // This index defines where the weighting changes from subtraction to addition.
    const splitIndexForWeighting = Math.ceil(currentElementCount / 2);

    // Iterate through the sorted elements to apply the initial weighting.
    for (let currentIdx = 0; currentIdx < currentElementCount; currentIdx++) {
        const elementValue = numericDataElements[currentIdx];
        if (currentIdx < splitIndexForWeighting) {
            // Elements before the split point are subtracted (multiplied by -2).
            interimWeightedSum -= (elementValue * 2);
        } else {
            // Elements from the split point onwards are added (multiplied by +2).
            interimWeightedSum += (elementValue * 2);
        }
    }

    // --- Step 4: Final Conditional Adjustment ---

    let finalCalculatedSum = interimWeightedSum; // Start with the interim sum.

    // Helper boolean to check if the total count of elements is even.
    const isTotalCountEven = (currentElementCount % 2 === 0);

    // Pre-calculate indices for clarity in the final adjustments.
    const centralValueIndex = splitIndexForWeighting - 1; // Corresponds to s[m-1]
    const postCentralValueIndex = splitIndexForWeighting; // Corresponds to s[m]
    const preCentralValueIndex = splitIndexForWeighting - 2; // Corresponds to s[m-2]

    // Apply adjustments based on the parity of the total element count.
    if (isTotalCountEven) {
        // If the count is even, apply a specific adjustment.
        // Original: `ans - s[m] + s[m-1]`
        const valPostCentral = numericDataElements[postCentralValueIndex];
        const valCentral = numericDataElements[centralValueIndex];
        finalCalculatedSum = finalCalculatedSum - valPostCentral + valCentral;
    } else {
        // If the count is odd, apply one of two different adjustments based on a comparison.
        // Original: `if(s[m-1]+s[m-2] > s[m-1]*3-s[m]) return ans + s[m-1] + s[m-2]; else return ans + s[m-1]*3 - s[m];`

        // Extract values for the comparison condition.
        const valCentral = numericDataElements[centralValueIndex];
        const valPreCentral = numericDataElements[preCentralValueIndex];
        const valPostCentral = numericDataElements[postCentralValueIndex];

        // Evaluate the complex condition.
        const leftSideOfCondition = valCentral + valPreCentral;
        const rightSideOfCondition = (valCentral * 3) - valPostCentral;

        if (leftSideOfCondition > rightSideOfCondition) {
            finalCalculatedSum = finalCalculatedSum + valCentral + valPreCentral;
        } else {
            finalCalculatedSum = finalCalculatedSum + (valCentral * 3) - valPostCentral;
        }
    }

    return finalCalculatedSum;
}

// Execute the main processing function to start the application.
initiateProcessing();