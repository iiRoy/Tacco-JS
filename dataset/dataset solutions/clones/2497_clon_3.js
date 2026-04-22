'use strict'; // Enforcing strict mode for cleaner code practices.

/**
 * Processes raw input data to identify combinations of three numbers that can form a valid triangle.
 * The input is expected to be a string containing two lines:
 * 1. The total count of numbers (N).
 * 2. A space-separated list of N numbers.
 *
 * @param {string} inputStringPayload - The raw string data read from an input source.
 */
function processInputData(inputStringPayload) {
    // Stage 1: Initial Input Parsing and Validation
    // Remove leading/trailing whitespace and split the input into individual lines.
    // Filter out any completely empty lines that might result from extra newlines.
    const processedLines = inputStringPayload
        .trim()
        .split('\n')
        .filter(lineContent => lineContent.length > 0);

    // Guard clause: Ensure there are at least two lines of input (N and the numbers).
    if (processedLines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines (N and numbers).");
        return; // Exit if input is malformed.
    }

    // Extract the declared total count of numbers from the first line.
    const totalNumberCount = parseInt(processedLines[0], 10);

    // Remove the first line from the array, leaving only the line with numbers.
    processedLines.shift();

    // Parse the second line (now at index 0) containing the space-separated numbers.
    // Convert each string representation of a number to an integer.
    let numericElements = processedLines[0]
        .split(' ')
        .map(strValue => parseInt(strValue, 10));

    // Optional validation: Check if the declared count matches the actual parsed count.
    // This is a robustness check; the problem statement implies N is authoritative.
    if (numericElements.length !== totalNumberCount) {
        console.warn(`Warning: Declared number count (${totalNumberCount}) does not match ` +
                     `actual parsed numbers (${numericElements.length}). Proceeding with declared count for loop bounds.`);
        // For this problem, we will use totalNumberCount for loop boundaries as per typical competitive programming context.
    }

    // Stage 2: Pre-processing - Sorting for Efficiency
    // Sort the numeric elements in ascending order. This is crucial for the
    // optimization in the nested loops and for the triangle inequality check.
    numericElements.sort((valueA, valueB) => valueA - valueB);

    // Stage 3: Core Logic - Triangle Formation Check Helper
    /**
     * Determines if three given side lengths can form a valid triangle.
     * The triangle inequality theorem states that the sum of the lengths of any two sides
     * of a triangle must be strictly greater than the length of the third side.
     *
     * @param {number} firstSide - The length of the first side.
     * @param {number} secondSide - The length of the second side.
     * @param {number} thirdSide - The length of the third side.
     * @returns {boolean} True if the sides can form a triangle, false otherwise.
     */
    const checkTriangleFormation = (firstSide, secondSide, thirdSide) => {
        // Evaluate each part of the triangle inequality theorem.
        const conditionOneMet = (firstSide + secondSide > thirdSide);
        const conditionTwoMet = (firstSide + thirdSide > secondSide);
        const conditionThreeMet = (secondSide + thirdSide > firstSide);

        // A triangle is valid only if all three conditions are simultaneously met.
        return conditionOneMet && conditionTwoMet && conditionThreeMet;
    };

    // Stage 4: Iteration and Counting Valid Triangles
    let validTriangleCombinations = 0; // Initialize a counter for successful triangle formations.

    // Guard clause: A minimum of 3 numbers are required to form any triangle.
    if (totalNumberCount < 3) {
        console.log(0); // If not enough numbers, output 0 and exit.
        return;
    }

    // Nested loops to select unique combinations of three numbers (i, j, k)
    // The outer loop picks the first side (smallest, due to sorting).
    for (let currentFirstIndex = 0; currentFirstIndex < totalNumberCount - 2; ++currentFirstIndex) {
        const valueA = numericElements[currentFirstIndex];

        // The middle loop picks the second side, ensuring it's distinct and after the first.
        for (let currentSecondIndex = currentFirstIndex + 1; currentSecondIndex < totalNumberCount - 1; ++currentSecondIndex) {
            const valueB = numericElements[currentSecondIndex];

            // The inner loop picks the third side, ensuring it's distinct and after the second.
            for (let currentThirdIndex = currentSecondIndex + 1; currentThirdIndex < totalNumberCount; ++currentThirdIndex) {
                const valueC = numericElements[currentThirdIndex];

                // Optimization: Due to the sorted array, if the sum of the two smaller sides
                // (valueA + valueB) is not strictly greater than the largest side (valueC),
                // then any subsequent 'valueC' (numericElements[currentThirdIndex + 1], etc.)
                // will also fail this condition because they will be equal to or larger than valueC.
                // Therefore, we can safely break out of this innermost loop and move to the next 'valueB'.
                if (valueA + valueB <= valueC) {
                    break; // Early exit from the innermost loop.
                }

                // If the optimization didn't trigger, it means valueA + valueB > valueC.
                // Now, check the remaining two conditions of the triangle inequality.
                if (checkTriangleFormation(valueA, valueB, valueC)) {
                    validTriangleCombinations++; // Increment the counter for each valid triangle found.
                }
            }
        }
    }

    // Stage 5: Output the Final Result
    // Print the total number of valid triangle combinations to the console.
    console.log(validTriangleCombinations);
}

// Entry point: Read data from standard input and pass it to the processing function.
// This setup is typical for JavaScript environments used in competitive programming.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));