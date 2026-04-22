// This function processes multi-line string input to derive a final computed value.
function processInputData(rawData) {
    // Basic validation for input structure.
    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Error: Provided input data is either not a string or is empty.");
        return; // Early exit for invalid input
    }

    const inputLines = rawData.split('\n');
    // Ensure there's at least a second line (index 1) to process, as per the original logic.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient data lines provided in the input string.");
        return;
    }

    // Extract the significant line (second line) and parse its numeric components.
    // Using map(Number) for a concise way to convert string elements to numbers.
    // A filter is added to ensure only valid numbers are processed, skipping potential empty strings from split.
    let numericElements = inputLines[1].split(' ').filter(s => s.trim() !== '').map(strVal => {
        const numVal = Number(strVal);
        // Basic validation for numeric content. If a value isn't a number,
        // it's treated as 0 to allow the process to continue, mimicking parseInt's behavior
        // for non-leading numeric strings (e.g., "123abc" -> 123 in parseInt, but NaN in Number()).
        // For competitive programming, inputs are generally clean, so Number() is usually sufficient.
        if (isNaN(numVal)) {
            console.warn(`Warning: Non-numeric value encountered: '${strVal}'. Treating as 0.`);
            return 0;
        }
        return numVal;
    });

    // If, after parsing, there aren't enough elements to start the reduction process,
    // or if the initial line was empty.
    if (numericElements.length < 3) {
        // If there are 0-2 elements, the loop won't run, and we'd directly sum if 2, or error/return if less.
        // The original code implicitly handles this by the while loop condition.
        // For robustness, we can add an explicit check if the initial list is too short to begin.
        if (numericElements.length === 0) {
            console.error("Error: No numeric data found on the second line.");
            return;
        } else if (numericElements.length === 1) {
            console.error("Error: Only one numeric element found. Cannot perform required operations.");
            return;
        }
        // If length is 2, it bypasses the loop and directly sums, which is correct.
    }

    // A constant defining the desired final array length.
    const DESIRED_ELEMENT_COUNT = 2;

    // Iteratively reduce the sequence of numbers until only two elements remain.
    // This process involves taking the first three elements, performing specific sums,
    // and then replacing the three with the two new sums at the front of the array.
    while (numericElements.length > DESIRED_ELEMENT_COUNT) {
        // Extract the first three elements from the front of the array.
        // Using `shift()` modifies the array by removing elements from the beginning.
        const initialLeadingValue = numericElements.shift();    // Corresponds to 'mae' in original logic
        const pivotIntermediateValue = numericElements.shift(); // Corresponds to 'naka' in original logic
        const trailingValue = numericElements.shift();          // Corresponds to 'ato' in original logic

        // Compute the two new values based on the reduction pattern.
        const sumForNewLeft = initialLeadingValue + pivotIntermediateValue;
        const sumForNewRight = trailingValue + pivotIntermediateValue;

        // Reconstruct the sequence by adding the newly computed sums to the beginning.
        // `unshift()` adds elements to the front of an array.
        // Note the order: add the right-derived sum first, then the left-derived sum
        // to maintain their relative positions (left-derived will be at index 0).
        numericElements.unshift(sumForNewRight);
        numericElements.unshift(sumForNewLeft);
    }

    // After the reduction loop concludes, the array `numericElements` will contain exactly two values.
    // Calculate the final aggregate sum from these two remaining elements.
    const ultimateComputedSum = numericElements[0] + numericElements[1];

    // Output the final result using a dedicated helper function for consistency.
    emitFinalResult(ultimateComputedSum);
}

// Helper function responsible for logging the final computed value to the console.
function emitFinalResult(valueToOutput) {
    console.log(valueToOutput);
}

// Do not modify the following section. It manages standard input/output.
// This part ensures the 'processInputData' function receives data from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));