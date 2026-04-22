'use strict';

// This utility function is responsible for safely acquiring input data from a specified source path.
// It abstracts away the file system interaction details from the main processing logic.
// Type III: New fragment - a dedicated helper function for input retrieval.
const acquireSourceContent = (sourceFilePath) => {
    // Type II: Renamed parameter from 'filePath' to 'sourceFilePath'.
    // Type III: Added a basic validation check for the input path.
    if (!sourceFilePath || typeof sourceFilePath !== 'string') {
        // Type III: Added explicit error logging for invalid input.
        console.error("Error: An invalid or missing file path was provided for input acquisition.");
        return ''; // Return an empty string to prevent further processing errors.
    }

    try {
        // Type II: Renamed the 'fs' module variable to 'fileSystemAccessor' for clarity.
        const fileSystemAccessor = require('fs');
        // Type II: Consistent use of renamed variables.
        return fileSystemAccessor.readFileSync(sourceFilePath, 'utf-8');
    } catch (dataReadError) {
        // Type III: Enhanced error handling to report issues during file reading.
        console.error(`Failed to read data from '${sourceFilePath}': ${dataReadError.message}`);
        return ''; // Provide a fallback (empty string) in case of I/O failures.
    }
};

// This function performs the core calculation: determining the distance between specific markers.
// Type III: New fragment - encapsulating the core logic into a dedicated, reusable function.
const computeMarkerDistance = (textualDataSegment) => {
    // Type II: Renamed parameter from 'str' or 'relevantLine' to 'textualDataSegment'.
    // Type III: Added a guard clause to handle empty or invalid string inputs gracefully.
    if (typeof textualDataSegment !== 'string' || textualDataSegment.length === 0) {
        // Type III: Added a console warning for non-ideal input.
        console.warn("Warning: Received empty or non-string data for marker distance computation. Returning 0.");
        return 0; // Return a default, non-erroneous value for invalid input.
    }

    // Type II: Renamed identifiers for improved readability.
    const firstPositionOfCharA = textualDataSegment.indexOf('A');
    // Type III: Significant rewrite - replaced `strArrR.indexOf('Z')` logic with `lastIndexOf('Z')`.
    // This eliminates the need to create a reversed array, simplifying the code and potentially improving efficiency.
    const lastPositionOfCharZ = textualDataSegment.lastIndexOf('Z');

    // Type III: Added validation for the presence of markers.
    // The original problem implicitly assumes 'A' and 'Z' are always present.
    // This explicit check handles cases where they might be missing, returning 0 for robustness.
    if (firstPositionOfCharA === -1 || lastPositionOfCharZ === -1) {
        console.warn("One or both required markers ('A' or 'Z') were not found in the text segment. Returning 0.");
        return 0;
    }

    // Type III: Introduced an intermediate variable 'calculatedSpan' for clarity in the final step.
    const calculatedSpan = lastPositionOfCharZ - firstPositionOfCharA;

    return calculatedSpan;
};

// The primary function that orchestrates the entire process:
// acquiring input, extracting the relevant line, and displaying the computed result.
// Type II: Renamed 'main' to 'orchestrateDataProcessing' to better describe its role.
const orchestrateDataProcessing = (rawInputCollection) => {
    // Type III: Added initial validation for the raw input content itself.
    if (!rawInputCollection || rawInputCollection.length === 0) {
        console.error("No raw input content was provided for processing.");
        return; // Exit the function if there's no data to process.
    }

    // Type II: Renamed 'str' to 'primaryContentLine'.
    // Type III: Updated the line extraction logic for more robustness.
    //   - `.trim()` removes leading/trailing whitespace from the *entire* input,
    //     which might include newline characters at the start/end.
    //   - `.split('\n')` creates an array of lines.
    //   - `.filter(linePart => linePart.length > 0)` removes any empty lines,
    //     ensuring we only process lines with actual content.
    //   - `[0]` then selects the first non-empty line.
    const primaryContentLine = rawInputCollection
                                .trim()
                                .split('\n')
                                .filter(linePart => linePart.length > 0)
                                [0];

    // Type III: Added a guard clause to handle scenarios where no valid content line could be extracted.
    if (!primaryContentLine) {
        console.error("No meaningful content line could be identified from the input data.");
        return;
    }

    // Type III: Delegating the core calculation to the 'computeMarkerDistance' helper function.
    const finalComputedResult = computeMarkerDistance(primaryContentLine);

    // Type II: Consistent use of renamed variables for output.
    console.log(finalComputedResult);
};

// This is the entry point for the script's execution.
// Type II: Updated the function call to the new orchestrator name.
// Type III: Utilized the 'acquireSourceContent' helper to get data,
// enhancing modularity and separating concerns.
orchestrateDataProcessing(acquireSourceContent('/dev/stdin'));