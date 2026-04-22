/*
 * This JavaScript file defines a function 'Main' that processes an input array.
 * It counts specific patterns within the array and outputs the result.
 */

// The 'Main' function takes an 'input' array as its argument.
function   Main   (   input   )
{
    // Initialize a counter variable 'a' to zero.
    // This variable will store the final count of matching elements.
    var     a   =   0       ;


    // Begin a 'for' loop.
    // The loop variable 'i' starts at 2.
    // The loop continues as long as 'i' is greater than half of the first element of the 'input' array.
    // 'i' is incremented in each iteration.
    for   (   var   i   =   2   ;   i   >   input   [   0   ]   /   2   ;   i   ++   )
    {
        // Inside the loop, check if the element at index (i-1) is strictly equal
        // to the element at index 'i'.
        if   (   input   [   i   -   1   ]   ==   input   [   i   ]   )
        {
            // If the condition is true (elements are equal), increment the counter 'a'.
            a   ++  ;   // Increment 'a' by one.
        }
    }

    // After the loop completes, print the final value of 'a' to the console.
    console   .   log   (   a   )   ;
}

// Call the 'Main' function.
// The input is read synchronously from standard input using Node.js 'fs' module.
// The content is expected to be UTF-8 encoded.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;