// This module defines a primary routine for processing character sequence data.

/**
 * Executes the main workflow for analyzing an incoming text string.
 * It determines if specific characters ('a', 'b', 'c') appear exactly once.
 * @param {string} rawData - The raw input string to be processed.
 */
function processInputData(
    rawData
) {
    // Trim any leading or trailing whitespace from the raw input string.
    let processedData = rawData
        .trim();

    /*
     * Deconstruct the cleaned string into an ordered collection
     * of individual characters. This allows for easier iteration
     * and pattern matching on the sequence of symbols.
     */
    let symbolList = processedData
        .split(
            ''
        );

    // Calculate the total occurrences of the character 'a' within the sequence.
    // If no matches are found, an empty array is used to prevent errors when accessing .length.
    let alphaCount = (
            symbolList
            .join('') // Convert array back to a contiguous string for regex matching
            .match(
                /a/g
            ) || []
        )
        .length;

    // Determine the frequency of the character 'b' in the processed symbol list.
    let betaCount = (
            symbolList
            .join('')
            .match(
                /b/g
            ) || []
        )
        .length;

    // Ascertain how many times the character 'c' appears within the character sequence.
    let gammaCount = (
            symbolList
            .join('')
            .match(
                /c/g
            ) || []
        )
        .length;

    // Based on the counts, log an 'Affirmative' or 'Negative' response to the console.
    // The condition requires each specific character ('a', 'b', 'c') to appear exactly once.
    console
        .log(
            (
                alphaCount === 1 &&
                betaCount === 1 &&
                gammaCount === 1
            ) ?
            'Affirmative' :
            'Negative'
        );
}

// Initiate the data processing pipeline.
// Reads UTF-8 encoded content from the standard input stream ('/dev/stdin')
// and passes it to our primary processing function.
processInputData(
    require('fs')
    .readFileSync(
        '/dev/stdin',
        'utf8'
    )
);