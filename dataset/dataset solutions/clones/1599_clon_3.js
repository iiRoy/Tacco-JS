/**
 * This module is designed to process raw textual input, extract numerical data,
 * and identify combinations of three distinct values that can form a valid triangle
 * according to geometric principles. It counts such valid configurations.
 */

/**
 * Analyzes the provided raw input string to count the number of valid triangle combinations.
 * The input is expected to contain the total count of segments on the first line,
 * followed by space-separated segment lengths on the second line.
 *
 * @param {string} rawInputContent The complete string content read from the input source.
 */
function AnalyzeGeometricShapes(rawInputContent) {
    // Divide the raw input into individual lines for structured processing.
    const inputLines = rawInputContent.split("\n");

    /**
     * A utility function to safely convert a string into a positive integer.
     * It includes basic validation to ensure the result is a non-negative number.
     *
     * @param {string} strValue The string to parse.
     * @param {number} [defaultValue=0] The value to return if parsing fails or results in a non-positive number.
     * @returns {number} The parsed positive integer, or the default value.
     */
    const getSafePositiveInteger = (strValue, defaultValue = 0) => {
        const parsedNumber = parseInt(strValue.trim(), 10);
        // Ensure the parsed value is a valid number and strictly positive for triangle sides.
        if (isNaN(parsedNumber) || parsedNumber <= 0) {
            // For robustness, a warning can be logged for invalid input entries.
            // console.warn(`Encountered an invalid or non-positive numeric value: '${strValue}'. Using fallback: ${defaultValue}`);
            return defaultValue;
        }
        return parsedNumber;
    };

    // Extract the expected total number of segments from the first line of input.
    let expectedSegmentCount = getSafePositiveInteger(inputLines[0], 0);

    // Parse the second line to obtain an array of individual segment measurements.
    // Only strictly positive lengths are considered valid for geometric shapes.
    const actualSegmentMeasurements = inputLines[1]
                                        .split(" ")
                                        .map(s => getSafePositiveInteger(s, -1)) // Use -1 to easily filter out invalid/non-positive
                                        .filter(val => val > 0); // Keep only genuinely positive lengths

    // Adjust the number of segments to consider for loops. It should not exceed the
    // number of actually available and valid segment measurements.
    const effectiveSegmentCount = Math.min(expectedSegmentCount, actualSegmentMeasurements.length);

    // If there aren't enough valid segments to form a triangle (minimum 3), exit early.
    if (effectiveSegmentCount < 3) {
        // console.warn("Not enough valid segment lengths found to form any triangle. Minimum 3 positive lengths required.");
        console.log(0); // Output zero triangles as none can be formed.
        return;
    }

    // Initialize a counter to keep track of successfully identified triangles.
    let confirmedTriangleCombinations = 0;

    // Use nested loops to iterate through all unique combinations of three distinct segments.
    // The loops ensure that each segment is chosen exactly once for a triplet, and in ascending index order.
    for (let indexOne = 0; indexOne < effectiveSegmentCount - 2; indexOne++) {
        const sideLengthA = actualSegmentMeasurements[indexOne];

        for (let indexTwo = indexOne + 1; indexTwo < effectiveSegmentCount - 1; indexTwo++) {
            const sideLengthB = actualSegmentMeasurements[indexTwo];

            for (let indexThree = indexTwo + 1; indexThree < effectiveSegmentCount; indexThree++) {
                const sideLengthC = actualSegmentMeasurements[indexThree];

                // Validate the current triplet: check for distinctness and triangle inequality.
                // Both conditions must be met for a valid triangle.
                if (areLengthsDistinct(sideLengthA, sideLengthB, sideLengthC) &&
                    satisfiesTriangleInequality(sideLengthA, sideLengthB, sideLengthC)) {
                    
                    confirmedTriangleCombinations++; // Increment counter if a valid triangle is found.
                }
            }
        }
    }

    // Output the final tally of valid triangle combinations.
    console.log(confirmedTriangleCombinations);
}

/**
 * Determines if three given numerical lengths are all unique (distinct from each other).
 * This is a requirement for the problem's definition of a "triangle."
 *
 * @param {number} length1 The first length.
 * @param {number} length2 The second length.
 * @param {number} length3 The third length.
 * @returns {boolean} True if all three lengths are unique, false otherwise.
 */
function areLengthsDistinct(length1, length2, length3) {
    // A Set stores only unique values. If the size of a Set constructed from the three
    // lengths is 3, then all original lengths must have been distinct.
    const uniqueLengthSet = new Set([length1, length2, length3]);
    return uniqueLengthSet.size === 3;
}

/**
 * Verifies if three given side lengths conform to the triangle inequality theorem.
 * This theorem states that the sum of the lengths of any two sides of a triangle
 * must be greater than the length of the third side.
 * It also implicitly assumes all lengths are positive, which is handled by input filtering.
 *
 * @param {number} firstSide The length of the first side.
 * @param {number} secondSide The length of the second side.
 * @param {number} thirdSide The length of the third side.
 * @returns {boolean} True if the sides can form a valid triangle, false otherwise.
 */
function satisfiesTriangleInequality(firstSide, secondSide, thirdSide) {
    // Calculate the sum of each pair of sides.
    const sumOfFirstTwo = firstSide + secondSide;
    const sumOfLastTwo = secondSide + thirdSide;
    const sumOfFirstAndLast = thirdSide + firstSide;

    // Check all three conditions of the triangle inequality theorem.
    const conditionA = sumOfFirstTwo > thirdSide;
    const conditionB = sumOfLastTwo > firstSide;
    const conditionC = sumOfFirstAndLast > secondSide;

    // All conditions must be true for the sides to form a triangle.
    return conditionA && conditionB && conditionC;
}

// The main entry point for execution, typically reading from standard input.
// This part is standard for competitive programming environments.
AnalyzeGeometricShapes(require("fs").readFileSync("/dev/stdin", "utf8"));