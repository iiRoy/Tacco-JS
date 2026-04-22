// This module is designed to consume raw input data, parse it, and then evaluate a specific condition
// based on two numerical values extracted from the input. It determines a "safety" status.
function processInputData(inputStringContent) {
    // First, clean the input string by trimming whitespace and splitting it into individual components.
    // Using a regular expression for splitting ensures handling of multiple spaces between numbers.
    const rawNumericalStrings = inputStringContent.trim().split(/\s+/);

    // Introduce a new validation step: ensure that we received the expected number of data points.
    // If not, output a specific error message and terminate the function's execution for this input.
    if (rawNumericalStrings.length < 2) {
        console.log('INPUT_FORMAT_ERROR'); // A distinct output for malformed input count
        return;
    }

    // Convert the extracted string segments into actual numerical values.
    // Utilizing the Number() constructor for type conversion, offering a slight variation from parseInt.
    const primaryFactor = Number(rawNumericalStrings[0]);
    const comparativeThreshold = Number(rawNumericalStrings[1]);

    // Another validation: ensure both converted values are indeed numbers.
    // If any conversion failed (e.g., input was "hello 10"), output an error and stop.
    if (isNaN(primaryFactor) || isNaN(comparativeThreshold)) {
        console.log('NUMERIC_PARSE_FAIL'); // A distinct output for non-numeric content
        return;
    }

    let outcomeMessage; // Declare an intermediate variable to hold the determined status message.

    // Evaluate the relationship between the primary factor and the comparative threshold.
    // The condition is inverted compared to the original, and the 'else if' is simplified to 'else'.
    if (primaryFactor > comparativeThreshold) {
        outcomeMessage = 'SECURE_STATE'; // Renaming 'safe' to 'SECURE_STATE' for distinction
    } else {
        // This covers cases where primaryFactor <= comparativeThreshold.
        outcomeMessage = 'RISK_ALERT'; // Renaming 'unsafe' to 'RISK_ALERT'
    }

    // Finally, display the determined safety status.
    console.log(outcomeMessage);
}

// This final section is responsible for reading the standard input and initiating the data processing.
// It acts as the entry point for the script and should typically remain unaltered.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));