let accumulatedInputBuffer = '';

// Setting the encoding for standard input to UTF-8 to correctly handle character data.
process.stdin.setEncoding('utf-8');

// Attaching an event listener to collect data chunks as they arrive from the input stream.
process.stdin.on('data', (incomingChunk) => {
    accumulatedInputBuffer += incomingChunk;
});

// Once the entire standard input stream has ended, process the collected data.
process.stdin.on('end', () => {

    // A utility function to safely convert a string to a number.
    // It returns a default value if the conversion results in NaN.
    const convertToNumberSafely = (textValue, fallback = 0) => {
        const numericResult = Number(textValue);
        return isNaN(numericResult) ? fallback : numericResult;
    };

    // A helper to extract a substring, ensuring the end index is treated inclusively.
    const obtainInclusiveSubstring = (sourceString, startIdx, endIdx) => {
        // Basic validation and adjustment for indices to prevent errors with slice.
        const stringLength = sourceString.length;
        const normalizedStart = Math.max(0, Math.min(startIdx, stringLength));
        const normalizedEnd = Math.max(0, Math.min(endIdx, stringLength - 1));

        if (normalizedStart > normalizedEnd) {
            return ''; // If the adjusted start is beyond adjusted end, return empty.
        }

        return sourceString.slice(normalizedStart, normalizedEnd + 1);
    };

    // Splitting the total accumulated input into an array of individual lines.
    const processedInputLines = accumulatedInputBuffer.split('\n');

    // Validate that there are enough lines for the initial content and the operation count.
    if (processedInputLines.length < 2) {
        console.error('Fatal Error: Not enough input lines for initial data and operation count.');
        return;
    }

    // The primary string content that will undergo transformations.
    let currentMutableContent = processedInputLines[0];

    // Parsing the total number of operations expected from the second line of input.
    const totalOperationsCount = convertToNumberSafely(processedInputLines[1]);

    // Guard against an invalid or negative operation count.
    if (totalOperationsCount < 0) {
        console.error('Configuration Error: Number of operations cannot be negative.');
        return;
    }

    // Loop through each command line to perform the specified operations.
    // Commands start from the third line (index 2) of the input array.
    for (let operationIterator = 0; operationIterator < totalOperationsCount; ++operationIterator) {
        const currentCommandLineIndex = operationIterator + 2;

        // Ensure the current command line actually exists in the input.
        if (currentCommandLineIndex >= processedInputLines.length) {
            console.warn(`Input Warning: Expected command at line ${currentCommandLineIndex}, but it is missing. Skipping this operation.`);
            continue; // Move to the next iteration if a command is absent.
        }

        const commandPartsArray = processedInputLines[currentCommandLineIndex].split(' ');
        const operationKey = commandPartsArray[0];

        // Extract and parse the segment start and end indices for the current operation.
        const segmentBeginIndex = convertToNumberSafely(commandPartsArray[1]);
        const segmentEndIndex = convertToNumberSafely(commandPartsArray[2]);

        // Basic validation for segment indices to prevent logical errors.
        if (segmentBeginIndex > segmentEndIndex || segmentBeginIndex < 0 || segmentEndIndex < 0) {
             console.warn(`Operation Skipped: Invalid segment indices encountered for command "${operationKey}" (${segmentBeginIndex}, ${segmentEndIndex}).`);
             continue;
        }

        // Normalize indices to ensure they are within the current string's bounds.
        const effectiveSegmentStart = Math.min(Math.max(0, segmentBeginIndex), currentMutableContent.length);
        const effectiveSegmentEnd = Math.min(Math.max(0, segmentEndIndex), currentMutableContent.length - 1);


        // Execute the appropriate action based on the operation type.
        switch (operationKey) {
            case 'print': {
                // Extract the specified substring and output it to the console.
                const segmentToOutput = obtainInclusiveSubstring(currentMutableContent, effectiveSegmentStart, effectiveSegmentEnd);
                console.log(segmentToOutput);
                break;
            }
            case 'reverse': {
                // Get the string portion before the segment to be reversed.
                const preSegment = currentMutableContent.slice(0, effectiveSegmentStart);
                // Get the exact segment that needs to be reversed.
                const targetSegment = obtainInclusiveSubstring(currentMutableContent, effectiveSegmentStart, effectiveSegmentEnd);
                // Perform the reversal: split into characters, reverse array, then join back.
                const reversedTargetSegment = targetSegment.split('').reverse().join('');
                // Get the string portion after the segment.
                const postSegment = currentMutableContent.slice(effectiveSegmentEnd + 1);

                // Reassemble the main content with the reversed segment in place.
                currentMutableContent = preSegment + reversedTargetSegment + postSegment;
                break;
            }
            case 'replace': {
                // The replacement string is typically the fourth part of the command.
                // Default to an empty string if no replacement value is provided.
                const replacementValue = commandPartsArray[3] || '';

                // Capture the string content preceding the replacement area.
                const leadingContent = currentMutableContent.slice(0, effectiveSegmentStart);
                // Capture the string content following the replacement area.
                const trailingContent = currentMutableContent.slice(effectiveSegmentEnd + 1);

                // Construct the new main content by inserting the replacement string.
                currentMutableContent = leadingContent + replacementValue + trailingContent;
                break;
            }
            default: {
                // Log a warning if an unrecognized operation command is encountered.
                console.warn(`Unidentified Operation: The command '${operationKey}' is not supported. Skipping.`);
                break;
            }
        }
    }
});