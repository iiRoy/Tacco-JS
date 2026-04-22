'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Expert module for analyzing word chain integrity.
 * This function processes a block of text to determine if a sequence of words
 * forms a valid chain based on specific rules.
 *
 * Rules for a valid chain:
 * 1. No word (lexeme) is allowed to be repeated within the sequence.
 * 2. For every word after the first one, its initial character must exactly match
 *    the final character of the immediately preceding word.
 * 3. The first line of the input text is always disregarded, as it's typically
 *    a count or metadata not relevant to the word chain itself.
 *
 * @param {string} sourceText - The raw input string, expected to contain multiple
 *                              lines of text, with each line representing a word.
 */
const analyzeWordChainIntegrity = (sourceText) => {
    // --- Input Validation and Preprocessing ---

    // Basic validation: ensure the input is a non-empty string.
    if (typeof sourceText !== 'string' || sourceText.length === 0) {
        console.error('Processing Aborted: Input data must be a non-empty string.');
        return; // Exit the function early if the input is invalid.
    }

    // Split the entire input string into an array of individual lines.
    const allInputLines = sourceText.split('\n');

    // Discard the first line of input as per the problem specification (often a count).
    // Additionally, filter out any lines that are empty or contain only whitespace,
    // ensuring we only process actual words (lexemes).
    const relevantLexemes = allInputLines.slice(1).filter(line => line.trim().length > 0);

    // --- State Initialization for Chain Evaluation ---

    // This variable will store the last character of the word that was just processed.
    // It's initialized to null to indicate that no word has been processed yet.
    let priorWordEndingCharacter = null;

    // A Set is used here for efficient tracking of all words encountered so far.
    // Using a Set allows for quick O(1) average-case lookups to detect duplicates.
    const encounteredLexemeSet = new Set();

    // This boolean flag will track the overall integrity of the word chain.
    // It is initially true and will be set to false if any rule is violated.
    let chainEvaluationResult = true;

    // --- Lexeme Iteration and Rule Checking ---

    // Iterate through each relevant word (lexeme) in the sequence.
    // A `for...of` loop is chosen here for its clarity when iterating over iterable objects
    // and for potential future optimizations like `break` (though not used for early exit here,
    // to maintain the original's full iteration behavior).
    for (const currentLexeme of relevantLexemes) {
        // If the chain has already been determined to be invalid, we can technically
        // skip further detailed checks for subsequent words. However, to closely
        // mirror the original code's behavior of processing all items even after a failure,
        // we'll just `continue` to the next lexeme if the flag is already false,
        // rather than breaking the loop entirely.
        if (!chainEvaluationResult) {
            continue;
        }

        // Rule 1: Check for word repetition.
        // If the current word has already been added to our set of encountered words,
        // it means a duplicate has been found, and the chain is invalid.
        if (encounteredLexemeSet.has(currentLexeme)) {
            chainEvaluationResult = false;
            continue; // Move to the next word, no need for further checks on this one.
        }

        // Robustness check: Ensure the current word is not empty before trying to access its characters.
        // An empty word cannot participate in a valid chain link.
        if (currentLexeme.length === 0) {
            chainEvaluationResult = false;
            continue;
        }

        // Extract the first and last characters of the current word.
        // Using `charAt()` for potentially better handling of Unicode characters compared to bracket notation.
        const currentLexemeInitialCharacter = currentLexeme.charAt(0);
        const currentLexemeFinalCharacter = currentLexeme.charAt(currentLexeme.length - 1);

        // Rule 2: Check the linking condition.
        // This check applies only if it's not the very first word being processed.
        // The `priorWordEndingCharacter` being `null` signifies the first word.
        const isFirstLexemeInSequence = (priorWordEndingCharacter === null);

        if (!isFirstLexemeInSequence) {
            // If it's not the first word, compare its starting character with the previous word's ending character.
            const doesNotLinkCorrectly = (priorWordEndingCharacter !== currentLexemeInitialCharacter);
            if (doesNotLinkCorrectly) {
                chainEvaluationResult = false;
                continue; // Move to the next word, as this link is broken.
            }
        }

        // --- State Update for Next Iteration ---

        // Update the `priorWordEndingCharacter` to the final character of the current word.
        // This prepares for the check of the next word in the sequence.
        priorWordEndingCharacter = currentLexemeFinalCharacter;

        // Add the current word to the set of encountered words to track for duplicates.
        encounteredLexemeSet.add(currentLexeme);
    }

    // --- Final Output ---

    // Based on the final `chainEvaluationResult`, print the outcome.
    console.log(chainEvaluationResult ? 'Sequence OK' : 'Sequence FAILED');
};

// --- Execution Environment Configuration ---

// A configurable flag to determine whether to execute predefined test cases
// or to read live input from the standard input stream.
const shouldRunTestScenarios = false; // Set to `true` to enable test mode.

if (shouldRunTestScenarios) {
    // --- Predefined Test Cases ---

    console.log('--- Running Test Scenario 1 (Duplicate Word) ---');
    // Expected Outcome: Sequence FAILED (due to 'hoge' repetition)
    analyzeWordChainIntegrity('4\nhoge\nenglish\nhoge\nenigma');

    console.log('\n--- Running Test Scenario 2 (Valid Chain) ---');
    // Expected Outcome: Sequence OK (all links are valid, no repeats)
    analyzeWordChainIntegrity('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');

    console.log('\n--- Running Test Scenario 3 (Invalid Link) ---');
    // Expected Outcome: Sequence FAILED ('apple' ends with 'e', 'egg' starts with 'e', but 'grape' starts with 'g')
    analyzeWordChainIntegrity('3\napple\negg\ngrape');

    console.log('\n--- Running Test Scenario 4 (Empty Input String) ---');
    // Expected Outcome: Error message, then early return.
    analyzeWordChainIntegrity('');

    console.log('\n--- Running Test Scenario 5 (Only Count Line, No Words) ---');
    // Expected Outcome: Sequence OK (no words to violate rules, so it remains valid)
    analyzeWordChainIntegrity('1\n');

    console.log('\n--- Running Test Scenario 6 (Single Valid Word) ---');
    // Expected Outcome: Sequence OK (a single word cannot violate chaining rules)
    analyzeWordChainIntegrity('1\nhello');

} else {
    // --- Production Mode: Read from Standard Input ---
    try {
        // Attempt to read the entire content from `/dev/stdin` (standard input).
        // The input is expected to be UTF-8 encoded.
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        analyzeWordChainIntegrity(standardInputContent);
    } catch (ioError) {
        // Handle potential errors during file system operations (e.g., file not found, permissions).
        console.error('An error occurred while reading from standard input:', ioError.message);
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }
}