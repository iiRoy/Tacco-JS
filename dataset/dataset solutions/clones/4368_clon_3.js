function aggregateIntervalSpans(sourceTextContent) {
    // Defensive check: if no input is provided, or it's just whitespace.
    if (!sourceTextContent || typeof sourceTextContent !== 'string' || sourceTextContent.trim() === '') {
        console.warn("Input source text is empty or invalid. Returning 0 for aggregated span.");
        return 0; // Return zero if no valid input.
    }

    // Split the entire text into individual lines, handling various newline characters,
    // and filter out any completely empty lines that might result from splitting.
    const textLines = sourceTextContent.split(/\r?\n/).filter(line => line.trim() !== '');

    // If after processing, there are no meaningful lines, return 0.
    if (textLines.length === 0) {
        console.warn("No meaningful data lines found after splitting and filtering. Returning 0.");
        return 0;
    }

    // The first line often contains metadata (like a count), which might be ignored
    // or used for validation. In this specific problem, it's typically ignored for calculations.
    // We explicitly acknowledge and store it, even if not used in the final sum.
    const headerLineMetadata = textLines[0];
    // console.log(`Header line content (often a count, currently unused for sum calculation): "${headerLineMetadata}"`);

    // Helper function to parse a single line into a valid numerical range object.
    // This adds modularity, improves readability, and centralizes validation logic.
    const parseRangeSegment = (lineString, originalLineIndex) => {
        // Split by one or more whitespace characters, then filter out any empty strings
        // that might result from multiple spaces or leading/trailing spaces.
        const parts = lineString.split(/\s+/).filter(part => part !== '');
        
        // Validation: Ensure exactly two numeric parts are present.
        if (parts.length !== 2) {
            console.warn(`Line ${originalLineIndex}: "${lineString}" is malformed. Expected two space-separated numbers. Skipping.`);
            return null;
        }

        // Explicitly parse string parts into integers with base 10.
        const startValue = parseInt(parts[0], 10);
        const endValue = parseInt(parts[1], 10);

        // Validation: Check if parsing resulted in valid numbers (not NaN).
        if (isNaN(startValue) || isNaN(endValue)) {
            console.warn(`Line ${originalLineIndex}: "${lineString}" contains non-numeric values. Skipping.`);
            return null;
        }

        // Validation: Ensure the start value does not exceed the end value.
        // If it does, it's an invalid range for typical interval calculations.
        if (startValue > endValue) {
            console.warn(`Line ${originalLineIndex}: Invalid range [${startValue}, ${endValue}]. Start value must not be greater than end value. Skipping.`);
            return null;
        }

        // Return a structured object for valid ranges.
        return { beginning: startValue, ending: endValue };
    };

    // Use the `reduce` array method to iterate over the data lines (skipping the first header line)
    // and accumulate the total length of valid intervals. This is a functional programming
    // approach, providing an alternative to a traditional `for` loop.
    const overallSpanAccumulator = textLines.slice(1).reduce((currentTotal, lineContent, indexInSlice) => {
        // Calculate the actual line number in the original `textLines` array
        // (accounting for the skipped header line and 0-based indexing).
        const originalLineIndex = indexInSlice + 2; 
        const parsedInterval = parseRangeSegment(lineContent, originalLineIndex);

        if (parsedInterval) {
            // If the line was successfully parsed into a valid interval,
            // calculate its inclusive length and add it to the running total.
            const intervalLength = parsedInterval.ending - parsedInterval.beginning + 1;
            return currentTotal + intervalLength;
        } else {
            // If the line was invalid or skipped, just return the current total without adding anything.
            return currentTotal;
        }
    }, 0); // Initialize the accumulator (currentTotal) to 0.

    return overallSpanAccumulator;
}

// Main execution block for reading input from standard input and processing it.
try {
    // Utilize the Node.js 'fs' module to read the entire content from standard input.
    // It's decoded as UTF-8 and any leading/trailing whitespace from the entire file content is removed.
    const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

    // Call the refactored function to calculate the total aggregated span.
    const computedSpan = aggregateIntervalSpans(stdinContent);

    // Output the final computed result to the console.
    console.log(computedSpan);
} catch (error) {
    // Implement basic error handling for issues like file reading errors or unexpected exceptions.
    console.error("An error occurred during input processing:", error.message);
    // In a production environment, it's good practice to exit with a non-zero status code
    // to indicate that the program terminated abnormally.
    process.exit(1); 
}