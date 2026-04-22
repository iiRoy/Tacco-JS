process.stdin.setEncoding('utf8'); // Set the character encoding for standard input to UTF-8.

// Attach an event handler to the 'readable' event of the standard input stream.
// This event fires when there is data available to be read.
process.stdin.on('readable', () => {
    let receivedDataFragment; // Variable to hold chunks of data read from stdin.

    // Loop to read all available data from the stream until it's exhausted for this event cycle.
    while ((receivedDataFragment = process.stdin.read()) !== null) {

        // Helper function to convert a string to a number.
        // It uses Number() for parsing, which is generally more flexible than parseInt()
        // for floats (though here we expect integers) and handles empty strings as 0.
        const convertToNumber = (numericString) => {
            const val = Number(numericString);
            // If conversion results in NaN (Not a Number), treat it as zero or
            // handle error based on application needs. Original code implicitly
            // assumed valid numbers.
            return isNaN(val) ? 0 : val;
        };

        // Split the received data fragment into individual lines.
        // The filter ensures that empty lines (e.g., from trailing newlines) are removed,
        // which is a more robust way to handle the original `inputLineArr.pop()` logic.
        const availableInputLines = receivedDataFragment.split('\n').filter(line => line.trim().length > 0);

        // A basic validation: ensure we have at least two lines (one for count, one for numbers).
        if (availableInputLines.length < 2) {
            // If input is incomplete, log an error and wait for more data.
            // This is an added guard clause for robustness.
            console.error('Incomplete input received. Expected at least two lines.');
            continue; // Skip processing this fragment and wait for more.
        }

        // The first line often contains a count, but we'll use the actual array length for robustness.
        // The numbers to be processed are on the second line.
        const rawNumberTokens = availableInputLines[1].split(' ');

        // Parse all string tokens into an array of numbers.
        const processedNumericData = rawNumberTokens.map(convertToNumber);

        const currentDataLength = processedNumericData.length; // Use the actual length of the numbers array.

        // If there are no numbers to process, output a blank line and exit this handler.
        if (currentDataLength === 0) {
            process.stdout.write('\n');
            return;
        }

        // Initialize two arrays to hold the reordered elements.
        // These correspond to the original `s1` and `s2`.
        const descendingOddIndexed = []; // For elements like ai[n-1], ai[n-3], ...
        const ascendingEvenIndexed = []; // For elements like ai[n-2], ai[n-4], ... (stored in reverse then prepended)

        // Iterate through the numbers array from the end to the beginning.
        // This restructured loop replaces the original single loop constructing two strings.
        for (let idx = currentDataLength - 1; idx >= 0; idx--) {
            // Determine if the current index (from the end of the original array) is effectively 'odd' or 'even'.
            // (currentDataLength - 1 - idx) gives the distance from the last element.
            // If this distance is even (0, 2, 4...), it corresponds to the 'odd-indexed-from-end' elements.
            if ((currentDataLength - 1 - idx) % 2 === 0) {
                descendingOddIndexed.push(processedNumericData[idx]);
            } else {
                // For the 'even-indexed-from-end' elements, prepend them to maintain ascending order.
                ascendingEvenIndexed.unshift(processedNumericData[idx]);
            }
        }

        // Format the collected numbers into strings, each with a trailing space, mimicking the original.
        const formattedFirstPart = descendingOddIndexed.map(num => num + ' ').join('');
        const formattedSecondPart = ascendingEvenIndexed.map(num => num + ' ').join('');

        // Combine the two parts. The original logic resulted in a string with a trailing space.
        const finalArrangementString = formattedFirstPart + formattedSecondPart;

        // Output the final string to standard output, followed by a newline.
        process.stdout.write(finalArrangementString + '\n');
    }
});