const processInputAndCompute = (rawInputContent) => {
    // This function takes raw string input, parses it, and performs a specific calculation.
    // It handles potential issues like invalid input format or division by zero.

    // Step 1: Validate the incoming data string.
    // Ensure the input is a non-empty string before attempting to process it.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Input data is either not a string or is empty. Cannot proceed with calculation.");
        return; // Exit the function gracefully.
    }

    // Helper function to safely convert string segments to numbers.
    // It also provides a warning for non-numeric parts.
    const parseNumericSegments = (textSegment) => {
        return textSegment.split(' ').map(part => {
            const numericalValue = Number(part);
            if (isNaN(numericalValue)) {
                // If a segment cannot be converted to a number, log a warning and treat it as zero.
                console.warn(`Warning: Found non-numeric segment '${part}'. Defaulting to 0 for calculation.`);
                return 0;
            }
            return numericalValue;
        });
    };

    // Step 2: Parse the raw input string into an array of numbers.
    const extractedNumericValues = parseNumericSegments(rawInputContent);

    // Step 3: Validate the number of extracted components.
    // The core logic requires at least three numerical values.
    const requiredValueCount = 3;
    if (extractedNumericValues.length < requiredValueCount) {
        console.error(`Error: Insufficient numerical values provided. Expected at least ${requiredValueCount}, but received ${extractedNumericValues.length}.`);
        return; // Terminate execution due to insufficient data.
    }

    // Step 4: Assign extracted values to descriptive variables.
    // This improves readability and makes the purpose of each number clear.
    const valueA = extractedNumericValues[0]; // The first number for comparison and potential divisor.
    const valueB = extractedNumericValues[1]; // The second number for comparison and potential dividend.
    const comparisonLimit = extractedNumericValues[2]; // The third number, used as a threshold.

    let intermediateCalculationResult; // Variable to store the outcome of the primary calculation.

    // Step 5: Perform the primary conditional calculation.
    // If 'valueA' is strictly greater than 'valueB', the result is zero.
    // Otherwise, calculate the ratio of 'valueB' to 'valueA', with a division-by-zero safeguard.
    if (valueA > valueB) {
        intermediateCalculationResult = 0;
    } else {
        // Implement a check to prevent division by zero, which would result in Infinity or NaN.
        if (valueA === 0) {
            console.warn("Warning: Attempted division by zero (valueA is 0). Setting ratio to 0 to prevent errors.");
            intermediateCalculationResult = 0;
        } else {
            intermediateCalculationResult = valueB / valueA;
        }
    }

    let finalOutputDecision; // Variable to hold the ultimate value to be displayed.

    // Step 6: Determine the final output based on the intermediate result and the comparison limit.
    // If the intermediate result meets or exceeds the comparison limit, the limit itself is the output.
    // Otherwise, the integer part of the intermediate result is used.
    if (intermediateCalculationResult >= comparisonLimit) {
        finalOutputDecision = comparisonLimit;
    } else {
        // Use Math.floor to get the integer part, ensuring consistency for positive numbers.
        // Math.trunc is also a good alternative here.
        finalOutputDecision = Math.floor(intermediateCalculationResult);
    }

    // Step 7: Display the computed final output to the console.
    console.log(finalOutputDecision);
};

// This block handles the application's entry point, reading input and invoking the processing logic.
try {
    // Dynamically import the 'fs' module for file system operations.
    const fileSystemUtilities = require('fs');
    const standardInputPath = '/dev/stdin'; // Standard path for console input in many environments.
    const textEncodingFormat = 'utf8'; // Specify the character encoding for reading the file.

    // Read all content from standard input synchronously.
    const receivedInputText = fileSystemUtilities.readFileSync(standardInputPath, textEncodingFormat);

    // Call the main processing function with the obtained input.
    processInputAndCompute(receivedInputText);

} catch (executionError) {
    // Catch and report any errors that occur during file reading or module loading.
    console.error("An unrecoverable error occurred during input acquisition or program execution:", executionError.message);
    // Optionally, log the full error stack for debugging purposes.
    // console.error(executionError.stack);
}