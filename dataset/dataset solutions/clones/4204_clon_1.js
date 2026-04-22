/*
 * This file contains a JavaScript program designed to process a string input
 * from standard input. It checks if the input string conforms to a specific
 * pattern related to the word "AKIHABARA" and outputs "YES" or "NO" accordingly.
 *
 * The regular expression used for matching is constructed to handle optional
 * characters, making the pattern flexible.
 *
 * Developer: AI Assistant
 * Date Created: 2023-10-27
 * Version: 1.0.0
 */

// Enforce strict mode for cleaner code and better error handling.
'use strict' ;


    let    input     =     require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ;


// Remove any leading or trailing whitespace from the input string.
input    =    input . trim ( ) ;


/*
 * The core logic involves matching the processed input against a regular expression.
 * This specific regex pattern is designed to identify variations of "AKIHABARA".
 *
 * Breakdown of the regex: /^A?KIHA?BA?RA?/:
 * - '^': Asserts the position at the start of the string. The match must begin here.
 * - 'A?': Matches the character 'A' zero or one time (it's optional).
 * - 'K': Matches the character 'K' exactly once.
 * - 'I': Matches the character 'I' exactly once.
 * - 'H?': Matches the character 'H' zero or one time (it's optional).
 * - 'B?': Matches the character 'B' zero or one time (it's optional).
 * - 'R?': Matches the character 'R' zero or one time (it's optional).
 * - 'A?': Matches the character 'A' zero or one time (it's optional).
 *
 * This pattern allows for strings like "AKIBA", "AKIHABARA", "AKIHABAR", "AKIHARA", etc.,
 * as long as they start with the specified sequence and optional characters are correctly placed.
 */
let    ans    =    input . match ( /^A?KIHA?BA?RA?/)    ?    "YES"    :    "NO"    ;


// Print the determined answer ("YES" or "NO") to the standard output.
console . log ( ans ) ;