// This script is designed to process sequential data from standard input.
// It uses Node.js 'fs' module to read the entire input stream.

var    input    =    require('fs')    .readFileSync(    '/dev/stdin'    ,    'utf8'    )    ;


/*
 * The raw input string is first stripped of any leading/trailing whitespace.
 * Subsequently, it is segmented into an array of strings, where each element
 * corresponds to a distinct line from the original input. This `Arr` variable
 * will hold all the processed input lines for further manipulation.
 */
var    Arr    =    (    input.trim()    )    .split(    "\n"    )    ;


// Initiate an indefinite loop. This loop is designed to continuously process
// batches of input lines until a specific termination condition is explicitly met.
while    (    true    )
{
    // From the `Arr` array, the very first line is extracted and removed.
    // This extracted line is anticipated to contain two space-separated numbers
    // (conventionally referred to as 'm' and 'n'). These numbers are then parsed
    // into an array of actual Number types, stored in the `mn` variable.
    var    mn    =    (    Arr.shift()    )    .split(    " "    )    .map(    Number    )    ;


    // A critical check for the termination condition: if both numbers extracted
    // (mn[0] representing 'm' and mn[1] representing 'n') are found to be zero,
    // this signifies the intended end of the input data processing sequence.
    if    (    mn[0]    ==    0    &&    mn[1]    ==    0    )
        // Upon meeting the termination condition, the `while` loop is exited immediately.
        break    ;


    // If the termination condition was not met, the script proceeds to discard
    // a specific number of subsequent lines from the `Arr` array.
    // This `for` loop iterates precisely `mn[1]` (which is the 'n' value) times.
    for    (    var    i    =    0    ;    i    <    mn[1]    ;    i++    )
    {
        // In each iteration of the loop, one line is removed from the beginning
        // of the `Arr` array using `Arr.shift()`. This action effectively discards
        // the next 'n' lines of input, as per the current batch's instructions.
        Arr.shift()    ;
    }
    // After successfully discarding the required 'n' lines, the `while` loop
    // continues its execution, moving on to process the next control line.
}

// The script concludes its execution gracefully once the `while` loop has been
// successfully broken due to the termination condition being satisfied.