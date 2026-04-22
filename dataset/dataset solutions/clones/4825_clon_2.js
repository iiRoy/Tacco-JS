function processInputData(rawData) {
    /*
     * This utility function takes a string and returns a new string
     * with its characters in reverse order.
     * @param {string} textSegment - The string to be processed.
     * @returns {string} The character-reversed string.
     */
    const flipStringContents = (textSegment) => {
        return textSegment
            .split('')   // Convert the string into an array of individual characters.
            .reverse()   // Reverse the order of elements in the character array.
            .join('');   // Join the characters back into a single string.
    };

    // Define a collection of specific terms and preprocess them by reversing each one.
    // This preparation facilitates matching when working with a reversed target string.
    const keyPhrases = ['dream', 'dreamer', 'erase', 'eraser'].map(flipStringContents);

    // Take the initial line of the raw input data, and then reverse its contents.
    // This becomes the primary string against which patterns will be matched.
    const processedTargetString = flipStringContents(rawData.split('\n')[0]);

    // Initialize a numerical pointer that will track the current examination point
    // within the `processedTargetString`.
    let currentScanPosition = 0;

    // Begin an iterative process that continues indefinitely until an explicit break.
    for (;;) {
        // Search through the `keyPhrases` to find the first one that matches
        // the beginning of `processedTargetString` at the `currentScanPosition`.
        let identifiedPattern = keyPhrases.find((patternCandidate) =>
            processedTargetString.startsWith(patternCandidate, currentScanPosition)
        );

        // If no matching pattern is found during this iteration, the loop must terminate.
        if (identifiedPattern === undefined) {
            break;
        }

        // If a pattern was successfully identified, advance the `currentScanPosition`
        // by the total character count of the matched pattern.
        currentScanPosition += identifiedPattern.length;
    }

    // After the scanning loop concludes, compare the final scan position
    // with the total length of the `processedTargetString`.
    if (processedTargetString.length === currentScanPosition) {
        console.log('YES'); // Output 'YES' if the entire string was successfully covered by patterns.
    } else {
        console.log('NO');  // Otherwise, output 'NO' indicating incomplete coverage.
    }
}

// Execute the main data processing function.
// It reads all content from standard input, converts it to UTF-8 text,
// and passes it as the raw data for processing.
processInputData(
    require('node:fs')
        .readFileSync('/dev/stdin', 'utf8')
);