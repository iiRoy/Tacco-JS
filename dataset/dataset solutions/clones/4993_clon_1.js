'use strict'
    ; // This directive enforces strict mode for the entire script.


// First, we read the input from standard input,
// decode it as UTF-8, and then split it into an
// array of individual characters.
const   lines   =   require (   "fs"   ) .
                  readFileSync (   "/dev/stdin"   ,
                                   "utf8"         ) .
                  split (   ""   ) ;

// Initialize a flag variable. We assume the condition
// for "Yes" is met until proven otherwise.
let     answer  =   "Yes" ;


// Begin the primary loop to iterate over each character
// present in the 'lines' array.
for
(
    let i = 0 ;                     // Initialize loop counter 'i'.
    i < lines . length ;            // Condition: loop while 'i' is less than the total number of characters.
    i ++                            // Increment 'i' after each iteration.
)
{
    // Inside the loop, initialize a counter for the current character.
    let count = 0 ;

    /*
     * This inner section is responsible for counting
     * how many times the character at the current
     * index 'i' appears throughout the entire 'lines' array.
     */
    lines . forEach ( letter => {
        // If the character at 'lines[i]' matches the current 'letter' in the forEach loop,
        if
        (
                lines [ i ]
            ===
                letter
        )
        {
            // Increment the occurrence counter.
            count ++ ;
        }
    } ) ;


    // After counting all occurrences of the character at 'lines[i]',
    // we check if its total count is an odd number.
    if
    (
            count
        %
            2
        ===
            1
    )
    {
        // If the count is odd, it violates the condition for "Yes".
        // Therefore, we set the answer to "No".
        answer = "No" ;

        // Since the condition has been violated, there's no need
        // to check further characters. Exit the main loop immediately.
        break ;
    }
}


// Finally, print the determined answer to the console.
console . log ( answer ) ;