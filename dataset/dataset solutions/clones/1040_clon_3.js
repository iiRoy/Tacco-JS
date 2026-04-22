// This module processes numerical data from a standard input stream.
// Its primary purpose is to identify and count elements from a query list
// that are present within a pre-defined, sorted reference collection.

// Establish connection to the file system to read input.
const systemIO = require('fs');
const defaultInputPath = '/dev/stdin'; // Specifies the standard input channel.
const rawInputContent = systemIO.readFileSync(defaultInputPath, 'utf8');

// --- Data Preparation Phase ---

// Verify that the input data is not empty before proceeding.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("Fatal Error: Input stream is devoid of any content.");
    process.exit(1); // Terminate execution due to critical input error.
}

// Segment the raw input into distinct lines.
const parsedInputLines = rawInputContent.trim().split("\n");

// Retrieve the intended size for the primary data collection from the first line.
const declaredPrimarySetCountString = parsedInputLines[0];
const primaryCollectionExpectedSize = Number(declaredPrimarySetCountString);

// Extract and parse the elements for the primary (reference) collection from the second line.
const primaryCollectionElementsString = parsedInputLines[1];
const primaryReferenceCollection = primaryCollectionElementsString.split(" ").map(Number);

// Add a validation step: compare declared size with actual parsed array length.
if (primaryReferenceCollection.length !== primaryCollectionExpectedSize) {
    // This warning signifies a potential discrepancy but allows execution to continue,
    // prioritizing the actual data over a potentially incorrect header.
    console.warn(`Data Mismatch Warning: Declared primary collection size (${primaryCollectionExpectedSize}) does not align with the actual count of parsed elements (${primaryReferenceCollection.length}). Proceeding with actual count.`);
}

// The third line (index 2) in the original source was commented out and unused (N2).
// For this Type III clone, we've entirely removed its parsing, signifying a deletion of non-essential code.

// Extract and parse the elements for the secondary (query) collection from the fourth line.
const secondaryQueryElementsString = parsedInputLines[3];
const secondaryQueryCollection = secondaryQueryElementsString.split(" ").map(Number);


// --- Advanced Search Algorithm Implementation (Binary Search) ---

/**
 * Constructs a highly optimized function for searching within a pre-sorted numeric array.
 * This function is an IIFE (Immediately Invoked Function Expression) for encapsulating the
 * `targetDataSet` and creating a closure for the search predicate.
 * @param {Array<number>} targetDataSet The numeric array to be searched. Must be sorted in ascending order.
 * @returns {function(number): boolean} A predicate function that takes a number and returns true if found, false otherwise.
 */
const createOptimizedPresenceChecker = (function(targetDataSet) {
    // Implement an early exit for an empty target set.
    if (targetDataSet.length === 0) {
        return (valueToFind) => false; // If the set is empty, no element can ever be found.
    }

    // Optional robustness check: ensure the target array is indeed sorted.
    // While binary search *requires* sorted input, the original code didn't validate this.
    // Adding this check enhances robustness as a Type III addition.
    for (let i = 0; i < targetDataSet.length - 1; i++) {
        if (targetDataSet[i] > targetDataSet[i + 1]) {
            console.error("Algorithm Precondition Violation: The reference data set is not sorted. Binary search results may be inaccurate.");
            // In a production system, one might throw an error or attempt to sort.
            // Here, we log a warning and proceed, as per Type III guidelines for adding fragments.
            break;
        }
    }

    // This is the actual search function returned by the IIFE.
    return (valueToFind) => {
        let lowerBoundIndex = 0;
        let upperBoundIndex = targetDataSet.length - 1; // Using inclusive bounds for this variant of binary search.
        let centralPointIndex;

        // Preliminary range check: If the value is outside the min/max of the array, it can't be present.
        // This is a rewritten and slightly expanded version of the original's initial guard.
        if (valueToFind < targetDataSet[lowerBoundIndex] || valueToFind > targetDataSet[upperBoundIndex]) {
            return false;
        }

        // The core binary search loop.
        while (lowerBoundIndex <= upperBoundIndex) { // Loop continues as long as the search space is valid.
            centralPointIndex = Math.floor((lowerBoundIndex + upperBoundIndex) / 2);

            const valueAtCentralPoint = targetDataSet[centralPointIndex];

            if (valueToFind === valueAtCentralPoint) {
                return true; // Element successfully located.
            } else if (valueToFind < valueAtCentralPoint) {
                upperBoundIndex = centralPointIndex - 1; // Narrow search to the lower half.
            } else { // valueToFind > valueAtCentralPoint
                lowerBoundIndex = centralPointIndex + 1; // Narrow search to the upper half.
            }
        }
        return false; // Element was not found within the data set.
    };
})(primaryReferenceCollection); // The primary reference collection is passed to the IIFE.


// --- Result Aggregation Phase ---

// Helper function to convert boolean search results into a numeric indicator (1 for found, 0 for not found).
const convertBooleanToNumericFlag = (wasFound) => wasFound ? 1 : 0;

// Initialize a counter for the total number of found elements.
let accumulatedMatchCount = 0;

// Explicitly iterate through each element in the secondary query collection.
// This replaces the functional .map().reduce() chain from the original for a Type III structural change.
for (let currentItemIndex = 0; currentItemIndex < secondaryQueryCollection.length; currentItemIndex++) {
    const currentQueryElement = secondaryQueryCollection[currentItemIndex];

    // Utilize the optimized search function to check for presence.
    const isElementPresent = createOptimizedPresenceChecker(currentQueryElement);

    // Convert the boolean result to a numeric flag (1 or 0).
    const matchIndicator = convertBooleanToNumericFlag(isElementPresent);

    // Increment the total count if the element was found.
    accumulatedMatchCount += matchIndicator;
}

// Output the final tally of found elements to the console.
console.log(accumulatedMatchCount);