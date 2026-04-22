// This function orchestrates the primary data processing flow, accepting the full input as a single string.
function executeProcessingLogic(rawDataSource) {
    // Break down the entire input string into individual line segments.
    // Each element in this array represents a distinct line from the source content.
    const contentLines = rawDataSource.split("\n");

    // Implement a preliminary check: ensure there's at least one line to process.
    if (contentLines.length === 0 || contentLines[0].trim().length === 0) {
        console.error("Input data is empty or first line is blank. Cannot proceed with calculation.");
        // If no valid data, we might return a default or throw an error. For now, just exit.
        return;
    }

    // Extract the very first line which is expected to contain the primary data point.
    const primaryLineContent = contentLines[0];

    // Split the primary line by space to get individual components or tokens.
    // This allows for multiple values on the first line, though only the first is used here.
    const firstSegmentComponents = primaryLineContent.split(" ");

    // Another validation: check if the first line actually contains any components after splitting.
    if (firstSegmentComponents.length === 0) {
        console.error("First input line contains no parseable components. Defaulting to zero.");
        // Fallback to a default if no components are found.
        firstSegmentComponents.push("0");
    }

    // A reusable helper function to safely parse a string into an integer.
    // It provides a configurable default value if the parsing operation results in NaN.
    const parseNumericSegment = (segmentString, defaultNumericValue = 0) => {
        const parsedInteger = parseInt(segmentString.trim(), 10); // Use radix 10 for safety
        return isNaN(parsedInteger) ? defaultNumericValue : parsedInteger;
    };

    // Attempt to extract the first numeric value from the components.
    // This is the core 'radius' or 'magnitude' value for our calculation.
    const targetNumericValue = parseNumericSegment(firstSegmentComponents[0]);

    // Define a constant for the multiplication factor, enhancing readability and maintainability.
    const CONSTANT_FACTOR_FOR_CALCULATION = 3;

    // Perform the main calculation: first, square the numeric value.
    // This represents an area-like component or a quadratic relationship.
    const intermediateSquaredValue = Math.pow(targetNumericValue, 2);

    // Then, multiply the squared value by our predefined constant factor.
    // This yields the final computed result, which might represent an area or similar metric.
    const finalComputedResult = intermediateSquaredValue * CONSTANT_FACTOR_FOR_CALCULATION;

    // Output the meticulously calculated result to the standard console.
    // A newline character is implicitly added by console.log.
    console.log(finalComputedResult);
}

// --- Standard boilerplate for handling system input. This section should typically remain unaltered. ---
// This part is responsible for reading the complete content from standard input
// and subsequently passing it to our main processing function.
const fileSystemAccessor = require("fs");
const standardInputFilepath = "/dev/stdin";
const textEncodingFormat = "utf8";

try {
    // Synchronously read the entire content of the standard input file.
    const inputContentBuffer = fileSystemAccessor.readFileSync(standardInputFilepath, textEncodingFormat);
    // Convert the buffer content to a string and invoke the primary logic.
    executeProcessingLogic(inputContentBuffer.toString());
} catch (inputReadError) {
    // Log any errors encountered during the file reading process.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    // As a robust fallback, one might execute the logic with a predefined default input.
    // For instance: executeProcessingLogic("0\n");
}
// Example invocation for isolated local testing purposes (usually kept commented out in final production code).
// executeProcessingLogic("9\n");