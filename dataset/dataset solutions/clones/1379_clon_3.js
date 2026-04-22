/*
 * This module processes raw input data to generate ASCII art frames.
 * Each line of input is expected to contain two space-separated integers
 * representing width and height dimensions for a rectangular pattern.
 * The generated patterns are then output to the console.
 */
(function(rawInputData) {
    // Define constants for characters used in the ASCII art patterns.
    const FRAME_BORDER_CHAR = '#';
    const FRAME_FILL_CHAR = '.';

    // Define delimiters for parsing the input data.
    // LINE_DELIMITER handles both Windows (CRLF) and Unix (LF) newlines.
    const LINE_DELIMITER = /\r?\n/;
    // DIMENSION_DELIMITER separates the width and height values on each line.
    const DIMENSION_DELIMITER = ' ';

    // Split the entire raw input string into individual lines based on the delimiter.
    let inputLines = rawInputData.split(LINE_DELIMITER);

    // Iterate through each line of the input data to process dimensions and generate frames.
    // Using a standard 'for' loop provides explicit control over iteration,
    // which is useful for potential early exits or complex flow.
    for (let currentLineIdx = 0; currentLineIdx < inputLines.length; currentLineIdx++) {
        // Retrieve the current line and remove any leading/trailing whitespace.
        let lineContent = inputLines[currentLineIdx].trim();

        // Skip processing if the line is empty after trimming, to avoid errors.
        if (!lineContent) {
            continue; // Move to the next line.
        }

        // Split the cleaned line into string parts, expecting width and height.
        let dimensionParts = lineContent.split(DIMENSION_DELIMITER);

        // Validate that at least two parts (width and height) were found.
        if (dimensionParts.length < 2) {
            console.error(`Warning: Skipping malformed input line at index ${currentLineIdx}. Expected two dimensions, found: "${lineContent}"`);
            continue; // Skip this line and proceed to the next.
        }

        // Parse the string parts into integer values for width and height.
        // `parseInt` with radix 10 is used for reliable number conversion.
        let parsedWidth = parseInt(dimensionParts[0], 10);
        let parsedHeight = parseInt(dimensionParts[1], 10);

        // Perform comprehensive validation on the parsed dimensions.
        // Check for NaN (Not-a-Number) results from parsing, or negative values.
        if (isNaN(parsedWidth) || isNaN(parsedHeight) || parsedWidth < 0 || parsedHeight < 0) {
            console.error(`Warning: Invalid numeric dimensions detected at line ${currentLineIdx}: [${dimensionParts[0]}, ${dimensionParts[1]}]. Skipping frame generation for this entry.`);
            continue; // Skip this line and proceed.
        }

        // Implement the termination condition: if both dimensions are 0.
        // This mirrors the original code's `return`, effectively stopping all further processing
        // of input lines and exiting the entire anonymous function.
        if (parsedWidth === 0 && parsedHeight === 0) {
            console.log("Termination signal (0 0) received. Ceasing further frame generation.");
            return; // Exit the IIFE.
        }

        // --- Core Frame Construction Logic ---

        // 1. Construct the top and bottom border lines.
        // The original logic used `x+1` for the length of these lines.
        // Example: for width 1, it's `##`; for width 2, it's `###`.
        let borderSegment = FRAME_BORDER_CHAR.repeat(parsedWidth + 1);

        // 2. Construct the internal row segment (e.g., '#.#', '##', '#...#').
        // This is the line that appears between the top and bottom borders.
        let innerRowComponent;
        if (parsedWidth === 1) {
            // Special case: for width 1, an inner row is also '##'.
            innerRowComponent = FRAME_BORDER_CHAR.repeat(2);
        } else {
            // For widths > 1, it's a border char, then `width - 1` fill chars, then another border char.
            innerRowComponent = FRAME_BORDER_CHAR + FRAME_FILL_CHAR.repeat(parsedWidth - 1) + FRAME_BORDER_CHAR;
        }

        // 3. Assemble the complete frame using an array, then join its elements.
        let completedFrameSegments = [];
        completedFrameSegments.push(borderSegment); // Add the top border.

        // Add the middle rows based on height.
        // If `parsedHeight` is 1, this loop correctly does not run,
        // resulting in a frame with only top and bottom borders.
        for (let rowIterator = 0; rowIterator < parsedHeight - 1; rowIterator++) {
            completedFrameSegments.push(innerRowComponent);
        }

        completedFrameSegments.push(borderSegment); // Add the bottom border.

        // Join all segments with newline characters to form the final displayable string.
        let finalRenderedOutput = completedFrameSegments.join('\n');

        // Output the generated ASCII frame to the console.
        console.log(finalRenderedOutput);

        // Add an extra newline for visual separation between frames,
        // unless it's the very last frame being processed.
        if (currentLineIdx < inputLines.length - 1) {
            console.log('');
        }
    }

    // Optional: Provide feedback if no valid input lines were processed.
    // This catches cases where the input was empty or contained only blank lines.
    if (inputLines.length === 0 || (inputLines.length === 1 && !inputLines[0].trim())) {
        console.warn("No valid input lines were found for frame generation.");
    }

}(
    // This immediately invoked function expression (IIFE) is called
    // with the content of standard input.
    // `require('fs').readFileSync` reads the file synchronously.
    // '/dev/stdin' is the standard input path on Unix-like systems.
    // 'utf8' encoding ensures the input is treated as a string.
    require('fs').readFileSync('/dev/stdin', 'utf8')
));