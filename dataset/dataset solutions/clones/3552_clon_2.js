'use strict'; // Enforce strict JavaScript parsing and execution.

/**
 * This function processes a given text input to determine if a sequence of words
 * forms a valid chain according to specific rules.
 * Rules:
 * 1. Each word in the sequence must be unique (no duplicates).
 * 2. The last character of a word must match the first character of the subsequent word.
 *
 * @param {string} rawInputData The raw string input, where the first line is typically a count
 *                               (which is ignored), and subsequent lines are the words.
 */
const executeProgramLogic = ( rawInputData ) => {

    // Parse the input data: split by newline and remove the initial line (often a count).
    const wordSequence = rawInputData . split ( '\n' ) . slice ( 1 ) ;

    // Initialize a variable to store the final character of the previously processed word.
    // It's set to null initially as there's no previous word for the very first word.
    let previousEndingChar = null ;

    // Create an object to act as a hash map (or set) to keep track of words already encountered.
    // This helps in quickly checking for duplicate words.
    const seenWordsMap = { } ;

    // A boolean flag to maintain the validity status of the word chain.
    // It's optimistically set to true and changed to false upon any rule violation.
    let allConditionsMet = true ;

    // Iterate through each word in the extracted sequence.
    wordSequence . forEach ( currentPhrase => {
        // Check if the current word has been seen before.
        if ( typeof seenWordsMap[ currentPhrase ] !== 'undefined' ) {
            allConditionsMet = false ; // If it's a duplicate, the chain is invalid.
        }

        // Get the very first character of the current word.
        const currentStartChar = currentPhrase . substring ( 0 , 1 ) ;

        // Get the very last character of the current word.
        const currentEndChar = currentPhrase . substring ( currentPhrase.length - 1 ) ;

        // Validate the character linkage:
        // If this isn't the first word (previousEndingChar is not null)
        // AND the previous word's ending char doesn't match the current word's starting char,
        // then the chain is invalid.
        if ( previousEndingChar !== null && previousEndingChar !== currentStartChar ) {
            allConditionsMet = false ; // Character mismatch, invalid chain.
        }

        // Update the 'previousEndingChar' for the next iteration with the current word's ending character.
        previousEndingChar = currentEndChar ;

        // Mark the current word as seen in the hash map. The value `true` simply indicates presence.
        seenWordsMap[ currentPhrase ] = true ;
    } ) ;

    // Based on the final state of `allConditionsMet`, print the result.
    console . log ( allConditionsMet ? 'Yes' : 'No' ) ;
} ;

// A configuration flag to switch between development/testing mode and production mode.
const isDebuggingActive = false ;

// Conditional block to execute the program logic.
if ( isDebuggingActive ) {
    // In debugging mode, predefined test cases are used.
    executeProgramLogic ( '4\nhoge\nenglish\nhoge\nenigma' ) ;
    executeProgramLogic ( '9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly' ) ;
} else {
    // In production mode, input is read asynchronously from standard input (stdin).
    executeProgramLogic ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
}