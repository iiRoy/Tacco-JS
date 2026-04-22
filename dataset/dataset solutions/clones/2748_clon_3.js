'use strict';

/**
 * Transforms a decimal number by converting it to its binary string representation,
 * and then parsing that binary string as a base-10 integer.
 * E.g., 5 (decimal) -> "101" (binary string) -> 101 (decimal number).
 * This is a specific transformation used in the problem logic.
 * @param {number} inputDecimalValue - The input decimal number.
 * @returns {number} The transformed value. Returns 0 for invalid input to avoid errors,
 *                   assuming valid positive integers are expected.
 */
function convertToBinaryDecRepresentation(inputDecimalValue) {
    // Basic validation: Ensure the input is a valid positive integer.
    if (typeof inputDecimalValue !== 'number' || !Number.isInteger(inputDecimalValue) || inputDecimalValue < 0) {
        // In a real application, you might throw an error or handle this more robustly.
        // For this context, returning 0 as a safe default.
        return 0;
    }
    const binaryStringForm = inputDecimalValue.toString(2);
    // Parse the binary string as a base-10 number.
    return parseInt(binaryStringForm, 10);
}

/**
 * Parses the raw input string, extracting the total count of elements
 * and an array of their original numeric values. Includes basic validation.
 * @param {string} rawInputContent - The complete input string read from stdin.
 * @returns {{elementCount: number, initialValues: number[]}} An object containing the parsed data.
 * @throws {Error} If the input format is invalid or insufficient.
 */
function extractAndParseInputData(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    if (!cleanedInput) {
        throw new Error("Input data cannot be empty or just whitespace.");
    }

    const contentLines = cleanedInput.split('\n');
    if (contentLines.length < 2) {
        throw new Error("Insufficient input lines provided. Expected at least two lines.");
    }

    const parsedElementCount = parseInt(contentLines[0], 10);
    if (isNaN(parsedElementCount) || parsedElementCount < 0) {
        throw new Error("Invalid or negative element count specified in the first line.");
    }

    const parsedInitialValues = contentLines[1].split(' ').map(strVal => parseInt(strVal, 10));
    // Optional: Add a check to ensure parsedInitialValues.length matches parsedElementCount

    return { elementCount: parsedElementCount, initialValues: parsedInitialValues };
}

/**
 * Generates a frequency map for an array of numbers.
 * @param {number[]} arrayOfNumbers - The array of numbers for which to count frequencies.
 * @returns {Map<number, number>} A map where keys are the numbers and values are their respective frequencies.
 */
function computeFrequencyMap(arrayOfNumbers) {
    const valueFrequencies = new Map();
    for (const numValue of arrayOfNumbers) {
        // Increment the count for the current number, defaulting to 0 if not seen before.
        valueFrequencies.set(numValue, (valueFrequencies.get(numValue) || 0) + 1);
    }
    return valueFrequencies;
}

/**
 * Evaluates whether the transformed values and their frequencies satisfy the problem's complex criteria.
 * This function encapsulates the main business logic.
 * @param {number} totalItemCount - The total number of items (equivalent to N in the original problem).
 * @param {Map<number, number>} transformedValueFrequencies - Map of transformed values to their counts.
 * @returns {boolean} True if all criteria are met, false otherwise.
 */
function evaluateSolutionCriteria(totalItemCount, transformedValueFrequencies) {
    const uniqueTransformedValues = Array.from(transformedValueFrequencies.keys());
    const countOfUniqueValues = uniqueTransformedValues.length;
    let criteriaSatisfied = false; // The boolean outcome of the evaluation.

    // Pre-calculate expected counts for readability and minor optimization.
    const expectedOneThird = totalItemCount / 3;
    const expectedTwoThirds = (2 * totalItemCount) / 3;

    // First major condition: total number of items divisible by 3.
    if (totalItemCount % 3 === 0) {
        // Use a switch statement to handle different scenarios based on the number of distinct transformed values.
        switch (countOfUniqueValues) {
            case 3:
                // Scenario: Exactly three distinct transformed values.
                const firstVal = uniqueTransformedValues[0];
                const secondVal = uniqueTransformedValues[1];
                const thirdVal = uniqueTransformedValues[2];

                // Check if the bitwise XOR sum of these three values is zero.
                const combinedXorResult = firstVal ^ secondVal ^ thirdVal;
                if (combinedXorResult === 0) {
                    // Additionally, verify that each of these three values appears exactly N/3 times.
                    const areCountsBalanced = (transformedValueFrequencies.get(firstVal) === expectedOneThird) &&
                                             (transformedValueFrequencies.get(secondVal) === expectedOneThird) &&
                                             (transformedValueFrequencies.get(thirdVal) === expectedOneThird);
                    if (areCountsBalanced) {
                        criteriaSatisfied = true;
                    }
                }
                break;

            case 2:
                // Scenario: Exactly two distinct transformed values.
                // One of these values must be 0.
                const indexOfZero = uniqueTransformedValues.indexOf(0);
                if (indexOfZero !== -1) {
                    // Determine the other non-zero value.
                    const nonZeroValue = uniqueTransformedValues[1 - indexOfZero]; // Gets the other element efficiently.
                    
                    // Check specific count distribution: 0 appears N/3 times, and the other value 2*N/3 times.
                    if (transformedValueFrequencies.get(0) === expectedOneThird && 
                        transformedValueFrequencies.get(nonZeroValue) === expectedTwoThirds) {
                        criteriaSatisfied = true;
                    }
                }
                break;

            case 1:
                // Scenario: Only one distinct transformed value.
                // This single value must be 0.
                if (uniqueTransformedValues[0] === 0) {
                    criteriaSatisfied = true;
                }
                break;

            default:
                // Any other number of distinct values (0 or >3) does not satisfy criteria
                criteriaSatisfied = false;
        }
    }
    // Second major condition: total number of items NOT divisible by 3.
    else {
        // In this case, there must be only one distinct transformed value, and it must be 0.
        if (countOfUniqueValues === 1 && uniqueTransformedValues[0] === 0) {
            criteriaSatisfied = true;
        }
    }

    return criteriaSatisfied;
}


/**
 * The primary function orchestrating the entire data analysis process.
 * Reads input, transforms data, counts frequencies, and applies specific criteria.
 * @param {string} programInputString - The raw string input from the environment.
 */
function executeDataAnalysisPipeline(programInputString) {
    let dataset;
    try {
        // Step 1: Parse and validate the raw input string.
        dataset = extractAndParseInputData(programInputString);
    } catch (parsingError) {
        // If input parsing fails, the criteria cannot be met.
        // console.error("Input processing failed:", parsingError.message); // For debugging purposes
        console.log('No');
        return;
    }

    const { elementCount, initialValues } = dataset;

    // Step 2: Apply the specific binary-decimal transformation to all initial values.
    const processedNumericRepresentations = initialValues.map(convertToBinaryDecRepresentation);
    
    // Step 3: Compute the frequency of each unique transformed value.
    const frequencyMapOfProcessedValues = computeFrequencyMap(processedNumericRepresentations);

    // Step 4: Evaluate the core business logic based on the transformed data and frequencies.
    const finalResultVerdict = evaluateSolutionCriteria(elementCount, frequencyMapOfProcessedValues);

    // Step 5: Output the final determination.
    if (finalResultVerdict) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Entry point for execution, typically reading from standard input in competitive programming.
try {
    executeDataAnalysisPipeline(require('fs').readFileSync('/dev/stdin', 'utf8'));
} catch (applicationError) {
    // Catch any unexpected errors during file reading or subsequent processing not caught earlier.
    // console.error("An unhandled application error occurred:", applicationError.message); // For debugging
    console.log('No'); // Treat any unhandled error as a failure to meet criteria.
}