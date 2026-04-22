/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input data to calculate a specific result.
 * Original logic is preserved exactly.
 *
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 */

// Define the main function that takes an input string 's'.
function    Main(s)
{
    // Process the input string:
    // 1. Split it by newline characters to get an array of string numbers.
    // 2. Map each string number to an actual number using the unary plus operator.
    s   =   s   .   split   (   "\n"   )   .   map   (   a   =>   +a   )   ;

    // Declare a variable 'n' and initialize it with the first element of the processed array.
    var     n   =   s   [   0   ]   ;

    // Check a specific condition on the second element of the array (s[1]).
    // If s[1] is not strictly equal to zero, an error condition is met.
    if  (   s   [   1   ]   !==   0   )
    {
        console     .   log   (   -1   )   ;   // Output the error code as per requirements.
        return      ;                       // Exit the function immediately.
    }

    // Initialize an accumulator variable 'ans' to zero. This will store the final result.
    var     ans     =   0   ;

    // Begin a loop that iterates from 'n' down to 2 (exclusive of 1).
    // The loop variable 'i' represents an index in the 's' array.
    for     (   var     i   =   n   ;   i   >   1   ;   i--   )
    {
        // Inside the loop, check a specific relationship between elements s[i] and s[i-1].
        // If s[i] is exactly one greater than s[i-1]...
        if  (   s   [   i   ]   ===   s   [   i   -   1   ]   +   1   )
        {
            ans     ++  ;   // ...increment 'ans' by one.
        }
        else
        {
            // Otherwise (if the condition is not met)...
            ans     +=  s   [   i   ]   ;   // ...add the value of s[i] to 'ans'.
        }
    }

    // After the loop completes, print the final calculated answer to the console.
    console     .   log   (   ans   )   ;
}

// Invoke the Main function.
// The input is read from standard input using Node.js 'fs' module.
// 'readFileSync' reads the entire content of '/dev/stdin' as a UTF-8 string.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ; // Execute the primary program logic.