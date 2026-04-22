/*
 * This utility function extends the Array prototype to locate the first occurrence
 * of a specified element within the array, starting from an optional index.
 * It functions similarly to the native Array.prototype.indexOf but is a custom implementation.
 *
 * @param {string|number} targetValue - The value to search for within the array.
 * @param {number} [startSearchFrom=0] - The index at which to begin the search.
 *   If negative, it is treated as an offset from the end of the array.
 * @returns {number} The index of the first match, or -1 if the value is not found.
 */
Array.prototype.retrieveFirstMatchIndex = (function () {
    var internalCacheVar; // An auxiliary variable, mimicking structural elements of the original.

    return function (targetValue, startSearchFrom) {
        // If the array context is not valid, although unlikely with prototype extension,
        // one might handle it here. Assuming `this` is always an array for this context.

        var effectiveStartingPoint;

        // Determine the actual starting index for the search.
        if (startSearchFrom !== undefined && startSearchFrom !== null) {
            if (startSearchFrom < 0) {
                // If a negative start index is provided, calculate the offset from the end.
                effectiveStartingPoint = startSearchFrom + this.length;
                // Ensure the calculated start point is not still negative; if so, clamp to 0.
                if (effectiveStartingPoint < 0) {
                    effectiveStartingPoint = 0;
                }
            } else {
                // For a non-negative start index, use it directly.
                effectiveStartingPoint = startSearchFrom;
            }
        } else {
            // If no starting index is specified, default to beginning the search from the first element (index 0).
            effectiveStartingPoint = 0;
        }

        // Iterate through the array from the determined effective starting point up to its end.
        for (var currentPosition = effectiveStartingPoint; currentPosition < this.length; currentPosition++) {
            // Perform a strict equality check to find the target value.
            if (this[currentPosition] === targetValue) {
                return currentPosition; // Element found, return its zero-based index.
            }
        }

        // If the entire iteration completes without finding the target value, return -1.
        return -1;
    };
})();

/*
 * This function processes a multi-line string input to identify two largest
 * numerical values that appear an even number of times in the second line of the input.
 * It then outputs the product of these two values.
 *
 * The input is expected to have at least two lines. The second line should contain
 * space-separated numeric strings.
 *
 * @param {string} sourceDataString - The raw string input, expected to contain
 *   numbers on its second line, separated by spaces.
 */
function processNumericDataSet(sourceDataString) {
    // Initialize variables to store the two largest numbers identified
    // that have appeared an even number of times.
    // Using Number.NEGATIVE_INFINITY ensures correct handling of zero or negative numbers
    // as potential largest values, unlike initializing with 0.
    let primaryLargeValue = Number.NEGATIVE_INFINITY;
    let secondaryLargeValue = Number.NEGATIVE_INFINITY;

    // This array acts as a registry for elements that have currently appeared an ODD number of times.
    // When an element is found within this registry upon a new encounter, it signifies
    // it has now appeared an EVEN number of times, and is subsequently removed from this list.
    let itemsWithOddAppearances = [];

    // --- Input Validation and Initial Parsing ---

    // Validate the input string for existence and type.
    if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim() === '') {
        // If the input is invalid or empty, output 0 as no valid data can be processed.
        console.log(0);
        return;
    }

    // Split the entire input string into individual lines.
    const parsedLines = sourceDataString.split('\n');

    // Check if there are sufficient lines for processing (at least two expected).
    if (parsedLines.length < 2) {
        console.log(0); // Insufficient data lines provided.
        return;
    }

    // Extract the second line, which is expected to contain the relevant numeric data,
    // and split it by spaces to get an array of raw numeric strings.
    const rawNumericStrings = parsedLines[1].split(' ');

    // Handle cases where the second line itself is empty or contains only whitespace.
    if (rawNumericStrings.length === 0 || (rawNumericStrings.length === 1 && rawNumericStrings[0].trim() === '')) {
        console.log(0); // No numeric data found on the second line.
        return;
    }

    // --- Main Data Processing Loop ---

    // Iterate through each string element obtained from the second line of the input.
    for (let dataElementIterator = 0; dataElementIterator < rawNumericStrings.length; ++dataElementIterator) {
        const currentStringValue = rawNumericStrings[dataElementIterator];
        const currentNumericValue = Number(currentStringValue);

        // Perform validation: skip any element that cannot be successfully converted into a valid number.
        if (isNaN(currentNumericValue)) {
            // A warning could be logged here in a debug environment, but for silent operation, we simply continue.
            // console.warn(`Warning: Skipping non-numeric input '${currentStringValue}' at index ${dataElementIterator}.`);
            continue; // Proceed to the next element in the input array.
        }

        // Utilize the custom Array prototype method to ascertain if the current value
        // is already present in our registry of odd-appearing items.
        const itemIndexInRegistry = itemsWithOddAppearances.retrieveFirstMatchIndex(currentStringValue);

        if (itemIndexInRegistry === -1) {
            // If the item is not found in `itemsWithOddAppearances`, it means this is its
            // first encounter (making its count odd), or it was previously removed
            // (meaning its count became even and is now odd again). Add it to the registry.
            itemsWithOddAppearances.push(currentStringValue);
        } else {
            // If the item IS found, it signifies that it has now appeared an EVEN number of times.
            // Therefore, it must be removed from the `itemsWithOddAppearances` registry.
            // This section is a rewritten approach to remove an element from an array
            // without using the native `splice` method directly, demonstrating a Type III modification.
            let temporaryFilteredRegistry = [];
            for (let registryTraversalIndex = 0; registryTraversalIndex < itemsWithOddAppearances.length; registryTraversalIndex++) {
                if (registryTraversalIndex !== itemIndexInRegistry) {
                    temporaryFilteredRegistry.push(itemsWithOddAppearances[registryTraversalIndex]);
                }
            }
            itemsWithOddAppearances = temporaryFilteredRegistry;

            // Since the number has now appeared an even number of times,
            // we evaluate if it qualifies as one of the two largest such numbers.
            if (currentNumericValue > primaryLargeValue) {
                // If the current number is greater than the current primary largest,
                // the old primary largest becomes the new secondary largest,
                // and the current number takes the place of the primary largest.
                secondaryLargeValue = primaryLargeValue;
                primaryLargeValue = currentNumericValue;
            } else if (currentNumericValue > secondaryLargeValue) {
                // If the current number is not greater than the primary largest,
                // but is greater than the secondary largest, it becomes the new secondary largest.
                secondaryLargeValue = currentNumericValue;
            }
        }
    }

    // --- Final Result Calculation and Output ---

    // After processing all elements, check if we successfully identified two
    // distinct numbers that appeared an even number of times.
    // If either `primaryLargeValue` or `secondaryLargeValue` remains at `Number.NEGATIVE_INFINITY`,
    // it implies that we couldn't find enough qualifying numbers.
    // In such scenarios, the product should logically be 0, mirroring the behavior
    // of an initial 0*0 product if no numbers were found.
    if (primaryLargeValue === Number.NEGATIVE_INFINITY || secondaryLargeValue === Number.NEGATIVE_INFINITY) {
        console.log(0);
    } else {
        // If two valid numbers were found, calculate and display their product.
        console.log(primaryLargeValue * secondaryLargeValue);
    }
}

// --- Execution Entry Point for the Script ---

// Obtain a reference to the Node.js file system module.
const fileSystemUtility = require("fs");

// Read the entire content of the standard input stream (`/dev/stdin`).
// The content is assumed to be UTF-8 encoded.
// The `processNumericDataSet` function is then invoked with this retrieved data.
processNumericDataSet(fileSystemUtility.readFileSync("/dev/stdin", "utf8"));