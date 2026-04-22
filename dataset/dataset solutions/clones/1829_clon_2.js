/* This JavaScript module performs a sequence of string transformations
 * on the initial line of input received from the standard input stream.
 * It's designed to identify and replace specific character patterns within textual data. */

// Acquire the core Node.js file system interface.
// This object provides methods for interacting with the file system,
// including reading data from various sources.
const systemFileAccessor = require('node:fs');

// Define constants for the input source path and its expected character encoding.
const standardInputSourcePath = '/dev/stdin';
const characterEncodingFormat = 'utf-8';

// Statement 1:
// Read the entire content from the specified standard input path synchronously.
// The content is then decoded using the defined character encoding.
// Finally, the decoded string is divided into an array of lines,
// with each line separated by a newline character.
let rawDataCollection = systemFileAccessor
    .readFileSync(
        standardInputSourcePath, // The uniform resource identifier for the input
        characterEncodingFormat  // The byte-to-character conversion scheme
    )
    .split(
        '\n'                     // The line termination sequence
    );

// Statement 2:
// Extract the first element from the `rawDataCollection` array.
// This first line is designated as the primary text segment
// upon which all subsequent string manipulation operations will be performed.
const primaryTextSegment = rawDataCollection[0];

// Statement 3:
// Construct the first regular expression object.
// This pattern is designed to find occurrences where a '?' or 'P'
// is immediately followed by a '?' or 'D'.
// The 'g' flag ensures that all matching instances throughout the string are targeted.
const firstReplacementRegex = new RegExp(
    '[\\?|P][\\?|D]', // The actual pattern string, escaped for constructor
    'g'               // Global match flag
);

// Statement 4:
// Construct the second, simpler regular expression object.
// This pattern is specifically configured to locate every single instance
// of a literal '?' character within the text.
// The 'g' flag, as before, guarantees a global search and replacement.
const secondReplacementRegex = new RegExp(
    '\\?', // The pattern for a literal question mark
    'g'    // Global match flag
);

// Statement 5:
// Execute the core logic: a sequence of two string replacement operations.
// The result of the first replacement is immediately fed into the second.
// The final transformed string is then printed to the standard output console.
console
    .log(
        primaryTextSegment
            .replace(
                firstReplacementRegex,
                'P' + 'D' // Concatenated string literal for replacement
            )
            .replace(
                secondReplacementRegex,
                String.fromCharCode(0x44) // Character 'D' represented by its hexadecimal ASCII code
            )
    );