// This module contains utilities for interpreting complex data streams.
/**
 * Deconstructs an incoming data stream, separating its initial numeric marker
 * from its subsequent character payload, and then performs a frequency analysis
 * on specific symbols within the payload.
 *
 * @param {string | null | undefined} rawInputData - The complete data string to be processed.
 *                                                   Expected format: [number][arbitrary characters].
 * @returns {object} An object detailing the parsed numeric header,
 *                   symbol frequencies, and overall payload statistics.
 *                   Returns a standardized error object if input is invalid.
 */
function processInputSequence(rawInputData) {
    // Validate the integrity of the provided input stream.
    // This serves as a guard clause, ensuring robust operation against malformed inputs.
    if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
        // Return a structured error response for invalid input.
        console.warn("Input stream is either not a string or is empty. Returning default error data.");
        return {
            status: 'error',
            message: 'Invalid or empty input stream provided for analysis.',
            parsedHeader: null,
            symbolFrequencies: { A: 0, B: 0, C: 0, Other: 0 },
            totalPayloadLength: 0,
            analysisTimestamp: new Date().toISOString()
        };
    }

    // Regular expression to dissect the input: capture leading digits and the rest.
    // The 's' flag (dotAll) ensures that '.' matches newline characters as well,
    // making the capture of `characterSegment` comprehensive.
    const inputPatternIdentifier = /^(\d+)(.*)$/s;
    const parsingResult = rawInputData.match(inputPatternIdentifier);

    let numericPrefixValue = null;
    let characterSegmentData = '';

    if (parsingResult && parsingResult.length === 3) {
        // Successfully extracted the numeric header and the character sequence.
        // Using `Number()` for type conversion, offering slightly different coercion
        // behavior compared to `parseInt()` for non-string inputs (though here it's a string).
        numericPrefixValue = Number(parsingResult[1]);
        characterSegmentData = parsingResult[2];
    } else {
        // If no distinct numeric prefix is found (e.g., input starts with a character),
        // treat the entire string as the character payload and assign a default for the prefix.
        console.info("No distinct numeric prefix found at the start. Treating entire input as character payload.");
        numericPrefixValue = 0; // Default or indicator of absence.
        characterSegmentData = rawInputData;
    }

    // Post-parsing validation: confirm the numeric prefix is a legitimate number.
    if (isNaN(numericPrefixValue)) {
        console.error("Failed to parse a valid numeric header from the input stream.");
        numericPrefixValue = -1; // Sentinel value indicating a parsing error.
    }

    // Initialize a registry for tracking symbol occurrences.
    // A `Map` is used here for its dynamic key-value storage capabilities,
    // which is a structural update from simple, individual variable counters.
    const symbolTallyMap = new Map([
        ['A', 0],
        ['B', 0],
        ['C', 0],
        ['Other', 0] // Dedicated counter for non-standard or unclassified symbols.
    ]);

    let totalSymbolsProcessed = 0; // An explicit counter for the total number of characters in the payload.

    // Iterate through each individual symbol within the character payload
    // to update their respective frequency counts.
    // The `for...of` loop provides a cleaner iteration over string characters than a traditional `for` loop.
    for (const currentSymbolUnit of characterSegmentData) {
        totalSymbolsProcessed++; // Increment the global symbol count.
        if (symbolTallyMap.has(currentSymbolUnit)) {
            symbolTallyMap.set(currentSymbolUnit, symbolTallyMap.get(currentSymbolUnit) + 1);
        } else {
            // If the symbol is not one of the predefined 'A', 'B', 'C',
            // it contributes to the 'Other' category.
            symbolTallyMap.set('Other', symbolTallyMap.get('Other') + 1);
            // Future enhancement: could dynamically add new symbol keys to the map here.
        }
    }

    // Prepare the final analytical report object.
    // The structure is enhanced with nested objects and additional metadata for clarity.
    const analysisReportOutput = {
        status: 'success', // Indicates the successful execution of the analysis.
        processedHeaderValue: numericPrefixValue, // Renamed key for the numeric prefix.
        payloadSegmentLength: characterSegmentData.length, // Added the length of the character segment.
        totalSymbolsEncountered: totalSymbolsProcessed, // Total count of symbols processed.
        characterDistributionMetrics: { // Nested object for comprehensive distribution statistics.
            alphaOccurrences: symbolTallyMap.get('A'),
            betaOccurrences: symbolTallyMap.get('B'),
            gammaOccurrences: symbolTallyMap.get('C'),
            unclassifiedSymbols: symbolTallyMap.get('Other')
        },
        // An added derived metric: a boolean flag indicating if 'A' constitutes a significant portion of the payload.
        hasDominantAlphaPresence: (totalSymbolsProcessed > 0 && (symbolTallyMap.get('A') / totalSymbolsProcessed) > 0.25),
        // Inclusion of a timestamp provides context for when the analysis was performed.
        analysisCompletionTimestamp: new Date().toISOString()
    };

    return analysisReportOutput;
}