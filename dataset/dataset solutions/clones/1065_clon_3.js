const parseNumericValue = (textualInput, designation = 'value') => {
    const numericForm = Number(textualInput);
    if (isNaN(numericForm) || !Number.isFinite(numericForm)) {
        throw new Error(`Invalid numeric input for ${designation}: "${textualInput}"`);
    }
    return numericForm;
};

/**
 * Executes a counting sort algorithm to arrange elements within a specified range.
 *
 * @param {number[]} sourceElements - The array of numbers to be sorted.
 * @param {number[]} outputContainer - An array to store the sorted results. It will be resized and populated.
 * @param {number} maximumPermissibleValue - The largest possible value an element in sourceElements can hold.
 * @throws {Error} If input validation fails (e.g., non-numeric elements, out-of-range values).
 */
const performCountingSort = (sourceElements, outputContainer, maximumPermissibleValue) => {
    // Initial validation for the input array
    if (!Array.isArray(sourceElements) || sourceElements.length === 0) {
        console.warn("Input array is empty or not an array. Sorting operation will be skipped.");
        return;
    }

    // Validate the maximum value parameter
    if (typeof maximumPermissibleValue !== 'number' || maximumPermissibleValue < 0 || !Number.isInteger(maximumPermissibleValue)) {
        console.error("Invalid 'maximumPermissibleValue' provided. It must be a non-negative integer.");
        throw new Error("Invalid maximum permissible value.");
    }

    // Initialize an auxiliary array to store frequency counts.
    // This array will hold tallies for each number from 0 up to 'maximumPermissibleValue'.
    const frequencyTallies = Array.from({ length: maximumPermissibleValue + 1 }, () => 0);

    // Phase 1: Populate the frequencyTallies array.
    // Iterate through each element in the source array and increment its corresponding tally.
    for (let currentElementIndex = 0; currentElementIndex < sourceElements.length; currentElementIndex++) {
        const elementValue = sourceElements[currentElementIndex];

        // Validate each element's value against the defined range.
        if (typeof elementValue !== 'number' || !Number.isInteger(elementValue) || elementValue < 0 || elementValue > maximumPermissibleValue) {
            console.error(`Element at position ${currentElementIndex} (value: ${elementValue}) is outside the expected non-negative integer range [0, ${maximumPermissibleValue}].`);
            throw new Error("Input element out of specified range or not an integer.");
        }
        frequencyTallies[elementValue]++;
    }

    // Phase 2: Transform frequencyTallies into cumulative counts (prefix sums).
    // Each position now indicates the final sorted position of the last occurrence of its value.
    for (let countIndex = 1; countIndex <= maximumPermissibleValue; countIndex++) {
        frequencyTallies[countIndex] += frequencyTallies[countIndex - 1];
    }

    // Ensure the output container has the correct size for the sorted elements.
    // This explicit resizing is a Type III change for robustness.
    outputContainer.length = sourceElements.length;

    // Phase 3: Place elements into the outputContainer in their sorted positions.
    // Iterate backwards through the source array to ensure stable sorting (maintain relative order of equal elements).
    for (let reverseScanIndex = sourceElements.length - 1; reverseScanIndex >= 0; reverseScanIndex--) {
        const itemToPlace = sourceElements[reverseScanIndex];
        // Determine the correct sorted position using the cumulative counts.
        const targetOutputPosition = frequencyTallies[itemToPlace] - 1;

        outputContainer[targetOutputPosition] = itemToPlace;
        // Decrement the tally for the current item's value to correctly place subsequent identical items.
        frequencyTallies[itemToPlace]--;
    }
};

// Main execution block to handle input/output and orchestrate the sorting process.
try {
    // Read all raw input data from standard input.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Split the entire input into individual lines for processing.
    const contentLines = rawInputContent.split('\n');

    // Extract the line containing the maximum value (k) for the sort.
    const maxValLine = contentLines.shift();
    if (!maxValLine) {
        throw new Error("Input data missing the maximum value line.");
    }
    const maxSortValue = parseNumericValue(maxValLine, 'maximum sort value');

    // Extract and parse the array of elements to be sorted (A).
    const elementsDataLine = contentLines.shift();
    if (!elementsDataLine) {
        throw new Error("Input data missing the array of elements line.");
    }
    const elementsForSorting = elementsDataLine.split(' ').map(strVal => parseNumericValue(strVal, 'array element'));

    // Initialize an empty array that will receive the sorted elements.
    const finalSortedElements = [];

    // Invoke the custom counting sort function.
    performCountingSort(elementsForSorting, finalSortedElements, maxSortValue);

    // Output the sorted elements, joined by spaces, to standard output.
    console.log(finalSortedElements.join(' '));

} catch (executionError) {
    // Catch and report any errors that occur during input processing or sorting.
    console.error("An operational error occurred:", executionError.message);
    // Exit with a non-zero status code to indicate failure.
    process.exit(1);
}