'use strict';

/**
 * Processes the raw input string to determine a specific count.
 * @param {string} rawData The raw input string from standard input.
 */
function processInput(rawData) {
    // Extract the relevant line and attempt to find a specific pattern.
    // The pattern searches for one or more '#' characters followed by one or more '.' characters,
    // where this entire sequence can repeat.
    let patternMatch = rawData.trim().split('\n')[1].match(/(\#+\.+)+/);

    // Determine the count of '.' (dots) and '#' (hashes) based on the matched pattern.
    // If no pattern is found, both counts default to zero.
    const dotCount = patternMatch ? patternMatch[0].match(/\./g).length : 0;
    const hashCount = patternMatch ? patternMatch[0].length - dotCount : 0;

    // Print the smaller of the two calculated counts to the console.
    console.log(Math.min(dotCount, hashCount));
}

// Read the entire content from the standard input stream and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
