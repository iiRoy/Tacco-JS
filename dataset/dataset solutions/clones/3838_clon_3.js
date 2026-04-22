function ProcessInputData(rawDataContainer) {
    // Ensure the raw input is structured as expected (an array with at least two elements).
    if (!Array.isArray(rawDataContainer) || rawDataContainer.length < 2) {
        console.error("Error: Input data container is malformed or incomplete. Expected an array with string and integer components.");
        return; // Gracefully exit if input structure is invalid.
    }

    // Explicitly convert the first input element to a string, ensuring type consistency.
    const sourceTextValue = String(rawDataContainer[0]);
    // Parse the second input element as an integer, specifying radix 10 for safety.
    const targetIndexKey = Number.parseInt(rawDataContainer[1], 10);

    // Define constants for validation thresholds, enhancing readability and maintainability.
    const minimumTextLength = 1;
    const maximumTextLength = 5000;
    const minimumTargetKey = 1;
    const maximumTargetKey = 5;

    // Determine the effective length of the source text for loop boundaries.
    const textLengthIndicator = sourceTextValue.length;

    // Implement a guard clause for source text length validation.
    if (textLengthIndicator < minimumTextLength || textLengthIndicator > maximumTextLength) {
        console.warn(`Warning: Provided source text length (${textLengthIndicator}) falls outside the acceptable range [${minimumTextLength}, ${maximumTextLength}]. Operation halted.`);
        return; // Exit if the text length is out of bounds.
    }

    // Implement a guard clause for the target index key validation.
    if (targetIndexKey < minimumTargetKey || targetIndexKey > maximumTargetKey) {
        console.warn(`Warning: The target index key (${targetIndexKey}) is not within the permitted range [${minimumTargetKey}, ${maximumTargetKey}]. Operation halted.`);
        return; // Exit if the target key is invalid.
    }

    // Utilize a Set data structure for efficient storage and automatic management of unique substrings.
    const uniqueSubsequenceCollection = new Set();
    const newLineAsciiCharacter = '\n'; // Define the newline character for clarity.

    // Outer loop iterates through all possible starting positions for substrings.
    for (let currentStartPos = 0; currentStartPos < textLengthIndicator; ++currentStartPos) {
        // Inner loop iterates through all possible ending positions, ensuring non-empty substrings.
        // `slice(start, end)` extracts up to (but not including) `end`.
        // So, `end` can go up to `textLengthIndicator`.
        for (let currentEndPos = currentStartPos + 1; currentEndPos <= textLengthIndicator; ++currentEndPos) {
            // Extract the current segment using the slice method.
            const extractedSegment = sourceTextValue.slice(currentStartPos, currentEndPos);

            // Introduce intermediate boolean flags for explicit condition checks.
            const segmentIsNonEmpty = extractedSegment.length > 0; // Redundant due to loop structure, but kept for explicit check.
            const segmentLacksNewLine = extractedSegment.indexOf(newLineAsciiCharacter) === -1;

            // Add the segment to the Set only if it meets all specified criteria.
            if (segmentIsNonEmpty && segmentLacksNewLine) {
                uniqueSubsequenceCollection.add(extractedSegment);
            }
        }
    }

    // Convert the Set of unique substrings into an array for sorting capabilities.
    let sortedSubstringsArray = Array.from(uniqueSubsequenceCollection);

    // Sort the collected substrings lexicographically (alphabetical order).
    sortedSubstringsArray.sort();

    // Verify if the calculated target index is within the bounds of the sorted array.
    const zeroBasedTargetIndex = targetIndexKey - 1;
    if (zeroBasedTargetIndex < 0 || zeroBasedTargetIndex >= sortedSubstringsArray.length) {
        console.error(`Error: The calculated target index (${targetIndexKey}) is out of range for the available unique substrings (${sortedSubstringsArray.length}).`);
        return; // Exit if the index is invalid.
    }

    // Retrieve the specific substring at the determined index.
    const finalDesiredResult = sortedSubstringsArray[zeroBasedTargetIndex];
    // Output the final result to the console.
    console.info(finalDesiredResult);
}

// --- Program Execution Entry Point ---
// Abstracting file system operations into constants and a try-catch block for robustness.
const fileSystemModuleAccessor = require("fs");
const standardInputDevicePath = "/dev/stdin";
const standardEncodingFormat = "utf8";

try {
    // Read the raw content from standard input synchronously.
    const rawInputContentBuffer = fileSystemModuleAccessor.readFileSync(standardInputDevicePath, standardEncodingFormat);
    // Split the raw content by newline characters to separate the main string and the integer key.
    const processedInputLines = rawInputContentBuffer.split('\n');

    // Invoke the main processing function with the parsed input.
    ProcessInputData(processedInputLines);
} catch (executionError) {
    // Log any errors encountered during input reading or initial processing.
    console.error("An unhandled error occurred during program execution:", executionError.message);
}