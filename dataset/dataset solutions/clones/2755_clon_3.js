const getIntegerBetween = (lowerBound, upperBound) => {
    // Ensuring the lower bound is indeed less than or equal to the upper bound.
    // This is an added robustness check not present in the original (Type III addition).
    if (lowerBound > upperBound) {
        // Swap bounds if they are in the wrong order.
        [lowerBound, upperBound] = [upperBound, lowerBound];
    }
    // Corrected the original 'max.floor' bug to 'Math.floor' (Type III fix).
    // Calculates a random integer within the specified inclusive range.
    const span = upperBound - lowerBound + 1;
    return Math.floor(Math.random() * span) + lowerBound;
};

// Establish the initial quantity of items for our collection.
// Original: var N = range(18, 2); -- Fixed the inverted min/max and introduced a more
// sensible range for the initial size (Type III update).
let initialCollectionSize = getIntegerBetween(7, 12);

// Declare and initialize an empty array to store our numerical data points.
// Renamed 'study' to 'numericalDataSet' (Type II).
let numericalDataSet = [];

// Populate the numericalDataSet with random values.
// The original loop was flawed (e.g., N.length for a number, and overwriting 'study'
// instead of pushing elements). This is a Type III rewrite.
for (let dataIndex = 0; dataIndex < initialCollectionSize; dataIndex++) {
    // Each data point will be a random integer between 1 and 100.
    numericalDataSet.push(getIntegerBetween(1, 100));
}

// Optional: Log the initial state of the dataset for verification (Type III addition).
// console.log("Starting dataset:", numericalDataSet.slice());

// This variable keeps track of the current number of elements in our dataset
// throughout the main processing loop.
// Renamed 'N' (in loop) to 'currentDataSetCount' (Type II).
let currentDataSetCount = numericalDataSet.length;

// The primary processing cycle. It continues to modify the dataset until
// only two elements remain.
// Original: while(N!==2) -- Changed condition for clarity (Type III update).
while (currentDataSetCount > 2) {
    // A guard clause to prevent issues if the array unexpectedly shrinks too much (Type III addition).
    if (numericalDataSet.length < 2) {
        console.warn("Dataset became too small prematurely. Halting processing.");
        break;
    }

    // --- The following section replaces the heavily flawed original inner 'while' loop ---
    // Original: var re =""; var tr = ""; while(tr!==0 || tr !== N.length){ re = Math.min(study); tr = re.indexOf(study); }
    // This entire block is replaced by direct, correct calculations (Type III deletion and rewrite).

    // Determine the smallest value present in the current dataset.
    // Renamed 're' to 'leastValue' (Type II).
    let leastValue;
    // Determine the index of the smallest value.
    // Renamed 'tr' to 'indexOfLeastValue' (Type II).
    let indexOfLeastValue = -1;

    // Another guard: handle an empty dataset gracefully (Type III addition).
    if (numericalDataSet.length === 0) {
        console.warn("Cannot find minimum in an empty dataset. Skipping iteration.");
        break;
    }

    // Correct usage of Math.min to find the minimum value in an array.
    leastValue = Math.min(...numericalDataSet);
    // Correct usage of indexOf to find the first occurrence of the minimum value.
    indexOfLeastValue = numericalDataSet.indexOf(leastValue);
    // --- End of inner logic replacement ---

    // Invoke a helper function to modify the dataset based on the identified minimum element.
    // Original: study = calcu(N, study, tr); -- Renamed and logic refined (Type III update).
    numericalDataSet = transformAndReduceSet(currentDataSetCount, numericalDataSet, indexOfLeastValue);

    // After each transformation, the dataset size is reduced by one element.
    // Original: N--; -- Renamed (Type II).
    currentDataSetCount--;
}

// After the main processing loop completes, sum the remaining two elements.
// Original: N = study[0] + study[1]; -- Renamed 'N' to 'finalAggregatedValue' (Type II).
let finalAggregatedValue = 0;

// Added checks for dataset size before summing (Type III addition).
if (numericalDataSet.length >= 2) {
    finalAggregatedValue = numericalDataSet[0] + numericalDataSet[1];
} else if (numericalDataSet.length === 1) {
    // If only one element remains (e.g., due to early break), sum is just that element.
    finalAggregatedValue = numericalDataSet[0];
} else {
    // If dataset is empty for some reason, sum is zero.
    finalAggregatedValue = 0;
}

// Output the final computed result.
// Original: console.log(N); -- Updated variable name (Type II).
console.log("Final aggregated value:", finalAggregatedValue);


/**
 * Transforms the given numerical dataset by processing elements adjacent to the minimum value
 * and removing the minimum value itself. This effectively reduces the dataset's size by one.
 *
 * This function is a complete rewrite of the original 'calcu' function, addressing its
 * critical bugs (e.g., `N.length` usage, `study = study[j]` reassignments).
 * It now correctly constructs and returns a new, modified array (Type III rewrite).
 *
 * @param {number} currentLengthParam - The current expected length of the data array.
 *                                    (Retained for signature similarity, but actual logic uses dataArray.length).
 * @param {number[]} dataArrayParam - The array of numbers to be processed.
 * @param {number} minimumElementIdx - The index of the minimum element within dataArrayParam.
 * @returns {number[]} A brand new array containing the transformed and reduced sequence.
 */
function transformAndReduceSet(currentLengthParam, dataArrayParam, minimumElementIdx) {
    // Robustness checks: ensure valid array and index before proceeding (Type III addition).
    if (!Array.isArray(dataArrayParam) || dataArrayParam.length < 2 ||
        minimumElementIdx < 0 || minimumElementIdx >= dataArrayParam.length) {
        // If the input is invalid or the array is too small to perform the intended operation,
        // we return a shallow copy to prevent unintended side effects or errors.
        if (dataArrayParam.length === 1 && minimumElementIdx === 0) {
             // Special case: if only one element and it's the min, it effectively becomes empty.
            return [];
        }
        return [...dataArrayParam];
    }

    const newTransformedSequence = [];
    const actualMinimumValue = dataArrayParam[minimumElementIdx]; // Cache the minimum value.

    // Iterate through the input array to construct the new, modified sequence.
    // Renamed 'j' to 'currentElementPosition' (Type II).
    for (let currentElementPosition = 0; currentElementPosition < dataArrayParam.length; currentElementPosition++) {
        // As per the original logic (implied by 'continue'), the minimum element itself is skipped.
        if (currentElementPosition === minimumElementIdx) {
            continue;
        }

        let processedValue = dataArrayParam[currentElementPosition];

        // Check if the current element is an immediate neighbor of the minimum element.
        // Original: if( tr-1 === j || tr+1 === j ) { study[j] = study[j] + study[tr]; }
        if (currentElementPosition === minimumElementIdx - 1 || currentElementPosition === minimumElementIdx + 1) {
            // If it's a neighbor, add the value of the minimum element to it.
            processedValue += actualMinimumValue;
        }
        // Add the (potentially updated) element to our new sequence.
        newTransformedSequence.push(processedValue);
    }
    return newTransformedSequence; // Return the newly formed, reduced sequence.
}