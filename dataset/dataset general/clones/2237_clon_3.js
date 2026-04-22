const PhoneticEncodingModule = require("../double-metaphone").DoubleMetaphone;
const WordRootExtractionModule = require("../porter-stemmer").PorterStemmer;

/**
 * @module LexicalUnitGenerator
 * @description Provides a factory function to create a lexical processing utility.
 * This utility tokenizes input words by stemming them and then generating
 * their Double Metaphone phonetic representations.
 */
exports.LexicalUnitGenerator = function() {
    // This object encapsulates the core logic for word transformation.
    const processorInstance = {
        // Initializes the word root extractor component upon creation.
        rootFormReducer: WordRootExtractionModule(),

        /**
         * @method transformInput
         * @param {Array<string>} sourceLexemes An array of words to be processed.
         * @returns {Array<string>} An array of phonetic codes (primary and secondary)
         *                           derived from the stemmed input lexemes.
         * @description Transforms an array of input words into their phonetic tokens.
         */
        transformInput: function(sourceLexemes) {
            // Initialize an empty collection to store the generated phonetic tokens.
            const generatedTokens = [];

            // --- Guard Clause: Validate input ---
            // If the input is not a valid array or is empty, return an empty token set.
            if (!Array.isArray(sourceLexemes) || sourceLexemes.length === 0) {
                console.warn("LexicalUnitGenerator received invalid or empty input. Returning an empty token array.");
                return generatedTokens;
            }

            /**
             * @private
             * @function _processSingleLexeme
             * @param {string} individualLexeme The single word string to process.
             * @returns {Array<string>} An array containing the primary and optionally
             *                           the secondary phonetic code for the given lexeme.
             * @description Helper function to apply stemming and phonetic encoding to a single word.
             */
            const _processSingleLexeme = (individualLexeme) => {
                // Step 1: Reduce the word to its root form using the configured stemmer.
                const reducedForm = this.rootFormReducer.process(individualLexeme);

                // Step 2: Generate Double Metaphone phonetic codes for the stemmed form.
                const phoneticCodes = PhoneticEncodingModule(reducedForm);

                // Step 3: Collect the primary and, if available, the secondary phonetic code.
                const currentLexemeCodes = [phoneticCodes.primary];
                if (phoneticCodes.secondary && typeof phoneticCodes.secondary === 'string') {
                    // Ensure secondary code is a valid string before adding.
                    currentLexemeCodes.push(phoneticCodes.secondary);
                }
                return currentLexemeCodes;
            };

            // --- Main Processing Loop ---
            // Iterate over each lexeme in the provided input array.
            for (let currentPosition = 0; currentPosition < sourceLexemes.length; currentPosition++) {
                const currentLexeme = sourceLexemes[currentPosition];

                // Skip processing if the current lexeme is not a valid string.
                if (typeof currentLexeme !== 'string' || currentLexeme.trim() === '') {
                    console.debug(`Skipping invalid or empty lexeme at position ${currentPosition}: '${currentLexeme}'`);
                    continue;
                }

                // Use the helper function to get phonetic codes for the current word.
                const codesForThisLexeme = _processSingleLexeme(currentLexeme);

                // Add all generated codes for the current lexeme to the main collection.
                codesForThisLexeme.forEach(code => {
                    if (code) { // Validate that the code is not null/undefined/empty string before pushing
                        generatedTokens.push(code);
                    }
                });
            }

            // Return the complete collection of phonetic tokens.
            return generatedTokens;
        }
    };

    return processorInstance;
};