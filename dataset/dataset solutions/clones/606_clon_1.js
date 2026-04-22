/*
 * This script processes a string from standard input to find
 * the maximum length of a specific pattern.
 *
 * It looks for sequences like "J...JO...OI...I" where the number
 * of 'J's and 'I's must be at least as many as 'O's.
 * The goal is to find the maximum length of the 'O' part
 * that satisfies this condition.
 */

// Import the Node.js 'fs' module for file system operations.
var        input        =        require (    'fs'    )    .    readFileSync (    '/dev/stdin'    ,    'utf8'    )        ;

// Remove any leading or trailing whitespace from the raw input string.
var        str        =        input    .    trim (    )        ;

// Initialize the 'max' variable, which will store the greatest
// 'O' sequence length found conforming to the rules.
var        max        =        0        ;

// The core logic: use String.prototype.replace with a regular expression.
// The regex `/(J+)(O+)(I+)/g` captures one or more 'J's, 'O's, and 'I's.
// The 'g' flag ensures all occurrences are processed, not just the first.
str        =        str    .    replace (    /(J+)(O+)(I+)/g    ,    function (    s    ,    s1    ,    s2    ,    s3    )    {

        // 's' is the full matched string (e.g., "JJJOOII")
        // 's1' is the first captured group (e.g., "JJJ")
        // 's2' is the second captured group (e.g., "OO")
        // 's3' is the third captured group (e.g., "II")

        // Initialize 'min' for the current match.
        // This will hold the length of s2 if the conditions are met.
        var        min        =        0        ;

        // Check the condition:
        // The length of 'J's (s1) must be >= length of 'O's (s2)
        // AND the length of 'I's (s3) must be >= length of 'O's (s2).
        if    (    s1    .    length    >=    s2    .    length    &&    s3    .    length    >=    s2    .    length    )
        {
                // If the condition is true, the 'O' sequence length (s2.length)
                // is a valid candidate for 'min'.
                min        =        s2    .    length        ;
        }

        // Update the global maximum 'max' if 'min' is greater.
        max        =        Math    .    max (    max    ,    min    )        ;

        // Return the original matched string 's'.
        // This makes the `replace` operation effectively a `forEach` for matches
        // as it doesn't change the original string 'str' content.
        return        s        ;
}    )        ;

// Finally, print the computed maximum value to the console.
console    .    log (    max    )        ;