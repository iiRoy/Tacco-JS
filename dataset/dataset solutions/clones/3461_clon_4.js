function computeNumericalSequenceResult(dataStream) {
    // Parse the input data: trim whitespace, split into lines, and convert each line to a number.
    // This deviates from the original's implicit handling of empty lines from split("\n").
    const numericalComponents = String(dataStream).trim().split('\n').map(Number);
    
    // Extract the total count of elements and the sequence of numbers.
    // This avoids an explicit loop for copying.
    const elementCount = numericalComponents[0];
    const rawNumberSequence = numericalComponents.slice(1);
    
    // Sort the sequence in ascending order to match the original's prerequisite.
    // Using a spread operator to ensure a new array is created before sorting.
    const orderedNumericalCollection = [...rawNumberSequence].sort((valA, valB) => valA - valB);
    
    // Determine the division point for initial coefficient assignment.
    // This is equivalent to Math.ceil(elementCount / 2).
    const partitionIndex = Math.ceil(elementCount / 2);
    
    // Initialize a mapping of indices to coefficients.
    // This replaces the imperative loops for initial sum calculation.
    const coefficientRegistry = new Map();
    for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
        coefficientRegistry.set(currentIdx, (currentIdx < partitionIndex) ? -2 : 2);
    }
    
    // Apply specific coefficient adjustments based on the parity of the element count.
    if (elementCount % 2 === 0) { // Even count scenario
        // Original: ans - s[m] + s[m-1]
        // This translates to changing the coefficient of s[m] from 2 to 1,
        // and s[m-1] from -2 to -1.
        coefficientRegistry.set(partitionIndex, 1);
        coefficientRegistry.set(partitionIndex - 1, -1);
    } else { // Odd count scenario
        // Identify key indices for conditional logic.
        const midElementIdx = partitionIndex - 1; // Corresponds to s[m-1]
        const preMidElementIdx = partitionIndex - 2; // Corresponds to s[m-2]
        const postMidElementIdx = partitionIndex; // Corresponds to s[m]

        // Retrieve values using .at() for safe access, which returns undefined for out-of-bounds.
        const midVal = orderedNumericalCollection.at(midElementIdx);
        const preMidVal = orderedNumericalCollection.at(preMidElementIdx);
        const postMidVal = orderedNumericalCollection.at(postMidElementIdx);

        // Replicate the original's conditional logic and NaN propagation.
        // Comparisons involving NaN (from `undefined + X` or `undefined - X`) always result in false.
        let conditionEvaluatesTrue;
        if (preMidVal === undefined || postMidVal === undefined) {
             conditionEvaluatesTrue = false;
        } else {
             conditionEvaluatesTrue = (midVal + preMidVal) > (midVal * 3 - postMidVal);
        }

        if (conditionEvaluatesTrue) {
            // Original: ans + s[m-1] + s[m-2]
            // s[m-1] (midElementIdx) coeff changes from -2 to -1.
            // s[m-2] (preMidElementIdx) coeff changes from -2 to -1.
            coefficientRegistry.set(midElementIdx, -1);
            if (preMidElementIdx >= 0) { // Ensure index is valid for s[m-2]
                coefficientRegistry.set(preMidElementIdx, -1);
            } else {
                // If s[m-2] was undefined but this branch was taken, original would yield NaN.
                return NaN;
            }
        } else {
            // Original: ans + s[m-1]*3 - s[m]
            // s[m-1] (midElementIdx) coeff changes from -2 to 1.
            // s[m] (postMidElementIdx) coeff changes from 2 to 1.
            coefficientRegistry.set(midElementIdx, 1);
            if (postMidElementIdx < elementCount) { // Ensure index is valid for s[m]
                coefficientRegistry.set(postMidElementIdx, 1);
            } else {
                // If s[m] was undefined and this branch was taken, original would yield NaN.
                return NaN;
            }
        }
    }
    
    // Calculate the final aggregate value using the determined coefficients.
    // This replaces the final imperative sum calculation.
    const finalAggregateValue = orderedNumericalCollection.reduce((accumulatedSum, currentElement, elementIndex) => {
        const designatedCoefficient = coefficientRegistry.get(elementIndex);
        return accumulatedSum + currentElement * designatedCoefficient;
    }, 0); // Start accumulation from zero.
    
    return finalAggregateValue;
}

// Global execution point: read from stdin and log the result.
// Using 'node:fs' for a slightly different module import syntax.
console.log(computeNumericalSequenceResult(require("node:fs").readFileSync("/dev/stdin", "utf8")));