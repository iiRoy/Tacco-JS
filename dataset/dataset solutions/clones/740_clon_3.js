#!/usr/bin/node
// This script processes numerical data from standard input to solve a modified Josephus problem.
// Originally derived from a legacy CoffeeScript source, this version has been extensively refactored
// and expanded for improved clarity, robustness, and modern JavaScript practices.
// It reads lines of space-separated integers, performs a Josephus calculation for each, and prints the result.
(function() {
    // Array to store fully received and processed input data lines.
    const inputRecords = [];
    // Stream for reading data from standard input.
    let dataStream;

    // Attempt to open the standard input stream.
    // This provides a basic guard clause for environments where stdin might not be available.
    try {
        dataStream = process.openStdin();
    } catch (streamError) {
        console.error("Fatal Error: Unable to open standard input stream.", streamError.message);
        process.exit(1); // Exit with an error code if stream cannot be opened.
    }

    // Configure the input stream to decode data as UTF-8 text.
    dataStream.setEncoding('utf8');

    // Buffer to hold incomplete lines that span across multiple 'data' chunks.
    let lineBuffer = "";

    /**
     * Helper function to process an array of raw line strings.
     * It trims whitespace from each line and only adds non-empty lines to `inputRecords`.
     * @param {string[]} rawLineArray - An array of strings, potentially containing empty or whitespace-only lines.
     */
    const processReceivedLines = (rawLineArray) => {
        for (let lineIndex = 0; lineIndex < rawLineArray.length; lineIndex++) {
            const currentLine = rawLineArray[lineIndex].trim(); // Remove leading/trailing whitespace
            if (currentLine.length > 0) { // Only store lines that contain actual content
                inputRecords.push(currentLine);
            }
        }
    };

    // Event handler for incoming data chunks from the standard input stream.
    dataStream.on('data', (inputChunk) => {
        // Concatenate the current data chunk with any previously buffered incomplete line.
        const combinedInputContent = lineBuffer + inputChunk;
        // Split the combined content by newline characters.
        // The last element of `lineSegments` will be an incomplete line if `inputChunk`
        // did not end with a newline, or an empty string if it did.
        const lineSegments = combinedInputContent.split("\n");

        // The last segment is saved as the new `lineBuffer` for the next 'data' event,
        // or for final processing in the 'end' event.
        lineBuffer = lineSegments.pop();

        // Process all complete lines received in this chunk.
        processReceivedLines(lineSegments);
    });

    // Event handler for the end of the input stream.
    dataStream.on('end', () => {
        // If there's any data remaining in the `lineBuffer` after the stream ends,
        // it means the input concluded without a final newline. Process this as the last line.
        if (lineBuffer.length > 0) {
            processReceivedLines([lineBuffer]); // Wrap in an array for consistency with processReceivedLines
        }

        // --- Start of Josephus Problem Calculation Logic ---

        // The original code included 'a.pop()' here, which discarded the very last collected line.
        // This behavior is replicated to maintain cloning fidelity, as it implies a specific
        // expectation about the input format (e.g., the last line might be an empty line,
        // a final metadata line not meant for processing, or an artifact of the input source).
        if (inputRecords.length > 0) {
            inputRecords.pop(); // Explicitly discard the final collected line.
        } else {
            // If no valid input records were collected after potential discarding,
            // there's nothing further to process.
            // console.warn("No valid input records found for processing.");
            return; // Exit the 'end' handler early.
        }

        /**
         * Calculates the 0-indexed survivor position in a Josephus problem variant.
         * This specific recurrence relation `(f(N-1, K) + K) % N` is calculated iteratively.
         * The loop computes `f(totalCount - 1, stepValue)` where `f(1, K) = 0`.
         * @param {number} totalCount - The effective number of elements (N in f(N,K)).
         * @param {number} stepValue - The elimination step (K in f(N,K)).
         * @returns {number} The 0-indexed position of the survivor.
         */
        const calculateJosephusSurvivor = (totalCount, stepValue) => {
            // Base case: If there's only one or zero elements, the survivor is at position 0.
            if (totalCount <= 1) {
                return 0;
            }

            let currentSurvivorPosition = 0; // Represents the 0-indexed survivor for `i` people.

            // The loop simulates the Josephus problem for populations from 2 up to `totalCount - 1`.
            // This is equivalent to `for (let i = 2; i < totalCount; i++)` in standard form.
            for (let currentPopulationSize = 2; currentPopulationSize < totalCount; currentPopulationSize++) {
                currentSurvivorPosition = (currentSurvivorPosition + stepValue) % currentPopulationSize;
            }
            return currentSurvivorPosition;
        };

        // Iterate through each collected input record to perform the calculation.
        for (let recordIndex = 0; recordIndex < inputRecords.length; recordIndex++) {
            const currentRecordLine = inputRecords[recordIndex];
            // Split the line into string parts based on space delimiters.
            const stringParts = currentRecordLine.split(" ");

            const numericalValues = [];
            // Parse each string part into an integer, adding validation.
            for (let partIndex = 0; partIndex < stringParts.length; partIndex++) {
                const parsedNumber = Number.parseInt(stringParts[partIndex], 10); // Use radix 10 for safety.
                if (Number.isNaN(parsedNumber)) {
                    console.error(`Warning: Non-numeric value '${stringParts[partIndex]}' detected in record ${recordIndex + 1}. This value will be treated as invalid.`);
                    numericalValues.push(NaN); // Store NaN to indicate an invalid number.
                } else {
                    numericalValues.push(parsedNumber);
                }
            }

            // Guard clause: Ensure we have at least three valid numbers to proceed.
            if (numericalValues.length < 3 || numericalValues.some(Number.isNaN)) {
                console.error(`Error: Insufficient or invalid numerical data in record ${recordIndex + 1}: '${currentRecordLine}'. Skipping this record.`);
                continue; // Move to the next input record.
            }

            // Extract the three required parameters.
            const totalElements = numericalValues[0];      // Corresponds to original 'n'
            const eliminationStep = numericalValues[1];     // Corresponds to original 'k'
            const startingOffset = numericalValues[2];      // Corresponds to original 'm'

            // Input validation for Josephus parameters: `totalElements` and `eliminationStep` must be positive.
            if (totalElements <= 0 || eliminationStep <= 0) {
                console.error(`Error: Invalid parameters for Josephus calculation in record ${recordIndex + 1}. 'totalElements' (${totalElements}) and 'eliminationStep' (${eliminationStep}) must be positive integers. Skipping.`);
                continue;
            }

            // Perform the Josephus calculation.
            const intermediateSurvivorPosition = calculateJosephusSurvivor(totalElements, eliminationStep);

            // Apply the final offset and adjust the result to be 1-indexed (as per original logic).
            // The formula is: (0-indexed_survivor + offset) % total_elements + 1
            const finalComputedResult = (intermediateSurvivorPosition + startingOffset) % totalElements + 1;

            console.log(finalComputedResult);
        }
    });

    // Optional: Add an error handler for the stream itself, beyond just opening it.
    dataStream.on('error', (streamError) => {
        console.error("An unexpected error occurred during stdin stream processing:", streamError.message);
        process.exit(1); // Exit on stream error.
    });

})();