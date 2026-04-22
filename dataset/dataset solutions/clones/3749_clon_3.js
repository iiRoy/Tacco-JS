"use strict"; // Enforce strict mode for cleaner code practices

/**
 *  Performs the core computation by appending a specific number of '00' sequences
 *  to a base numeric value based on a given scaling factor.
 *  @param {number} currentBase - The initial numeric value (N in original).
 *  @param {number} scaleFactor - The scaling depth (D in original), determining repetitions.
 *  @returns {string} The computed string result.
 */
const constructPaddedValue = (currentBase, scaleFactor) => {
    // Ensure scaleFactor is a non-negative integer for 'repeat' functionality.
    // Although parseInt handles most cases, explicit check adds robustness.
    const effectiveScale = Math.max(0, Math.floor(scaleFactor));

    // Generate the suffix string by repeating "00" 'effectiveScale' times.
    const suffixZeros = "00".repeat(effectiveScale);

    // Concatenate the string representation of the base with the generated zeros.
    return String(currentBase) + suffixZeros;
};

/**
 *  Main entry point for processing external input data.
 *  Parses configuration parameters and orchestrates the calculation.
 *  @param {string} inputPayload - Raw string content from the input source.
 */
const processDataStream = inputPayload => {
    // Normalize and clean the incoming data stream.
    const cleanedPayload = inputPayload.trim();

    // Early exit if the input is empty after trimming, preventing further errors.
    if (!cleanedPayload) {
        console.error("Warning: Received an empty input stream. No processing performed.");
        return;
    }

    // Split the input into individual lines for structured parsing.
    const processedInputLines = cleanedPayload.split("\n");

    // We expect at least one line containing the primary configuration.
    if (processedInputLines.length === 0) {
        console.error("Error: Input stream contains no readable lines. Cannot extract configuration.");
        return;
    }

    // Extract the first line which holds the primary operational parameters.
    const configLineData = processedInputLines[0];

    // Separate the parameters within the configuration line.
    const firstLineComponents = configLineData.split(" ");

    // Validate the minimum number of expected components.
    if (firstLineComponents.length < 2) {
        console.error("Error: Malformed configuration line. Expected at least two parameters.");
        return;
    }

    // Parse the first component as the scaling depth (D).
    // Use radix 10 for parseInt for consistency. If parsing fails, default to 0.
    const scalingDepth = parseInt(firstLineComponents[0], 10) || 0;

    // Parse the second component as the base magnitude (N).
    // Similarly, default to 0 if parsing yields NaN.
    const baseMagnitude = parseInt(firstLineComponents[1], 10) || 0;

    // Delegate the actual calculation to the dedicated helper function.
    const finalResultString = constructPaddedValue(baseMagnitude, scalingDepth);

    // Present the final computed string to standard output.
    console.log(finalResultString);
};

// Initiate the data processing pipeline by reading from the standard input device.
// This part is an external dependency integration and typically remains constant.
processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));