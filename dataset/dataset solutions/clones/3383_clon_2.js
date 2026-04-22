// This function serves as the primary entry point for processing the input stream.
function ProcessInput(rawInputContent) {
    // First, we take the raw string input, split it by newlines,
    // and then convert each resulting string segment into a numerical value.
    // The .trim() operation is handled by the caller, ensuring clean data.
    let numericDataElements = rawInputContent.split("\n").map(Number);

    // It's a common pattern in competitive programming to discard the first element,
    // as it often represents a count or a constraint already handled implicitly.
    numericDataElements.shift();

    // We then proceed to compute a preliminary sum of all numbers within our processed array.
    var computedValue = calculateArraySum(numericDataElements);

    // A specific logical check: if the initial computed sum equals the total count
    // of elements remaining in the array after the shift operation.
    if (computedValue === numericDataElements.length) {
        // Should this condition hold true, the computed value is reset to a specific integer.
        computedValue = 1;
    }

    // Following this, a secondary calculation is performed: summing only those elements
    // that are not equal to the integer '1'. The parity of this sum is then evaluated.
    if ((sumNonOneElements(numericDataElements) % 2) === 1) {
        // If the secondary sum's parity is odd, the computed value is once again set to '1'.
        computedValue = 1;
    }

    // The final decision logic hinges on the parity of the 'computedValue'.
    // This determines which player's turn or outcome is declared.
    if ((computedValue % 2) === 1) {
        // If the computed value is odd, the 'first' outcome is displayed.
        console.log("first");
    } else {
        // Otherwise (if even), the 'second' outcome is displayed.
        console.log("second");
    }
}

// A helper utility function designed to sum all numeric values within a provided array.
function calculateArraySum(dataCollection) {
    var totalAccumulator = 0; // Initialize a variable to accumulate the sum.

    // Iterate through each element of the data collection.
    for (
        let currentIndex = 0, collectionLength = dataCollection.length;
        currentIndex < collectionLength;
        ++currentIndex
    ) {
        totalAccumulator += dataCollection[currentIndex]; // Add the current element's value to the accumulator.
    }

    return totalAccumulator; // Return the grand total.
}

// Another auxiliary function; this one calculates a sum, but specifically excludes
// any elements that have a value of '1'.
function sumNonOneElements(dataCollection) {
    var nonOneSum = 0; // Initialize a variable to store the sum of non-'1' elements.

    // Traverse the entire data collection.
    for (
        let currentElementIndex = 0, collectionSize = dataCollection.length;
        currentElementIndex < collectionSize;
        ++currentElementIndex
    ) {
        // Conditional check: only add to the sum if the element is not equal to 1.
        if (dataCollection[currentElementIndex] !== 1) {
            nonOneSum += dataCollection[currentElementIndex];
        }
    }

    return nonOneSum; // Deliver the sum of all elements not equal to one.
}

// The execution begins here: reading data from standard input,
// trimming any extraneous whitespace, and passing it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());