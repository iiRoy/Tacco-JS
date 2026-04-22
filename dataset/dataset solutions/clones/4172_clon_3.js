function processNumericalSequenceForEvenness(rawInputDataString) {
    // This function aims to determine the maximum number of times an entire
    // sequence of integers can be simultaneously divided by two,
    // where all numbers must remain even for each division step.

    // --- Type III: Input Validation and Robust Parsing ---
    // First, split the raw input string into individual lines.
    const linesFromInput = rawInputDataString.split('\n');

    // Guard clause: Ensure there are at least two lines in the input,
    // as the numbers are expected on the second line.
    if (linesFromInput.length < 2 || !linesFromInput[1]) {
        console.error("Input processing error: Insufficient or malformed input data. Expected at least two lines.");
        return -1; // Indicate an error state.
    }

    // Extract the second line, which should contain the space-separated numeric values.
    const numericValuesAsString = linesFromInput[1];

    // Convert the string representations of numbers into actual integer values.
    // Type II: Renamed variables and explicit type conversion using parseInt.
    let currentIntegerSet = numericValuesAsString.split(' ').map(strElement => {
        // Type III: Validate each element during parsing.
        const parsedValue = parseInt(strElement, 10);
        if (isNaN(parsedValue)) {
            console.error(`Input processing error: Detected a non-numeric element ('${strElement}') in the sequence.`);
            return NaN; // Propagate the error for a later check.
        }
        return parsedValue;
    });

    // Type III: Additional check after parsing to handle any NaN values resulting from invalid input.
    if (currentIntegerSet.some(val => isNaN(val))) {
        console.error("Processing aborted due to invalid numbers found in the input sequence.");
        return -1;
    }

    // --- Type II: Renamed Counter Variable ---
    // Initialize a counter to keep track of the successful division rounds.
    let successfulDivisionRounds = 0;

    // --- Type III: Rewritten Loop Condition and Logic ---
    // The original `every` method is replaced with a manual check and a boolean flag.
    let allNumbersAreCurrentlyEven = true;

    // Initial check to determine if the loop should even start.
    // If any number is odd, the loop should not execute.
    // This is equivalent to `!currentIntegerSet.some(num => num % 2 !== 0)`.
    for (const numberInSet of currentIntegerSet) {
        if (numberInSet % 2 !== 0) {
            allNumbersAreCurrentlyEven = false;
            break; // Exit early if an odd number is found.
        }
    }

    // Loop as long as all elements in the set are even.
    while (allNumbersAreCurrentlyEven) {
        // Increment the counter for this successful round of division.
        // Type II: Rephrased increment operation.
        successfulDivisionRounds = successfulDivisionRounds + 1;

        // Divide each number in the set by two.
        // Type II: Renamed variables within the map function.
        currentIntegerSet = currentIntegerSet.map(valueToDivide => valueToDivide / 2);

        // Type III: Re-evaluate the condition for the next iteration.
        // Reset the flag and check all numbers again.
        allNumbersAreCurrentlyEven = true; // Assume true until proven false.
        for (let idx = 0; idx < currentIntegerSet.length; idx++) {
            const checkedNumber = currentIntegerSet[idx];
            if (checkedNumber % 2 !== 0) {
                allNumbersAreCurrentlyEven = false;
                break; // Optimize by breaking as soon as an odd number is found.
            }
        }
    }

    // --- Type III: Enhanced Output and Return Value ---
    // Log the final result with a more descriptive message.
    console.log(`The provided numerical sequence could be fully divided by two a total of ${successfulDivisionRounds} times.`);

    // Return the final count, allowing the function's result to be used elsewhere.
    return successfulDivisionRounds;
}

// --- Type III: Encapsulated Execution Block with Robust Error Handling ---
// This immediately invoked function expression (IIFE) serves as the application's entry point.
(function applicationExecutionBootstrap() {
    // Type II: Renamed the 'fs' module variable.
    const fileSystemHandler = require('fs');
    // Type II: Renamed the input path variable.
    const standardInputDevicePath = '/dev/stdin';
    let contentFromInput = ''; // Variable to hold the input content.

    try {
        // Attempt to read the input from the standard input synchronously.
        contentFromInput = fileSystemHandler.readFileSync(standardInputDevicePath, 'utf8');
    } catch (readingError) {
        // Type III: Provide detailed error feedback if reading from stdin fails.
        console.error(`Critical Error: Failed to read data from standard input (${standardInputDevicePath}). Details: ${readingError.message}`);
        // Terminate the process with an error code to signal failure.
        process.exit(1);
    }

    // Invoke the main processing function with the obtained input content.
    // The function itself handles logging the result and potential internal errors.
    const finalResultOfAnalysis = processNumericalSequenceForEvenness(contentFromInput);

    // Type III: Optionally, handle the return value from the processing function.
    // If the function returned -1, it indicates an internal error occurred.
    if (finalResultOfAnalysis === -1) {
        process.exit(1);
    }
})();