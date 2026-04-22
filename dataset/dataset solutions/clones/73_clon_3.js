/**
 * Executes a numerical sorting operation on a provided array of integers.
 * This function applies a custom comparison logic to arrange elements from largest to smallest.
 *
 * @param {Array<number>} initialNumericalSet - The array of numbers to be sorted.
 * @returns {Array<number>} A new array containing the sorted numbers in descending order.
 */
const processNumericalDataset = (initialNumericalSet) => {
    // Ensure the input is indeed an array and not null or undefined.
    if (!Array.isArray(initialNumericalSet)) {
        console.error("Error: The provided input is not a valid array type. Please supply an array of numbers.");
        return [];
    }

    // Check if the array is empty. Sorting an empty array is a no-op but worth noting.
    if (initialNumericalSet.length === 0) {
        console.warn("Warning: An empty array was provided for sorting. No operation will be performed.");
        return [];
    }

    // Create a shallow copy of the original array. This ensures that the original
    // array (if passed by reference) remains unaltered by the sort operation,
    // which is an in-place modification.
    const workingDatasetCopy = Array.from(initialNumericalSet);

    // This helper function provides the comparison logic required by Array.prototype.sort().
    // It determines the order of two elements (elementA, elementB).
    // For descending order:
    // - If elementB is greater than elementA, return a positive value (elementB comes first).
    // - If elementA is greater than elementB, return a negative value (elementA comes first).
    // - If they are equal, return 0.
    const compareForDescendingOrder = (elementA, elementB) => {
        let comparisonResult = 0;

        if (elementB > elementA) {
            comparisonResult = 1;
        } else if (elementB < elementA) {
            comparisonResult = -1;
        }

        return comparisonResult;
    };

    // Apply the custom comparison function to sort the copied dataset.
    // The .sort() method modifies the array in place, hence the need for a copy.
    workingDatasetCopy.sort(compareForDescendingOrder);

    // The sorted array is now ready to be returned.
    return workingDatasetCopy;
};

// Define our initial set of numerical values using a 'const' declaration.
const rawInputValues = [40, 100, 1, 5, 25, 10, 77, 3, 99];

// Output the state of the data before processing.
console.log("--- Data Processing Report ---");
console.log("Initial unsorted collection:", JSON.stringify(rawInputValues, null, 2));

// Call the main processing function to get the sorted results.
const finalSortedOutput = processNumericalDataset(rawInputValues);

// Display the results of the sorting operation.
console.log("\nResulting sorted collection (descending):", JSON.stringify(finalSortedOutput, null, 2));
console.log("--- End of Report ---");