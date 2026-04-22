/**
 * Core utility to determine the index of the numerical value
 * within a given dataset that is numerically closest to the dataset's average.
 * This function handles raw string input, parsing, calculation, and sorting.
 *
 * @param {string} rawSourceInput The complete input string, expected to contain
 *                                the count of numbers on the first line and
 *                                the space-separated numbers on the second line.
 * @returns {number} The zero-based index of the element in the original sequence
 *                   that exhibits the minimum absolute deviation from the mean.
 *                   Returns -1 if input is invalid or no suitable element can be found.
 */
function ProcessInputData(rawSourceInput) {
    // Validate the input string before proceeding.
    if (typeof rawSourceInput !== 'string' || rawSourceInput.trim() === '') {
        console.error("Input error: Raw source input must be a non-empty string.");
        return -1; // Indicate an error or invalid input.
    }

    // Divide the composite input string into distinct lines.
    const inputLineSegments = rawSourceInput.split('\n');

    // Ensure we have at least two lines for the count and the data.
    if (inputLineSegments.length < 2) {
        console.error("Input error: Expected at least two lines for count and data.");
        return -1;
    }

    // Attempt to parse the total quantity of data points from the initial line.
    // Use trim() to remove any leading/trailing whitespace that might interfere with parsing.
    const elementCount = parseInt(inputLineSegments[0].trim(), 10);

    // Perform validation on the parsed element count.
    if (isNaN(elementCount) || elementCount <= 0) {
        console.error(`Input error: Invalid or non-positive element count detected: '${inputLineSegments[0]}'.`);
        return -1;
    }

    // Process the second line to extract individual numerical entries.
    // Filter out any empty strings that might result from multiple spaces, then map to numbers.
    const numericalSequence = inputLineSegments[1].trim().split(' ').filter(Boolean).map(Number);

    // Verify that the number of parsed values matches the declared count.
    if (numericalSequence.length !== elementCount) {
        console.error(`Input error: Mismatch between declared element count (${elementCount}) and actual parsed values (${numericalSequence.length}).`);
        return -1;
    }

    // Additional validation: ensure all parsed elements are valid numbers.
    const containsInvalidNumbers = numericalSequence.some(val => isNaN(val));
    if (containsInvalidNumbers) {
        console.error("Input error: The numerical sequence contains non-numeric values.");
        return -1;
    }

    // Edge case: If there's only one element, it's trivially the closest to its own average.
    if (elementCount === 1) {
        return 0; // The first (and only) element's index.
    }

    // Calculate the cumulative sum of all numerical entries using 'reduce'.
    // Initialize accumulator with 0 to ensure correct summation even for empty arrays (though handled by elementCount check).
    const cumulativeSum = numericalSequence.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    // Derive the arithmetic mean (average) for the dataset.
    // A division by zero scenario for elementCount <= 0 is already guarded against.
    const arithmeticMean = cumulativeSum / elementCount;

    // Transform the original numerical sequence into a new array of objects.
    // Each object will store the absolute deviation from the mean and its original index.
    const indexedDeviations = numericalSequence.map((valueItem, originalPositionIndex) => {
        const absoluteDeviation = Math.abs(valueItem - arithmeticMean);
        return {
            deviationMetric: absoluteDeviation,
            initialIndex: originalPositionIndex
        };
    });

    // Sort this new array based on the 'deviationMetric' in ascending order.
    // If deviations are equal, an additional tie-breaking rule is applied:
    // prefer the element with the smaller original index. This ensures deterministic output.
    indexedDeviations.sort((dataPointA, dataPointB) => {
        // Compare deviation metrics primarily.
        const comparisonResult = dataPointA.deviationMetric - dataPointB.deviationMetric;

        // If deviations are identical, use the original index as a secondary sorting key.
        if (comparisonResult === 0) {
            return dataPointA.initialIndex - dataPointB.initialIndex;
        }
        return comparisonResult;
    });

    // The element with the smallest deviation from the mean will now be at the front of the sorted array.
    // Return its 'initialIndex' property.
    // A final check for an empty array, though previous validations should prevent this.
    if (indexedDeviations.length === 0) {
        console.error("Processing error: No deviations calculated, possibly due to unexpected input state.");
        return -1;
    }

    return indexedDeviations[0].initialIndex;
}