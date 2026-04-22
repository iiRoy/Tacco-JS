/*
 * This is a JavaScript program designed to process a numerical input.
 * It ensures that all digits in the number are identical.
 * If not, it increments the number and re-checks.
 */
function   main  (   input   )
{
    // Declare a mutable variable 'n' to hold the current number string.
    // The input is read, split by newline, and the first line is taken.
    // It's then explicitly converted to a string using concatenation with an empty string.
    let     n   =   input.split (   '\n'   )   [   0   ]   +   ''   ;


    // This is the main processing loop. It's labeled 'checker' for easy continuation.
    // The loop runs indefinitely until a specific condition is met and 'break' is called.
    checker   :   while   (   true   )
    {
        /*
         * Inside the loop, we first get the length of the current number string.
         * This value is stored in a constant 'nL' for efficiency in the inner loop.
         */
        const   nL   =   n.length   ;

        // We also extract the first digit of the number string.
        // This 'first digit' will be used as a reference for comparison.
        const   fN   =   n   [   0   ]   ;

        // Now, we iterate through the digits of the number, starting from the second digit (index 1).
        // The goal is to check if all subsequent digits are the same as the first digit (fN).
        for   (   let   i   =   1   ;   i   <   nL   ;   i   ++   )
        {
            // If we find any digit that is different from the first digit...
            if   (   fN   !==   n   [   i   ]   )
            {
                // ...then the number does not meet our criteria.
                // We parse the current string 'n' into a floating-point number.
                // Then, we increment it by 1.
                const   pN   =   parseFloat   (   n   )   +   1   ;

                // The incremented number is then converted back to a string.
                // This new string becomes the value of 'n' for the next iteration.
                n   =   pN   +   ''   ;

                // We immediately jump back to the start of the 'checker' while loop.
                // This effectively restarts the process with the new, incremented number.
                continue   checker   ;
            }
        }

        // If the inner 'for' loop completes without encountering any differing digits,
        // it means all digits in 'n' are identical.
        // In this case, we print the number to the console.
        console.log   (   n   )   ;

        // After printing the result, we exit the 'checker' loop, as our task is complete.
        break   ;
    }
}


/*
 * This is the entry point of the script when executed.
 * It reads input from standard input (/dev/stdin) as a UTF-8 string.
 * The entire content read is then passed to the 'main' function for processing.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;