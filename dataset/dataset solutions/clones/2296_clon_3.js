function processInputQuantities(inputPayload) {
    // Validate the incoming data to ensure it's a non-empty string.
    if (typeof inputPayload !== 'string' || inputPayload.trim() === '') {
        console.error("Input data is either missing or not a string. Processing halted.");
        return;
    }

    // Divide the entire input string into individual lines based on newline characters.
    const dataLines = inputPayload.split('\n');

    // Confirm that the first line, which should contain our numerical values, is present and not empty.
    if (dataLines.length === 0 || dataLines[0].trim() === '') {
        console.error("The essential first line of data is absent or empty. Cannot proceed.");
        return;
    }

    // Utility function to convert a string to a number safely.
    // If conversion fails (e.g., input is not a number), it defaults to zero.
    const convertToNumberOrZero = (strValue) => {
        const parsedValue = Number(strValue);
        return isNaN(parsedValue) ? 0 : parsedValue;
    };

    // Extract the space-separated numerical components from the very first line of input.
    const numericalComponents = dataLines[0].split(' ');

    // Assign the parsed numerical values to clearly named variables.
    // 'a' is now 'initialPrimaryResource', 'b' is 'initialSecondaryResource', 'k' is 'requiredDeduction'.
    const initialPrimaryResource = convertToNumberOrZero(numericalComponents[0]);
    const initialSecondaryResource = convertToNumberOrZero(numericalComponents[1]);
    const requiredDeduction = convertToNumberOrZero(numericalComponents[2]);

    // Initialize working variables for the remaining resources.
    let finalPrimaryResult = initialPrimaryResource;
    let finalSecondaryResult = initialSecondaryResource;
    let outstandingDeduction = requiredDeduction;

    // --- Elaborated Resource Depletion Logic ---
    // The original compact ternary expression is expanded into a more explicit
    // if-else structure for better clarity and demonstration of code alteration.

    // Attempt to satisfy the deduction requirement from the primary resource first.
    if (finalPrimaryResult >= outstandingDeduction) {
        // If the primary resource is sufficient, subtract the full deduction from it.
        finalPrimaryResult -= outstandingDeduction;
        // The secondary resource remains entirely untouched in this scenario.
    } else {
        // If the primary resource is insufficient, it is completely consumed.
        // Calculate the remaining deduction amount that still needs to be covered.
        outstandingDeduction -= finalPrimaryResult;
        finalPrimaryResult = 0; // Primary resource is now fully depleted.

        // Now, attempt to satisfy the remaining deduction from the secondary resource.
        if (finalSecondaryResult >= outstandingDeduction) {
            // If the secondary resource can cover the remaining deduction.
            finalSecondaryResult -= outstandingDeduction;
        } else {
            // If the secondary resource is also insufficient, it is fully consumed.
            finalSecondaryResult = 0; // Secondary resource is now fully depleted.
        }
    }

    // Construct an array to hold the final calculated resource quantities.
    const computedFinalQuantities = [finalPrimaryResult, finalSecondaryResult];

    // Output the final results. The output format is altered from the original
    // to use a space-separated string instead of a comma-separated tuple.
    console.log(computedFinalQuantities.join(' '));
}

// This block manages the execution flow, particularly for reading input
// from the standard input stream (e.g., from a file in a typical competitive programming setup).
// It also incorporates robust error handling for input/output operations.
try {
    // Utilize Node.js's built-in file system module to synchronously read data.
    // This is typically for environments like `/dev/stdin` for standard input.
    const fileSystemContent = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Invoke our main processing function with the content read from the file.
    processInputQuantities(fileSystemContent);
} catch (operationError) {
    // Catch and report any errors that occur during the file reading or initial setup.
    console.error("An operational error occurred during input acquisition or program initialization:", operationError.message);
    // For more detailed debugging, the stack trace could also be logged:
    // console.error(operationError.stack);
}