/*
 * This JavaScript module's primary function is to process character strings.
 * Its specific task involves identifying and quantifying "JOI" sequences.
 *
 * A "JOI" sequence is formally defined as:
 *  - A contiguous block of one or more 'J' characters,
 *  - Immediately succeeded by a contiguous block of one or more 'O' characters,
 *  - Which is, in turn, immediately succeeded by a contiguous block of one or more 'I' characters.
 *
 * The 'length' of any given "JOI" sequence is determined by the smallest count
 * among its 'J', 'O', and 'I' constituent segments.
 * For example:
 *  - In "JJJOOII", the 'J' segment has 3 chars, 'O' has 2, 'I' has 2.
 *    The sequence length is min(3, 2, 2), which evaluates to 2.
 *  - In "JOI", the length is min(1, 1, 1) = 1.
 *  - In "JJJJJOOOOII", the length is min(5, 4, 2) = 2.
 *
 * The ultimate objective of this program is to compute and output the
 * highest "JOI" sequence length discovered across the entirety of the input string.
 */


// Step 1: Initialize environment and acquire input.
// We import the Node.js 'fs' (File System) core module.
// Then, synchronously read the complete content from the standard input stream ('/dev/stdin').
// The data is interpreted and stored as a 'utf8' encoded string.
var   input   =   require('fs').readFileSync('/dev/stdin', 'utf8')   ;


// Step 2: Pre-process the input string.
// Standard input often includes extraneous whitespace, such as newline characters.
// The .trim() method removes any leading or trailing whitespace characters.
// The result is assigned back to the 'str' variable for further processing.
var   str   =   input.trim()   ;


// Step 3: Initialize the maximum length tracker.
// 'max' is a variable that will hold the greatest "JOI" sequence length identified.
// It is set to an initial value of 0, as no sequences have been processed yet.
var   max   =   0   ;


// Step 4: Iterate and analyze the string for "JOI" patterns.
// The String.prototype.replace() method is employed here.
// It uses a Regular Expression `/(J+)(O+)(I+)/g` to locate all occurrences of the pattern.
//   - `(J+)` : Captures one or more 'J's (group 1).
//   - `(O+)` : Captures one or more 'O's (group 2).
//   - `(I+)` : Captures one or more 'I's (group 3).
//   - `g`    : Global flag, ensuring all matches are found.
// For each match, an anonymous callback function is executed.
//   - `s`   : The full matched substring (e.g., "JJJOOII").
//   - `s1`  : The content of the first capturing group (e.g., "JJJ").
//   - `s2`  : The content of the second capturing group (e.g., "OO").
//   - `s3`  : The content of the third capturing group (e.g., "II").
str   =   str.replace(/(J+)(O+)(I+)/g,   function   ( s ,   s1 ,   s2 ,   s3 )
{

    // Inside the callback:
    // Calculate 'min', the length of the current "JOI" sequence.
    // This is the minimum length among the J, O, and I segments.
    var   min   =   Math.min(s1.length,s2.length,s3.length)   ;

    // Update the global 'max' variable.
    // If the 'min' length of the current sequence is greater than the
    // currently recorded 'max', then 'max' is updated to this new value.
    max   =   Math.max(max,min)   ;

    // It is critical to return the original matched string 's'.
    // This prevents the `str` variable from being modified by the `replace` operation.
    // The `replace` method is used here solely for its iterative matching capability,
    // not to alter the string content.
    return   s   ;

} ) ;


// Step 5: Output the final result.
// After the entire string has been thoroughly processed and all "JOI" sequences
// have been analyzed, the final computed 'max' value is printed to the console.
console.log(max)   ;