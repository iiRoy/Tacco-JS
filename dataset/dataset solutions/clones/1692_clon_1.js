// This script processes input from standard input to count occurrences of specific strings.

// Begin by importing the necessary 'fs' module for file system operations.
// The input is read synchronously from '/dev/stdin', decoded as 'utf8',
// and then split into an array of strings based on newline characters.
// The first line is assigned to 'n' (though not used further in this snippet),
// and all subsequent lines are collected into the 'ss' array using the rest parameter.
const   [   n   ,   ...ss   ]    =    require ( 'fs' )   .   readFileSync ( '/dev/stdin' ,   'utf8' )   .   split (   / \n /   )   ;



// Initialize an empty object named 'result'. This object will store
// the frequency count for each unique string encountered in the input.
const    result    =    { }    ;


// Iterate through each string 's' present in the 'ss' array.
for    (    const    s    of    ss    )
{
    // For each string 's', update its count in the 'result' object.
    // If 's' has not been encountered before, 'result[s]' will be undefined,
    // so 'result[s] || 0' evaluates to 0, effectively initializing its count.
    // Then, the count is incremented by 1.
    result   [   s   ]    =    (    result   [   s   ]    ||    0    )    +    1    ;
} // End of the first loop, which populates the 'result' object with counts.


// Now, iterate over a predefined array of status codes.
// These codes are 'AC', 'WA', 'TLE', and 'RE'.
for    (    const    k    of    [   'AC'   ,   'WA'   ,   'TLE'   ,   'RE'   ]    )
{
    // For each status code 'k', print a formatted string to the console.
    // The output format is "CODE x COUNT", where CODE is the current status code 'k',
    // and COUNT is its corresponding frequency obtained from the 'result' object.
    // If a status code 'k' was not found in the input, 'result[k]' will be undefined,
    // and JavaScript's template literal will render 'undefined' for the count.
    console   .   log   (   ` ${ k }    x    ${ result [ k ] } `   )   ;
} // End of the second loop, which handles the final output.