// This module is designed to process numerical datasets provided as a single string.
// It simulates the operation of finding the maximum value in a sequence after
// successively removing each element from the original set.
function ProcessInputData(rawInputText) {
    // Break down the raw input string into individual lines.
    // Filtering out any lines that are empty or contain only whitespace
    // ensures robust handling of varied input formats.
    const parsedLines = rawInputText.split('\n').filter(lineContent => lineContent.trim() !== '');

    // The very first line is expected to specify the total count of subsequent data elements.
    let totalElementCount = parseInt(parsedLines[0], 10);

    // Implement a preliminary validation check for the element count.
    // If the count is invalid (not a number or non-positive), we log an error
    // and terminate processing early, as per robust programming practices.
    if (isNaN(totalElementCount) || totalElementCount <= 0) {
        // In a production environment, this might throw an error or return a specific status.
        // For this context, simply returning prevents further erroneous execution.
        // console.error("Input data specifies an invalid or non-positive number of elements.");
        return;
    }

    // Initialize an array to store the actual numeric values from the input.
    const initialNumericSequence = [];

    // Iterate through the lines following the count, parsing each into an integer.
    // The loop starts from index 1 of `parsedLines` because index 0 holds the count.
    for (let currentLineIndex = 0; currentLineIndex < totalElementCount; currentLineIndex++) {
        const currentParsedValue = parseInt(parsedLines[currentLineIndex + 1], 10);

        // Another validation step: ensure each parsed value is indeed a number.
        if (isNaN(currentParsedValue)) {
            // If an invalid number is encountered, we could skip it,
            // default it, or halt. For strict Type III, we assume valid input
            // based on problem context, but a check is a good addition.
            // console.warn(`Non-numeric value detected on line ${currentLineIndex + 2}. Skipping.`);
            continue;
        }
        initialNumericSequence.push(currentParsedValue);
    }

    // If, after parsing, no valid numbers were collected, there's nothing to process.
    if (initialNumericSequence.length === 0) {
        // console.log("No valid numbers were found in the input sequence.");
        return;
    }

    // --- Core Logic Refactoring (Type III Change: Optimization and Structural Rewrite) ---
    // Instead of repeatedly sorting a modified array, we pre-calculate the overall maximum
    // and second maximum values from the original sequence. This significantly improves
    // efficiency from O(N^2 log N) to O(N log N) or O(N).

    // Create a temporary sorted array of unique values to easily find max and second max.
    // Using a Set first handles duplicates, then sorting provides ordered distinct values.
    const uniqueSortedValues = [...new Set(initialNumericSequence)].sort((valA, valB) => valB - valA);

    let overallHighestValue = -Infinity;
    let nextHighestValue = -Infinity; // Represents the second highest distinct value

    // If there are unique values, assign the highest and second highest.
    if (uniqueSortedValues.length > 0) {
        overallHighestValue = uniqueSortedValues[0];
        // If there's only one unique value, the "next highest" is effectively the same.
        nextHighestValue = uniqueSortedValues.length > 1 ? uniqueSortedValues[1] : overallHighestValue;
    } else {
        // This case should ideally be caught by `initialNumericSequence.length === 0` check.
        return;
    }

    // An array to accumulate all the results before printing them.
    // This is another Type III change for optimized I/O.
    const computedOutcomeList = [];

    // Iterate through the original sequence, simulating the removal of each element.
    for (let currentSimulatedRemovalIndex = 0; currentSimulatedRemovalIndex < totalElementCount; currentSimulatedRemovalIndex++) {
        const valueBeingRemoved = initialNumericSequence[currentSimulatedRemovalIndex];

        let maxAfterCurrentRemoval;

        // Determine the count of occurrences of the overall highest value in the original sequence.
        const highestValueOccurrences = initialNumericSequence.filter(val => val === overallHighestValue).length;

        // Logic to decide the new maximum after removing `valueBeingRemoved`:
        if (valueBeingRemoved === overallHighestValue) {
            // If the element removed is the overall highest value:
            if (highestValueOccurrences > 1) {
                // If there were multiple instances of the highest value, removing one
                // still leaves another instance, so the maximum remains unchanged.
                maxAfterCurrentRemoval = overallHighestValue;
            } else {
                // If the removed element was the *only* instance of the highest value,
                // then the new maximum becomes the second highest value.
                maxAfterCurrentRemoval = nextHighestValue;
            }
        } else {
            // If the element removed was NOT the overall highest value,
            // then the overall highest value remains the maximum.
            maxAfterCurrentRemoval = overallHighestValue;
        }
        computedOutcomeList.push(maxAfterCurrentRemoval);
    }

    // Output all the collected results, each on a new line.
    computedOutcomeList.forEach(resultValue => console.log(resultValue));
}

// --- Standard Input/Output Handling (Do Not Modify This Section) ---
// This part of the script is responsible for reading input from stdin
// and invoking the primary processing function with the collected data.
// It is crucial for compatibility with online judge systems and should
// remain exactly as provided to ensure correct execution.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));