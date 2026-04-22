// This script processes input from standard input to count occurrences of a specific word.
// It demonstrates basic file I/O, array manipulation, and functional programming concepts in JavaScript.

/**
 * Reads all content from standard input (/dev/stdin),
 * decodes it as UTF-8, and then splits it into an array of lines.
 * Each element in the returned array represents one line from the input.
 *
 * @returns {Array<string>} An array of strings, where each string is a line from stdin.
 */
function   stdin   (      )
{
    // Utilize the Node.js 'fs' module to access the file system.
    // readFileSync is used for synchronous file reading.
    var    stdin    =    require (  "fs"  )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )    ;

    // Split the entire input string by newline characters.
    // The regular expression /\n\r?/ handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    return    stdin   .   split   (   /   \n   \r   ?   /   )    ;

}


// --- Main Program Execution Flow ---

// Call the stdin function to retrieve the processed input lines.
// The result is temporarily stored in 'tmp'.
var    tmp    =    stdin   (   )   ,

    // 'W' is assigned the first element of the 'tmp' array.
    // This typically represents the "word to search for" or a key value.
    W    =    tmp   [   0   ]   ,

    // 'T' is assigned a slice of the 'tmp' array, starting from the second element.
    // This effectively gives us all input lines *after* the first one, which contain the data to be searched.
    T    =    tmp   .   slice   (   1   )    ;


// Output the final computed count to the console.
// The Array.prototype.reduce method is used here to iterate over the 'T' array
// and accumulate a sum based on the processing of each line.
console   .   log   (   T   .   reduce   (   function   (   sum   ,   line   )   {

    // For each 'line' in the 'T' array, first split it into individual words.
    // Words are separated by a single space character.
    line    =    line   .   split   (   '   '   )    ;

    // This loop efficiently counts and removes all occurrences of 'W' within the current 'line'.
    // line.indexOf(W) returns the index of the first occurrence, or -1 if not found.
    // Adding 1 makes the condition true (non-zero) if 'W' is found, and false (zero) if not.
    while   (   line   .   indexOf   (   W   )   +   1   )   {
        // Increment the 'sum' each time 'W' is found.
        sum   ++   ;
        // Remove the found instance of 'W' from the 'line' array.
        // This is crucial to prevent counting the same word multiple times in the same position.
        line   .   splice   (   line   .   indexOf   (   W   )   ,   1   )
    }

    // Return the updated 'sum' to be carried over to the next iteration of the reduce function.
    return   sum   ;

},   0   )   )   ; // The initial value for the 'sum' accumulator is set to 0.

// End of script.