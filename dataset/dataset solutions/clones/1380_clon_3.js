'use strict';

// This immediately invoked function expression processes input to render ASCII frames based on provided dimensions.
(function(sourceDataContent) {
    // Define constants for characters and delimiters used throughout the frame generation process.
    const BORDER_CHARACTER = '#';
    const FILL_CHARACTER = '.';
    const LINE_TERMINATOR = '\n';
    const DIMENSION_SEPARATOR = ' ';

    // A utility function to repeat a string a specified number of times.
    // This enhances readability compared to `new Array(count + 1).join(str)`.
    function createRepeatedString(textSegment, repeatCount) {
        if (repeatCount <= 0) {
            return '';
        }
        return textSegment.repeat(repeatCount);
    }

    // Split the entire input content into individual lines, removing any leading/trailing whitespace
    // from the overall content to prevent issues with empty lines at the start/end.
    const inputDimensionLines = sourceDataContent.trim().split(LINE_TERMINATOR);

    let successfullyRenderedFrames = 0; // Initialize a counter for frames that are successfully drawn.

    // Iterate through each line of the parsed input data.
    for (const currentInputLine of inputDimensionLines) {
        // Skip any lines that are empty or contain only whitespace, which might result from splitting.
        const trimmedLine = currentInputLine.trim();
        if (trimmedLine.length === 0) {
            continue;
        }

        // Attempt to parse the width and height from the current line.
        const dimensionComponents = trimmedLine.split(DIMENSION_SEPARATOR);

        // Implement a guard clause for malformed input lines.
        if (dimensionComponents.length !== 2) {
            console.error(`[ERROR] Malformed input: "${trimmedLine}". Expected two space-separated integers. Skipping.`);
            continue;
        }

        // Convert the string components to integer values. Use base 10 for safety.
        const frameHorizontalSize = parseInt(dimensionComponents[0], 10);
        const frameVerticalSize = parseInt(dimensionComponents[1], 10);

        // Validate that the parsed values are indeed numbers.
        if (isNaN(frameHorizontalSize) || isNaN(frameVerticalSize)) {
            console.error(`[ERROR] Invalid numeric input: "${trimmedLine}". Dimensions must be integers. Skipping.`);
            continue;
        }

        // Special termination condition: if both dimensions are zero, exit the processing loop entirely.
        if (frameHorizontalSize === 0 && frameVerticalSize === 0) {
            console.log("--- Program Termination Signal (0 0) Received. Exiting Frame Generation. ---");
            return; // Exit the IIFE, stopping all further operations.
        }

        // Validate that dimensions are positive for actual frame rendering.
        if (frameHorizontalSize <= 0 || frameVerticalSize <= 0) {
            console.error(`[WARNING] Non-positive dimensions "${frameHorizontalSize}x${frameVerticalSize}" encountered. Skipping frame generation for this input.`);
            continue;
        }

        // An array to hold each line of the ASCII frame before it's joined and printed.
        const constructedFrameLines = [];

        // Generate the top border line of the frame.
        constructedFrameLines.push(createRepeatedString(BORDER_CHARACTER, frameHorizontalSize));

        // Construct the internal rows of the frame, if the height is greater than 1.
        if (frameVerticalSize > 1) {
            let internalSegmentPattern;

            if (frameHorizontalSize <= 1) {
                // For frames with width 1, internal rows are just a single border character.
                internalSegmentPattern = BORDER_CHARACTER;
            } else {
                // For frames with width > 1, internal rows have border-fill-border pattern.
                internalSegmentPattern = BORDER_CHARACTER + createRepeatedString(FILL_CHARACTER, frameHorizontalSize - 2) + BORDER_CHARACTER;
            }

            // Add the appropriate number of internal rows. `frameVerticalSize - 2` accounts for top and bottom borders.
            for (let rowIterator = 0; rowIterator < frameVerticalSize - 2; rowIterator++) {
                constructedFrameLines.push(internalSegmentPattern);
            }

            // Generate and add the bottom border line.
            // This is added separately for vertical sizes greater than 1 to ensure correct structure.
            constructedFrameLines.push(createRepeatedString(BORDER_CHARACTER, frameHorizontalSize));
        }

        // Join all the constructed lines with the system's line terminator and output the complete frame.
        // An extra LINE_TERMINATOR is appended for consistent output spacing between frames.
        console.log(constructedFrameLines.join(LINE_TERMINATOR) + LINE_TERMINATOR);
        successfullyRenderedFrames++; // Increment the counter upon successful frame display.
    }

    // Optional: Provide a summary message after processing all input lines.
    /*
    if (successfullyRenderedFrames > 0) {
        console.log(`--- Finished processing. Total frames rendered: ${successfullyRenderedFrames}. ---`);
    } else {
        console.log("--- No frames were generated from the provided input data. ---");
    }
    */

// The input data is sourced from standard input, read as a UTF-8 encoded string.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));