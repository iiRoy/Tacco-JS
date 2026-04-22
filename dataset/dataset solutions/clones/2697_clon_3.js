function evaluateSequenceConformance(incomingTextualData) {
    // Deconstruct the input string into individual data lines.
    // This assumes a standard structure where lines are separated by newline characters.
    const parsedDataLines = incomingTextualData.split('\n');

    // The core numeric sequence is expected on the second line of input (index 1).
    // Extract this specific line for further processing.
    const numericSequenceString = parsedDataLines[1];

    // --- Type III: Addition - Input validation and early exit for edge cases ---
    // If the numeric sequence line is absent or empty, it implies an already sorted (or trivially sortable) state.
    if (!numericSequenceString || numericSequenceString.trim().length === 0) {
        console.log("YES"); // Nothing to sort, so it's considered sorted.
        return; // Terminate execution early.
    }

    // Transform the space-separated string of numbers into an array of numeric values.
    // Using `const` for variables that are not intended for re-assignment.
    const rawNumberArray = numericSequenceString.split(' ').map(Number);

    // --- Type III: Deletion - Removal of unused variable from original logic ---
    // The original code used `input[0]` as `N`, but its actual usage was primarily
    // for loop bounds, which can be derived directly from the array length.
    // We will use `rawNumberArray.length` instead of a separate `N` variable.
    const sequenceLength = rawNumberArray.length;

    // --- Type III: Addition - Another early exit for small sequences ---
    // Any sequence containing zero or one element is, by definition, already sorted.
    if (sequenceLength <= 1) {
        console.log("YES"); // Trivial case: already sorted.
        return; // Exit early.
    }

    // Create a distinct, modifiable copy of the original number array.
    // This copy will be sorted, allowing comparison with the original.
    // Using the spread syntax (`...`) for an efficient array copy.
    let sortedNumberCopy = [...rawNumberArray];

    // Sort the copied array in ascending numerical order.
    // A custom comparison function `(a, b) => a - b` is essential for numeric sorting.
    sortedNumberCopy.sort((valA, valB) => valA - valB);

    // Initialize a counter to record the number of positions where
    // the original sequence deviates from its sorted counterpart.
    let positionalDiscrepancyCount = 0;

    // Iterate through both the original and sorted arrays, comparing elements at each index.
    // Using `let` for the loop index, as it's block-scoped.
    for (let currentElementIndex = 0; currentElementIndex < sequenceLength; currentElementIndex++) {
        // If the element at the current index in the original array does not match
        // the element at the same index in the sorted array, increment the counter.
        if (rawNumberArray[currentElementIndex] !== sortedNumberCopy[currentElementIndex]) {
            positionalDiscrepancyCount++;
        }
    }

    // --- Type III: Update - Rewrite of conditional logic from ternary to if/else ---
    // Based on the count of discrepancies, determine if the sequence is "almost sorted".
    // A sequence is considered "YES" if it requires at most two elements to be out of place
    // (implying it could be sorted with 0, 1, or 2 swaps in specific scenarios).
    let finalDeterminationMessage;
    if (positionalDiscrepancyCount <= 2) {
        finalDeterminationMessage = "YES"; // The sequence is sorted or nearly sorted.
    } else {
        finalDeterminationMessage = "NO";  // Too many elements are out of their sorted positions.
    }

    // Output the final YES/NO decision to the standard output stream.
    console.log(finalDeterminationMessage);
}

// Execute the sequence evaluation process.
// This typically involves reading all input from standard input in competitive programming contexts.
evaluateSequenceConformance(require("fs").readFileSync("/dev/stdin", "utf8"));