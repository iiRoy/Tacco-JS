let rawData = ''; // Variable to accumulate all incoming data from standard input.

// Start the process of reading from standard input.
process.stdin.resume();

// Configure the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events, which fire when input data is available.
process.stdin.on('data', (dataSegment) => {
    // Append each received data chunk to our rawData string.
    rawData += dataSegment;
});

// Attach an event listener for the 'end' event, which fires when the input stream has finished.
process.stdin.on('end', () => {
    // Process the accumulated raw data:
    // 1. Split the rawData by newline characters and take the first line.
    // 2. Remove the very last character from this first line (often a newline or carriage return).
    const processedString = rawData.split("\n")[0].slice(0, -1);

    // Initialize a candidate prefix string.
    // It's derived from the processed string, truncated from the end by half its length.
    let prefixCandidate = processedString.slice(0, -Math.floor(processedString.length / 2));

    // Declare two arrays: one to store the counts of pattern occurrences,
    // and another to store the corresponding pattern strings themselves.
    const matchCounts = [];
    const candidatePrefixes = [];

    // Loop as long as the current prefix candidate has a length not equal to 2.
    // This loop systematically shortens the prefix and evaluates its repetition.
    while (prefixCandidate.length !== 2) {
        // Call the helper function to determine how many times the current prefixCandidate
        // repeats consecutively at the beginning of the processedString.
        matchCounts.push(evaluatePatternOccurrences(processedString, prefixCandidate));
        // Store the current prefixCandidate in its dedicated array.
        candidatePrefixes.push(prefixCandidate);
        // Shorten the prefixCandidate by one character from its end for the next iteration.
        prefixCandidate = prefixCandidate.slice(0, -1);
    }

    // Determine the maximum number of occurrences found among all evaluated prefixes.
    const maximumCount = Math.max.apply(null, matchCounts);

    // Calculate and print the final result:
    // 1. Find the index of the maximum occurrence count within the matchCounts array.
    // 2. Use this index to retrieve the corresponding prefix string from candidatePrefixes.
    // 3. Get the length of that specific prefix.
    // 4. Multiply the prefix's length by the maximum occurrence count.
    console.log(candidatePrefixes[matchCounts.indexOf(maximumCount)].length * maximumCount);
});

/**
 * Helper function to count the number of consecutive, non-overlapping occurrences
 * of a given pattern string at the beginning of a main string.
 *
 * @param {string} mainString - The primary string in which to search for the pattern.
 * @param {string} patternToFind - The pattern string whose occurrences are to be counted.
 * @returns {number} The total count of consecutive pattern occurrences.
 */
function evaluatePatternOccurrences(mainString, patternToFind) {
    let occurrenceCounter = 0; // Initialize a counter for the pattern's occurrences.

    // Continuously check if the segment of the main string, starting at the current
    // position (determined by occurrenceCounter and patternToFind's length) and
    // having the length of patternToFind, is identical to patternToFind.
    while (mainString.slice(occurrenceCounter * patternToFind.length, occurrenceCounter * patternToFind.length + patternToFind.length) === patternToFind) {
        occurrenceCounter++; // If a match is found, increment the counter.
    }

    return occurrenceCounter; // Return the final count of consecutive occurrences.
}
