// This utility module is responsible for acquiring data from standard input and
// subsequently processing it into structured textual components.
const fileSystemInterface = require('fs');

// Configuration constants for word processing rules.
const MINIMUM_PHRASE_UNIT_LENGTH = 3; // Smallest acceptable length for a word part
const MAXIMUM_PHRASE_UNIT_LENGTH = 6; // Largest acceptable length for a word part
const SENTENCE_TERMINATOR_CHARACTER = '.'; // Character indicating a potential phrase boundary
const WHITESPACE_REGEX_SPLITTER = /\s+/; // Regular expression to split input by one or more spaces
const COMMA_REMOVAL_REGEX = /,/g; // Regular expression to target and remove all commas

/**
 * Validates if a given text segment (potentially ending with a period) meets the defined
 * length criteria after removing any trailing punctuation.
 * @param {string} textSegment - The string token to evaluate.
 * @returns {boolean} True if the segment's effective length is within the allowed range, false otherwise.
 */
function checkEffectiveSegmentLength(textSegment) {
    let contentWithoutTrailingPunctuation = textSegment;
    // If the segment ends with our defined terminator, remove it for length calculation.
    if (textSegment.endsWith(SENTENCE_TERMINATOR_CHARACTER)) {
        contentWithoutTrailingPunctuation = textSegment.slice(0, -1);
    }
    const actualSegmentLength = contentWithoutTrailingPunctuation.length;
    return actualSegmentLength >= MINIMUM_PHRASE_UNIT_LENGTH && actualSegmentLength <= MAXIMUM_PHRASE_UNIT_LENGTH;
}

// Read the complete raw input from the standard input stream using UTF-8 encoding.
let rawStreamData = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Perform initial sanitization: remove all commas, trim any leading/trailing whitespace,
// and then split the cleaned string into an array of individual lexical tokens.
let sanitizedInputString = rawStreamData.replace(COMMA_REMOVAL_REGEX, '').trim();
let lexicalTokens = sanitizedInputString.split(WHITESPACE_REGEX_SPLITTER);

// Prepare storage for the final coherent phrases and a temporary buffer for current phrase construction.
const coherentPhraseCollection = [];
let currentPhraseAccumulator = []; // An array is used for efficient word accumulation before joining.

// Iterate over each token to build and segment the phrases.
for (let tokenIterator = 0; tokenIterator < lexicalTokens.length; tokenIterator++) {
    const activeToken = lexicalTokens[tokenIterator];

    // Skip any empty tokens that might have resulted from multiple delimiters.
    if (activeToken.length === 0) {
        continue;
    }

    const tokenContainsTerminator = activeToken.includes(SENTENCE_TERMINATOR_CHARACTER);
    const terminatorIsAtEnd = activeToken.endsWith(SENTENCE_TERMINATOR_CHARACTER);

    // Logic branch for tokens that potentially include a sentence terminator.
    if (tokenContainsTerminator) {
        // If the token (excluding any trailing terminator) meets length requirements.
        if (checkEffectiveSegmentLength(activeToken)) {
            // If the terminator is at the very end, this marks the completion of a phrase.
            if (terminatorIsAtEnd) {
                // Add the token (without its trailing terminator) to the buffer.
                currentPhraseAccumulator.push(activeToken.slice(0, -1));
                // Finalize the current phrase by joining its parts and store it.
                coherentPhraseCollection.push(currentPhraseAccumulator.join(' '));
                currentPhraseAccumulator = []; // Reset the buffer for the next phrase.
            } else {
                // If the terminator is internal, the token is just another part of the current phrase.
                currentPhraseAccumulator.push(activeToken);
            }
        } else {
            // If a token with a terminator doesn't meet length criteria, any buffered parts
            // should be finalized as an incomplete phrase before resetting the buffer.
            if (currentPhraseAccumulator.length > 0) {
                 coherentPhraseCollection.push(currentPhraseAccumulator.join(' '));
            }
            currentPhraseAccumulator = []; // Clear buffer as this token doesn't fit.
        }
    } else {
        // Logic branch for tokens that do not contain a sentence terminator.
        // Check if the token's length meets the general criteria.
        if (checkEffectiveSegmentLength(activeToken)) {
            currentPhraseAccumulator.push(activeToken); // Add to the current phrase buffer.
        } else {
            // If a regular word doesn't meet length criteria, any buffered parts
            // should be finalized as an incomplete phrase before resetting the buffer.
            if (currentPhraseAccumulator.length > 0) {
                 coherentPhraseCollection.push(currentPhraseAccumulator.join(' '));
            }
            currentPhraseAccumulator = []; // Clear buffer.
        }
    }
}

// After processing all tokens, check if there's any content remaining in the buffer.
// If so, it represents a final, un-terminated phrase.
if (currentPhraseAccumulator.length > 0) {
    coherentPhraseCollection.push(currentPhraseAccumulator.join(' '));
}

// Output each of the successfully constructed phrases to the console.
for (let outputIterator = 0; outputIterator < coherentPhraseCollection.length; outputIterator++) {
    console.log(coherentPhraseCollection[outputIterator]);
}