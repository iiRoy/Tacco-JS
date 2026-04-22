function ProcessInputData(sourceDataString) {
    // This routine processes a string input containing multiple numerical values
    // to determine the smallest sum among specific pairs.

    // Validate the input string before proceeding. This is a Type III addition.
    if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Error: Provided input data is invalid or empty.");
        return; // Exit early if input is not suitable.
    }

    // Split the raw string into individual components.
    // Using a more robust regex split and filtering out empty strings.
    const numericalComponents = sourceDataString.split(/\s+/).filter(Boolean);

    // Ensure we have at least three numerical components to work with. Type III validation.
    if (numericalComponents.length < 3) {
        console.error("Error: Insufficient number of values provided. Expected at least three.");
        return;
    }

    // Parse the first three components into numbers.
    // Using `Number()` constructor for parsing, a Type II change from `parseInt()`.
    const valueAlpha = Number(numericalComponents[0]);
    const valueBeta = Number(numericalComponents[1]);
    const valueGamma = Number(numericalComponents[2]);

    // Perform validation on the parsed numbers. Type III addition.
    if (isNaN(valueAlpha) || isNaN(valueBeta) || isNaN(valueGamma)) {
        console.error("Error: One or more input values could not be converted to valid numbers.");
        return;
    }

    // Calculate the three required sums. Renamed variables as Type II change.
    const totalAB = valueAlpha + valueBeta;
    const totalBC = valueBeta + valueGamma;
    const totalCA = valueGamma + valueAlpha;

    // Store the calculated totals in an array for intermediate processing. Type III addition.
    const allCalculatedTotals = [totalAB, totalBC, totalCA];

    // Determine the minimum of the three sums using a sequential comparison logic.
    // This is a Type III rewrite of the original nested conditional structure.
    let smallestOverallSum = allCalculatedTotals[0]; // Initialize with the first sum.

    // Compare with the second sum.
    if (allCalculatedTotals[1] < smallestOverallSum) {
        smallestOverallSum = allCalculatedTotals[1];
    }

    // Compare with the third sum.
    if (allCalculatedTotals[2] < smallestOverallSum) {
        smallestOverallSum = allCalculatedTotals[2];
    }

    // Output the final minimum sum to standard output.
    // Using `process.stdout.write` as an alternative to `console.log` (Type II change).
    process.stdout.write(String(smallestOverallSum) + "\n");
}

// Function to manage program execution, including input reading. Type III addition.
function manageProgramExecution() {
    // This block handles reading input from standard input in a Node.js environment.
    // Variable names are changed, and comments are rewritten.
    const fileSystemModuleReference = require("fs");
    const standardInputDevicePath = "/dev/stdin";

    try {
        // Synchronously read all data from the standard input file.
        const receivedDataBuffer = fileSystemModuleReference.readFileSync(standardInputDevicePath, "utf8");
        // Pass the trimmed input data to the main processing function.
        // `.trim()` is a Type III addition for robustness against whitespace.
        ProcessInputData(receivedDataBuffer.trim());
    } catch (errorEncountered) {
        // Log any errors that occur during input reading or processing.
        console.error("An error occurred during program execution:", errorEncountered.message);
        // Optionally, exit with a non-zero code to signal failure.
        // process.exit(1);
    }
}

// Initiate the program's execution flow.
manageProgramExecution();