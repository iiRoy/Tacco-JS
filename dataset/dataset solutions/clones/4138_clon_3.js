// This function orchestrates the processing of raw input data to derive a specific numerical result.
function processComputationalTask(rawInputContent) {
    // Split the entire input string into individual lines based on newline characters.
    const inputSegmentArray = rawInputContent.split("\n");

    // Helper function designed to safely convert a string value into a number.
    // It includes basic error handling for non-numeric inputs, providing a fallback value.
    const safelyParseNumericValue = (strValue, fallback = 0) => {
        const parsed = Number(strValue);
        // Check if the conversion resulted in 'Not-a-Number'.
        if (isNaN(parsed)) {
            // Log a warning for unexpected input, which can be useful for debugging.
            // In typical competitive programming, inputs are guaranteed to be valid.
            console.warn(`Warning: Encountered non-numeric input: '${strValue}'. Using fallback value: ${fallback}`);
            return fallback;
        }
        return parsed;
    };

    // Extract the numerical inputs directly from the first line of the input array.
    // The two numbers are expected to be separated by a space.
    // This approach directly accesses array elements after splitting,
    // avoiding the need for an explicit temporary variable to hold the split tokens.
    let initialValue = safelyParseNumericValue(inputSegmentArray[0].split(" ")[0]);
    let targetThreshold = safelyParseNumericValue(inputSegmentArray[0].split(" ")[1]);

    // --- Input Validation and Edge Case Handling (Added Type III fragments) ---
    // Critical validation: Ensure both initial and target values are positive.
    // Non-positive values could lead to infinite loops or undefined mathematical results.
    if (initialValue <= 0 || targetThreshold <= 0) {
        console.error("Error: Both initial and target values must be strictly positive integers for valid calculation.");
        // As a recovery mechanism for invalid input, we adjust values to prevent runtime errors.
        // The result might not be meaningful if the original input was fundamentally flawed.
        if (initialValue <= 0) initialValue = 1; // Default to 1 to avoid division/multiplication by zero/negative
        if (targetThreshold <= 0) targetThreshold = 1;
    }

    // Handle the specific edge case where the initial value already meets or exceeds the target.
    // In this scenario, no doubling operations are required beyond the initial state itself.
    if (initialValue >= targetThreshold) {
        // Output 1, signifying that only the first "step" (the initial value) is needed.
        console.log(1);
        return; // Terminate execution of the function early.
    }

    // --- Core Calculation Logic (Type III: Iterative rewrite of the original mathematical formula) ---
    // The original problem likely asks for 'x' where `initialValue * 2^(x-1) = targetThreshold`
    // or the equivalent count of steps. The original code used `Math.floor(Math.log2(targetThreshold / initialValue)) + 1`.
    // This iterative method achieves the identical result by counting how many times 'initialValue'
    // can be doubled without its product exceeding 'targetThreshold'.
    let currentWorkingValue = initialValue; // Represents the value after 'k' doublings.
    let countOfDoublings = 0; // This variable tracks 'k', the number of times we've doubled.

    // Loop condition: Continue doubling as long as the next doubled value
    // (currentWorkingValue * 2) does not strictly exceed the target threshold.
    while (currentWorkingValue * 2 <= targetThreshold) {
        currentWorkingValue *= 2; // Perform the doubling operation.
        countOfDoublings++;       // Increment the count of doublings.
    }

    // The final result, `x`, is the number of full doublings (`k`) plus one.
    // This accounts for the initial state as the first "step" (x=1 when k=0).
    const finalCalculatedIndex = countOfDoublings + 1;

    // Output the final computed index to standard output.
    console.log(finalCalculatedIndex);
}

// --- Standard Input/Output Handling (DO NOT MODIFY THIS SECTION) ---
// This boilerplate code is responsible for reading the entire content from standard input
// and then invoking our primary processing function with that content.
// It ensures that the script can run in typical competitive programming environments.
processComputationalTask(require("fs").readFileSync("/dev/stdin", "utf8"));