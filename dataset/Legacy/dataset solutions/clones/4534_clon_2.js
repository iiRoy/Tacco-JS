'use strict'; // Enforce strict mode for cleaner code execution.

// Utilize the Node.js 'fs' module to read input from standard input.
// The input is read as a UTF-8 string and then split into an array of lines.
let inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// The first line of input is parsed as an integer, representing a count.
const itemCount = +inputDataRows[0];

// The second line of input is stored as the initial string sequence.
const initialSequence = inputDataRows[1];

// A mutable variable is created to hold the string as it undergoes modifications.
let modifiedSequence = initialSequence;

// Variables to track the length of the string in successive iterations of a loop.
let prevLen = 0; // Stores the string length from the previous loop cycle.
let currLen = modifiedSequence.length; // Stores the current string length.

// This loop repeatedly removes all occurrences of "()" from the string
// until no more such pairs can be found, indicating all balanced parentheses are gone.
while (prevLen !== currLen) {
    prevLen = currLen; // Update the previous length to the current length.
    // Replace all instances of "()" with an empty string globally.
    modifiedSequence = modifiedSequence.replace(/\(\)/g, '');
    currLen = modifiedSequence.length; // Recalculate the current length after replacement.
}

// After removing all balanced pairs, this step removes all remaining ')' characters.
// The resulting string 'unmatchedClosing' will contain only unmatched '(' characters.
let unmatchedClosing = modifiedSequence.replace(/\)/g, '');

// The final output is constructed by prepending and appending parentheses
// to the original input string to make it balanced.
// The number of opening parentheses to prepend is the difference between
// the length of 'modifiedSequence' (after removing "()") and 'unmatchedClosing' (after removing all ')').
// The number of closing parentheses to append is simply the length of 'unmatchedClosing'.
console.log(
    '('.repeat(modifiedSequence.length - unmatchedClosing.length) + // Prepend necessary opening brackets.
    initialSequence + // Insert the original string.
    ')'.repeat(unmatchedClosing.length) // Append necessary closing brackets.
);
