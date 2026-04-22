// This script is designed to process numerical array data from standard input.
// Its primary function is to identify and count specific "symmetric" pairs within the array.
// A symmetric pair (x, y) is defined such that the element at index (x-1) is y,
// and simultaneously, the element at index (y-1) is x.
// The code ensures each such pair is counted only once, typically when the smaller index is encountered first.

// Utility function to robustly read all data from standard input.
// This approach is common in environments like competitive programming platforms.
const obtainInputLines = () => {
    try {
        // Attempt to read the entire content of standard input (`/dev/stdin`).
        // The 'utf8' encoding is specified for proper text interpretation.
        const fullRawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

        // Clean up the input: remove any leading/trailing whitespace,
        // then split the content into an array of individual lines.
        // This prepares the data for subsequent structured parsing.
        return fullRawInput.trim().split('\n');
    } catch (inputError) {
        // In case of an error during file reading (e.g., file not found, permissions),
        // log the error and return an empty array to prevent further processing with invalid data.
        console.error("Error reading standard input:", inputError.message);
        return [];
    }
};

// The core algorithm responsible for analyzing the array and counting symmetric pairs.
const calculateSymmetricPairCount = () => {
    // Retrieve all lines of input from the standard input stream.
    const receivedInputSegments = obtainInputLines();

    // Validate if any input was received. If not, exit gracefully.
    if (receivedInputSegments.length === 0) {
        console.log(0); // No input, thus no pairs.
        return;
    }

    // The very first line of input is expected to be the total count of elements (N).
    // Convert this string to a number. `Number()` is a reliable way to cast.
    const declaredArrayLength = Number(receivedInputSegments.shift());

    // Perform initial validation on the array length.
    // If it's not a valid positive number, there's nothing meaningful to process.
    if (isNaN(declaredArrayLength) || declaredArrayLength <= 0) {
        console.log(0); // Invalid length, no pairs.
        return;
    }

    // The second line of input contains the space-separated elements of the array.
    // 1. Split the string by spaces.
    // 2. Filter out any empty strings that might result from multiple spaces.
    // 3. Map each remaining string element to its numeric equivalent.
    const dataElementCollection = receivedInputSegments.shift().split(' ').filter(Boolean).map(Number);

    // Crucial validation: ensure the number of elements actually provided
    // matches the `declaredArrayLength`. Mismatched input implies an error.
    if (dataElementCollection.length !== declaredArrayLength) {
        // console.warn("Input anomaly: Actual element count differs from declared array length."); // Debugging
        console.log(0); // Treat malformed input as having no valid pairs.
        return;
    }

    // A `Map` is used here instead of a plain object.
    // It's a more suitable data structure when keys are not strictly strings (e.g., numbers)
    // and offers better performance for frequent additions and lookups with non-string keys.
    // This map stores `(oneBasedIndex -> elementValue)` for elements encountered so far.
    const elementIndexToValueMap = new Map();

    // This variable will accumulate the total count of symmetric pairs found.
    let totalSymmetricPairMatches = 0;

    // Iterate through each element of the `dataElementCollection`.
    // `currentZeroBasedIndex` is the standard 0-based array index.
    for (let currentZeroBasedIndex = 0; currentZeroBasedIndex < declaredArrayLength; currentZeroBasedIndex++) {
        // Extract the numerical value of the element at the current index.
        const actualElementValue = dataElementCollection[currentZeroBasedIndex];

        // Calculate the 1-based index, which is often used in problem statements.
        const currentOneBasedIndex = currentZeroBasedIndex + 1;

        // Check if the `actualElementValue` (i.e., A[currentZeroBasedIndex])
        // has previously been stored as a *key* in our `elementIndexToValueMap`.
        // If it has, it means we previously recorded a mapping where `actualElementValue` was an index.
        if (elementIndexToValueMap.has(actualElementValue)) {
            // Retrieve the value associated with `actualElementValue` from the map.
            // This value represents `A[actualElementValue - 1]` from a previous iteration.
            const previouslyMappedValue = elementIndexToValueMap.get(actualElementValue);

            // Now, we check if this `previouslyMappedValue` is equal to our `currentOneBasedIndex`.
            // This condition completes the symmetric pair check:
            // If A[currentZeroBasedIndex] = actualElementValue (which is `Y`)
            // AND A[actualElementValue - 1] = currentOneBasedIndex (which is `X`)
            // then we've found a pair (X, Y) such that A[X-1]=Y and A[Y-1]=X.
            // The logic of the map ensures we count each pair only once (e.g., when X < Y).
            if (previouslyMappedValue === currentOneBasedIndex) {
                totalSymmetricPairMatches++;
            }
        } else {
            // If `actualElementValue` has not been seen as a key in the map yet,
            // we store the current mapping: `currentOneBasedIndex` (key) -> `actualElementValue` (value).
            // This records the first half of a potential symmetric pair, waiting for its counterpart.
            elementIndexToValueMap.set(currentOneBasedIndex, actualElementValue);
        }
    }

    // Output the final count of identified symmetric pairs to standard output.
    console.log(totalSymmetricPairMatches);
};

// Initiate the array processing and pair counting.
calculateSymmetricPairCount();