function processData(rawDataInput) {
    // This function processes raw string input to calculate a specific sum based on numerical properties.

    // --- Input Validation and Parsing (Type III: Additions/Updates) ---

    // 1. Basic validation for the overall input string.
    //    Ensures that input is a valid string and not empty, preventing runtime errors.
    if (typeof rawDataInput !== 'string' || rawDataInput.trim().length === 0) {
        console.error("Input data is either invalid (not a string) or empty.");
        // In case of invalid input, output default values as per problem constraints
        // or a common practice in competitive programming for such scenarios.
        console.log(0); // Count of negative numbers
        console.log(0); // Final calculated sum
        return; // Terminate execution gracefully
    }

    // Split the raw input into individual lines for easier processing.
    const inputLines = rawDataInput.split("\n");

    // 2. Validate the number of lines received.
    //    We expect at least two lines: one for the count 'N', and one for the array elements.
    if (inputLines.length < 2) {
        console.error("Input format error: Expected at least two lines (N and array elements).");
        console.log(0);
        console.log(0);
        return;
    }

    // 3. Parse the designated number of elements from the first line.
    //    Using `Number()` is a modern and often more flexible alternative to `parseInt()`.
    const designatedElementCount = Number(inputLines[0]);

    // 4. Validate the parsed element count.
    //    It must be a valid non-negative number.
    if (isNaN(designatedElementCount) || designatedElementCount < 0) {
        console.error("Invalid element count specified on the first line.");
        console.log(0);
        console.log(0);
        return;
    }

    // 5. Process the second line to get an array of numbers.
    //    `split(" ")` separates space-delimited strings, and `map(Number)` converts each to a number.
    //    This directly creates an array of numerical values, handling potential `NaN` for non-numeric strings.
    const numberSequence = inputLines[1].split(" ").map(elementString => Number(elementString));

    // --- Initialization of Accumulators (Type II: Renaming, Type III: Updates) ---

    // Renamed `sum` to `totalAbsoluteSum` for clarity.
    let totalAbsoluteSum = 0;
    // Renamed `count` to `negativeNumbersEncountered`.
    let negativeNumbersEncountered = 0;
    // Renamed `min` to `smallestAbsoluteValue`.
    // Initialized with `Infinity` for robustness, rather than a magic large number.
    let smallestAbsoluteValue = Infinity;

    // --- Pre-loop Validation (Type III: Addition) ---

    // Check for edge cases where the array might be empty or the count is zero.
    if (numberSequence.length === 0 || designatedElementCount === 0) {
        console.log(0); // Negative count
        console.log(0); // Final sum
        return;
    }

    // --- Main Processing Loop (Type II: Renaming, Type III: Updates/Additions) ---

    // 6. Determine the effective number of iterations.
    //    This handles cases where the 'N' from the first line might not match
    //    the actual number of elements provided on the second line.
    const actualIterationLimit = Math.min(designatedElementCount, numberSequence.length);

    // Iterate through the numerical sequence using a traditional for loop for explicit index control.
    for (let currentElementIndex = 0; currentElementIndex < actualIterationLimit; currentElementIndex++) {
        // Introduce a helper variable for the current value being processed.
        const currentNumericalValue = numberSequence[currentElementIndex];

        // Calculate the absolute value of the current number.
        // `Math.abs(NaN)` results in `NaN`, which will propagate correctly in sum and min.
        const currentAbsoluteValue = Math.abs(currentNumericalValue);

        // Check if the current value is negative, but only if it's a valid number.
        // This prevents `NaN` from affecting the negative count.
        if (!isNaN(currentNumericalValue) && currentNumericalValue < 0) {
            negativeNumbersEncountered++;
        }

        // Update the smallest absolute value encountered so far.
        // Using `Math.min()` is a concise and readable way to achieve this.
        smallestAbsoluteValue = Math.min(smallestAbsoluteValue, currentAbsoluteValue);

        // Add the absolute value to the running total.
        // If `currentAbsoluteValue` is `NaN`, `totalAbsoluteSum` will become `NaN` and propagate.
        totalAbsoluteSum += currentAbsoluteValue;
    }

    // --- Output Results (Type II: Renaming, Type III: Updates) ---

    // Output the total count of negative numbers found.
    console.log(negativeNumbersEncountered);

    // Determine if the count of negative numbers is even or odd.
    const isNegativeCountEven = (negativeNumbersEncountered % 2 === 0);

    if (isNegativeCountEven) {
        // If the count of negative numbers is even, output the sum of all absolute values.
        console.log(totalAbsoluteSum);
    } else {
        // If the count is odd, subtract the smallest absolute value from the total sum.
        // Add a check for `smallestAbsoluteValue` being `Infinity` (no valid numbers processed)
        // or `NaN` (due to propagation from invalid input). In such cases,
        // simply output the `totalAbsoluteSum` (which would likely be 0 or `NaN`).
        if (smallestAbsoluteValue === Infinity || isNaN(smallestAbsoluteValue)) {
            console.log(totalAbsoluteSum);
        } else {
            console.log(totalAbsoluteSum - smallestAbsoluteValue);
        }
    }
}

// --- Standard Input Handling (Remains mostly unchanged as it's environment-specific boilerplate) ---
// This line reads input from standard input (/dev/stdin) and passes it to the `processData` function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));