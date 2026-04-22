process.stdin.resume(); // Ensure the input stream remains active
process.stdin.setEncoding('utf8'); // Specify the character encoding for incoming data

// Attach an event listener to handle incoming data chunks from standard input
process.stdin.on('data', function (inputSegment) {
    // Convert the received data chunk to a string, remove any leading/trailing
    // whitespace (like a final newline), and then split it into an array of lines.
    const rawInputLines = String(inputSegment).trim().split('\n');

    // Filter out any lines that are empty strings, which could result from
    // the split operation or malformed input, to prevent parsing errors.
    const nonBlankEntries = rawInputLines.filter(lineContent => lineContent.length > 0);

    // This array will store only the successfully parsed numerical values.
    const processedNumericalArray = [];

    // Iterate through each non-blank input entry to attempt conversion to an integer.
    for (let currentEntryIdx = 0; currentEntryIdx < nonBlankEntries.length; currentEntryIdx++) {
        const stringValue = nonBlankEntries[currentEntryIdx];
        const convertedNumber = parseInt(stringValue, 10); // Use radix 10 for explicit decimal conversion

        // Validate if the parsing was successful. If parseInt returns NaN, it means
        // the string was not a valid number. We'll log a warning and skip this entry.
        if (isNaN(convertedNumber)) {
            console.error(`Invalid data encountered: "${stringValue}" is not a number. This entry will be skipped.`);
            continue; // Move to the next entry in the loop.
        }
        processedNumericalArray.push(convertedNumber);
    }

    // Initialize a counter specifically for the cases that will be displayed.
    // This allows for sequential numbering of output cases, independent of input array indices.
    let outputCaseSequence = 0;

    // Iterate through the array of parsed numeric values to determine what to print.
    // The original logic implicitly skipped values that were exactly '0'.
    for (let dataPointIndex = 0; dataPointIndex < processedNumericalArray.length; dataPointIndex++) {
        const valueToEvaluate = processedNumericalArray[dataPointIndex];

        // Only print values that are not equal to zero. This mirrors the original program's behavior.
        if (valueToEvaluate !== 0) {
            // Increment the display counter only for the cases that are actually outputted.
            outputCaseSequence++;
            // Output the result using a template literal for clear string construction.
            console.log(`Case ${outputCaseSequence}: ${valueToEvaluate}`);
        }
        // If 'valueToEvaluate' is 0, this block is skipped, effectively ignoring it.
    }
});