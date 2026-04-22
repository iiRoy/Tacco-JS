(function(sourceTextContent) {
    // Helper function to safely convert a string value to a number.
    // It returns the number if valid, otherwise null to indicate a parsing failure.
    const parseNumericValue = (textualInput) => {
        const numericalRepresentation = Number(textualInput);
        return isNaN(numericalRepresentation) ? null : numericalRepresentation;
    };

    // Pre-process the entire input text:
    // 1. Trim leading/trailing whitespace from the whole content.
    // 2. Split the content into individual lines based on newline characters.
    // 3. Filter out any lines that are empty after the split, ensuring we only process meaningful data.
    const effectiveInputLines = sourceTextContent.trim().split('\n').filter(line => line.length > 0);

    // If, after preprocessing, there are no valid lines to work with, terminate execution.
    if (effectiveInputLines.length === 0) {
        // Optionally, a warning could be logged here for debugging purposes.
        return;
    }

    // An array to accumulate all the formatted output strings.
    // This allows for a single console.log call at the end, improving performance for large outputs.
    const formattedOutputStorage = [];
    let linesHandledCount = 0; // A counter for successfully processed data lines.

    // Iterate through each line that was extracted from the input content.
    // We use a traditional 'for' loop for explicit index control, similar to the original structure.
    for (let currentLineIdentifier = 0; currentLineIdentifier < effectiveInputLines.length; ++currentLineIdentifier) {
        const lineToProcess = effectiveInputLines[currentLineIdentifier];

        // Split the current line by spaces to get its constituent parts.
        // Filter out any empty strings that might arise from multiple spaces.
        const lineSegments = lineToProcess.split(' ').filter(segment => segment.length > 0);

        // Implement a guard clause: ensure there are at least two segments to form a pair.
        if (lineSegments.length < 2) {
            // If not enough data, skip this line and move to the next.
            continue;
        }

        // Convert the first two segments into numbers using our robust helper.
        const firstParsedNumber = parseNumericValue(lineSegments[0]);
        const secondParsedNumber = parseNumericValue(lineSegments[1]);

        // Implement another guard clause: ensure both parsed values are indeed valid numbers.
        if (firstParsedNumber === null || secondParsedNumber === null) {
            // If either conversion failed, skip this line.
            continue;
        }

        // Check for the specific termination condition (0 0).
        // If encountered, cease further processing of input lines immediately.
        if (firstParsedNumber === 0 && secondParsedNumber === 0) {
            break;
        }

        // Determine the smaller and larger of the two numbers using built-in Math functions.
        const minimumValue = Math.min(firstParsedNumber, secondParsedNumber);
        const maximumValue = Math.max(firstParsedNumber, secondParsedNumber);

        // Format the ordered pair into a string using template literals and add it to our buffer.
        formattedOutputStorage.push(`${minimumValue} ${maximumValue}`);
        linesHandledCount++; // Increment the count of lines that yielded an output.
    }

    // After the loop, if any output was generated, join all buffered strings with newlines
    // and print them as a single block to standard output.
    if (formattedOutputStorage.length > 0) {
        console.log(formattedOutputStorage.join('\n'));
    } else {
        // If no output was generated (e.g., input was all empty lines, or only contained termination sequence immediately),
        // we could log a message or simply do nothing.
    }

// The input to this immediately-invoked function is read from standard input.
// We use the Node.js 'node:fs' module for file system operations, specifying UTF-8 encoding.
})(require('node:fs').readFileSync("/dev/stdin", { encoding: "utf8" }));