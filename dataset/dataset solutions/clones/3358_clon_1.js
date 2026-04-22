"use strict"
; // This directive enables strict mode, ensuring cleaner code.

/*
 * The primary function definition.
 * It processes a single argument, typically representing input data.
 */
const   main   =   (   arg   )   =>
{
    // Variables to hold parsed integer values from the input string.
    // The input is expected to be space-separated numbers.
    const   a   =   parseInt(   input.split(   " "   )[0]   )   ;
    const   b   =   parseInt(   input.split(   " "   )[1]   )   ;
    const   c   =   parseInt(   input.split(   " "   )[2]   )   ;

    let   ans   =   0   ; // Initialize the answer accumulator.
    

    // First conditional block: checks the relationship between 'b' and 'c'.
    if  (   b   >=   c   )
    {
        // If 'b' is greater than or equal to 'c', update 'ans' and reset 'c'.
        ans   +=   c   +   b   ;
        c   =   0   ;
    }
    else
    {
        // Otherwise, if 'b' is less than 'c', perform a different calculation.
        ans   +=   b   *   2   ;
        c   -=   b   ,   b   =   0   ; // Update 'c' and then reset 'b'.
    }
    
    // Second conditional block: processes 'c' if it still holds a positive value.
    if  (   c   >   0   )
    {
        // Calculate a temporary value based on the minimum of 'c' and 'a'.
        var   tmp   =   Math.min(   c   ,   a   )   ;
        c   -=   tmp   ; // Reduce 'c' by the temporary amount.
        ans   +=   tmp   ; // Add the temporary amount to the total answer.
    }

    // Final check for 'c' and adjustment to 'ans'.
    if  (   c   >   0   )
    {
        ans   ++   ; // Increment 'ans' if 'c' is still positive.
    }
    
    // Output the final calculated answer to the standard console.
    console.log(   ans   )   ;
}

// Invokes the main function with data read from standard input.
main(   require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;