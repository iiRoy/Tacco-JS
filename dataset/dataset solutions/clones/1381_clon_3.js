/**
 * Comprehensive JavaScript module designed for processing streamed textual input.
 * This utility focuses on identifying the lexicographically smallest entry from
 * a multi-line input source, specifically excluding an initial header line.
 *
 * The primary execution flow is encapsulated within an Immediately Invoked Function Expression (IIFE)
 * to prevent global scope pollution and manage dependencies effectively.
 */
(function initiateProcessingPipeline() {
    // --- Configuration Constants ---
    // These constants enhance readability and centralize values used across the script.
    const FILE_SYSTEM_MODULE_IDENTIFIER = "fs";          // Identifier for Node.js file system module.
    const STANDARD_INPUT_DEVICE_PATH = "/dev/stdin";     // Standard path for input stream on Unix-like systems.
    const TEXT_ENCODING_SCHEME = "utf8";                 // Character encoding to use for input data.
    const FALLBACK_EMPTY_RESULT_MESSAGE = "No comparable entries found."; // Message for scenarios with no output.

    /**
     * Safely acquires raw data from the standard input stream.
     * This function includes robust error handling to gracefully manage potential
     * issues during file system operations, returning an empty string upon failure.
     *
     * @returns {string} The content read from stdin, or an empty string if an error occurs.
     */
    const acquireStreamedData = () => {
        let acquiredContentBuffer = ""; // Initialize with an empty string as a safe default.
        try {
            // Dynamically import the Node.js file system module.
            const fileSystemHandler = require(FILE_SYSTEM_MODULE_IDENTIFIER);
            // Synchronously read all available data from the specified input source.
            // This operation blocks execution until the entire content is read.
            acquiredContentBuffer = fileSystemHandler.readFileSync(STANDARD_INPUT_DEVICE_PATH, TEXT_ENCODING_SCHEME);
        } catch (dataAcquisitionError) {
            // Log a detailed error message if input acquisition fails, aiding debugging.
            console.error(`ERROR: Failed to retrieve content from standard input device: ${dataAcquisitionError.message}`);
            // Returning an empty string allows the subsequent processing logic to handle
            // the lack of input gracefully, rather than crashing.
        }
        return acquiredContentBuffer;
    };

    // --- Step 1: Acquire Raw Input Data ---
    // Call the helper function to obtain the full raw content from the input stream.
    const rawContentBuffer = acquireStreamedData();

    // --- Step 2: Validate and Pre-process the Raw Input ---
    // Perform initial validation to ensure the acquired data is a valid string
    // and contains meaningful characters after trimming whitespace.
    if (typeof rawContentBuffer !== 'string' || rawContentBuffer.trim().length === 0) {
        console.error("ABORT: Input data is either not a string type or contains no meaningful content after trimming.");
        // Output a specific message indicating the reason for termination.
        console.log(FALLBACK_EMPTY_RESULT_MESSAGE);
        return; // Exit the IIFE, preventing further execution.
    }

    // Split the raw content into an array of individual lines based on newline characters.
    // This transforms the single large string into a collection of smaller strings.
    const allParsedContentLines = rawContentBuffer.split('\n');

    // --- Step 3: Filter and Refine Content Lines ---
    // This step discards the very first line (typically a header or count)
    // and filters out any lines that become empty after trimming leading/trailing whitespace.
    // A `filter` operation is used here as a Type III transformation, replacing a direct `slice(1)`.
    const significantContentEntries = allParsedContentLines.filter((lineSegment, segmentIndex) => {
        // The condition `segmentIndex === 0` identifies the first line to be excluded.
        const isHeaderLine = (segmentIndex === 0);
        // `lineSegment.trim().length > 0` ensures only non-empty lines are considered.
        const hasMeaningfulCharacters = (lineSegment.trim().length > 0);
        // Only include lines that are NOT the header AND contain meaningful characters.
        return !isHeaderLine && hasMeaningfulCharacters;
    });

    // Add a critical guard clause to handle scenarios where no significant lines remain
    // after the filtering process, preventing errors in subsequent steps.
    if (significantContentEntries.length === 0) {
        console.warn("WARNING: No significant content lines were identified after filtering " +
                     "the header and empty entries. The input might have been sparse.");
        // Output a default message indicating that no comparable entries were found.
        console.log(FALLBACK_EMPTY_RESULT_MESSAGE);
        return; // Exit the IIFE.
    }

    // --- Step 4: Sort the Refined Content Lexicographically ---
    // Sort the array of significant content entries to determine the lexicographically smallest one.
    // An explicit comparison function is provided for Type III transformation,
    // even though it implements the default string sorting behavior.
    const orderedLexicalSequence = significantContentEntries.sort((entryAlpha, entryBeta) => {
        // Implement standard lexicographical string comparison logic.
        if (entryAlpha < entryBeta) {
            return -1; // `entryAlpha` precedes `entryBeta` in sort order.
        }
        if (entryAlpha > entryBeta) {
            return 1;  // `entryAlpha` follows `entryBeta` in sort order.
        }
        return 0;      // `entryAlpha` and `entryBeta` are considered equivalent.
    });

    // --- Step 5: Extract the Smallest Entry ---
    // After sorting, the lexicographically smallest entry will always be at the first position (index 0).
    let finalSmallestEntry = "ERROR_RESULT_NOT_DETERMINED"; // Default placeholder for safety.

    // Add a safety check to ensure the sorted array is not empty before attempting
    // to access its first element, which could lead to an undefined error.
    if (orderedLexicalSequence.length > 0) {
        finalSmallestEntry = orderedLexicalSequence[0];
    } else {
        // This case is a strong indication of a logical flaw if the earlier guard clause
        // (significantContentEntries.length === 0) was passed, but serves as an additional safeguard.
        console.error("CRITICAL: The lexical entries array became unexpectedly empty after sorting.");
    }

    /**
     * Dedicated function to present the final computed result to the user.
     * This abstraction allows for potential future enhancements like custom formatting
     * or logging mechanisms without altering the core processing logic.
     *
     * @param {string} resultData The final string result to be displayed.
     */
    const presentFinalResult = (resultData) => {
        // Output the determined smallest entry to the standard output.
        // This is the core equivalent of the original 'console.log' statement.
        console.log(resultData);
    };

    // --- Step 6: Present the Final Outcome ---
    // Call the dedicated output function with the identified smallest entry.
    presentFinalResult(finalSmallestEntry);

    // Optional: A final status message, useful for verbose debugging or process monitoring.
    // console.log("Processing pipeline completed successfully.");

})(); // End of initiateProcessingPipeline IIFE