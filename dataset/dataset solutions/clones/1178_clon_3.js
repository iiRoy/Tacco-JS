// This module is designed to compute the standard deviation for multiple sets of numerical data.
// It reads input from standard input, processes it, and outputs the calculated standard deviation.
//
// Input Data Format:
// Each test case consists of two consecutive lines:
// 1. The first line provides an integer N, representing the quantity of numerical values in the set.
// 2. The second line contains N space-separated floating-point numbers.
// The program terminates its operation when an input line specifies N as 0.

function processData(rawDataString) {
    // Divide the entire raw input string into an array of individual lines,
    // using the newline character as a delimiter.
    const dataLinesArray = rawDataString.split('\n');
    const totalInputLines = dataLinesArray.length; // Store total number of lines for boundary checks.

    // Iterate through the array of lines, advancing by two lines at each step
    // to process each pair (count line + numbers line) as a single test case.
    // 'currentLineIndex' acts as the pointer to the start of each test case (the count line).
    for (let currentLineIndex = 0; currentLineIndex < totalInputLines; currentLineIndex += 2) {

        // Extract and clean the line that specifies the count of numbers.
        const countString = dataLinesArray[currentLineIndex]?.trim();

        // Attempt to convert the count string into an integer.
        // Using parseInt with radix 10 for explicit base.
        const numberOfElements = parseInt(countString, 10);

        // --- Termination Condition (Type III: rewritten for clarity) ---
        // If the parsed count is 0, it signals the end of input data.
        if (numberOfElements === 0) {
            break; // Exit the processing loop.
        }

        // --- Input Validation (Type III: added guard clauses/validations) ---
        // Check for invalid or malformed count values, or if a subsequent data line is missing.
        if (isNaN(numberOfElements) || numberOfElements < 0 || currentLineIndex + 1 >= totalInputLines) {
            console.error(`Error: Invalid element count '${countString}' or missing data line at offset ${currentLineIndex}. Skipping this entry.`);
            continue; // Skip the current invalid test case and proceed to the next potential one.
        }

        // Retrieve the line containing the space-separated numbers for the current test case.
        const numbersString = dataLinesArray[currentLineIndex + 1];

        // Split the numbers string by spaces and filter out any empty strings
        // that might result from multiple spaces or leading/trailing spaces.
        const numberTokenStrings = numbersString.split(' ').filter(token => token.trim() !== '');

        // --- Further Validation (Type III: added validation) ---
        // Verify that the actual number of parsed tokens matches the declared count.
        if (numberTokenStrings.length !== numberOfElements) {
            console.error(`Warning: Mismatch in element count at offset ${currentLineIndex}. Declared: ${numberOfElements}, Found: ${numberTokenStrings.length}. Proceeding with found elements.`);
            // In this case, we might choose to proceed with `numberTokenStrings.length` or skip.
            // For closer adherence to original behavior, we'll use `numberOfElements` for calculations,
            // assuming the original input guarantees `numberTokenStrings.length` == `numberOfElements`.
            // However, a robust solution would adjust `numberOfElements` here or skip.
            // For the purpose of Type III, logging and continuing is a valid addition.
        }

        // Convert the array of number strings into an array of actual floating-point numbers.
        const numericalValues = numberTokenStrings.map(parseFloat);

        // Calculate the sum of all numerical values in the current set.
        // The `reduce` method is used to accumulate the sum, starting from 0.
        const totalSumOfValues = numericalValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // Determine the arithmetic mean (average) of the numerical set.
        // This is an intermediate step (Type III addition).
        const arithmeticMean = totalSumOfValues / numberOfElements;

        // Initialize a variable to accumulate the sum of squared differences from the mean.
        let sumOfSquaredDeviations = 0.0;

        // Iterate through each number to calculate its squared difference from the mean.
        // The loop explicitly uses 'elementIndex' to access each value.
        for (let elementIndex = 0; elementIndex < numberOfElements; elementIndex++) {
            const currentNumber = numericalValues[elementIndex];
            const deviation = currentNumber - arithmeticMean; // Calculate the difference from the mean.
            sumOfSquaredDeviations += Math.pow(deviation, 2); // Add the square of the difference to the sum.
        }

        // Calculate the variance, which is the average of the squared deviations.
        // This is an intermediate variable (Type III addition).
        const calculatedVariance = sumOfSquaredDeviations / numberOfElements;

        // The standard deviation is the square root of the variance.
        // This is the final calculated result (Type III: renamed and clarified).
        const finalStandardDeviation = Math.sqrt(calculatedVariance);

        // --- Output Generation (Type III: removed redundant 'output' string) ---
        // Format the standard deviation to exactly four decimal places and print it to console.
        // `toFixed(4)` returns a string representation.
        console.log(finalStandardDeviation.toFixed(4));
    }
}

// Entry point for the script:
// Reads the entire content of standard input as a UTF-8 string,
// then passes this string to the 'processData' function for computation.
// This setup is typical for competitive programming environments in Node.js.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));