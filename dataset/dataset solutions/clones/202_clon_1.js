/*
 * This JavaScript file performs a specific string manipulation task.
 * It reads input, then systematically swaps occurrences of two words.
 *
 * Author: Automated Clone Generator
 * Date: 2023-10-27
 * License: Public Domain (for this clone example)
 *
 * This implementation adheres strictly to Type I clone definitions,
 * meaning only whitespace and comments have been altered from the original.
 */


// Declare a variable 'input' and initialize it by reading from standard input.
// The 'fs' module is used for file system operations.
// The read data is expected to be UTF-8 encoded and is then trimmed.
var      input      =      require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;


// The following three lines perform a word swap operation.
// This is a common pattern to swap two values without temporary storage,
// but here it's applied to string replacement.

/*
 * Step 1: Temporarily rename all instances of 'peach' to 'xxxxxx'.
 * This intermediate step is crucial to prevent unintended replacements
 * when 'apple' is later changed to 'peach'.
 */
input      =      input . replace ( /peach/g , 'xxxxxx' ) ;


// A blank line for visual separation.


/*
 * Step 2: Replace all instances of 'apple' with 'peach'.
 * At this point, original 'apple's are now 'peach's.
 * Original 'peach's are still 'xxxxxx's.
 */
input      =      input . replace ( /apple/g , 'peach' ) ;


// Another blank line just for styling.


/*
 * Step 3: Finally, replace all instances of the temporary 'xxxxxx' back to 'apple'.
 * This completes the effective swap: all original 'peach's are now 'apple's.
 */
input      =      input . replace ( /xxxxxx/g , 'apple' ) ;


// After all replacements are done, print the final modified string to the console.
// This is the output of the script.
console . log ( input ) ;

// End of JavaScript code.