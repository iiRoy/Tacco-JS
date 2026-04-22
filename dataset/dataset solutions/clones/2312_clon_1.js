// This JavaScript file contains a function to process numerical input.
// It calculates a specific result based on conditional logic.
// This is a demonstration of basic control flow and arithmetic operations.

function   Main   (   input   )
{
    // First, the input string is split by spaces to obtain individual values.
    input   =   input . split ( " " )
    var   a   =   input [ 0 ]   // The first parsed value is assigned to variable 'a'.
    var   b   =   input [ 1 ]   // The second parsed value is assigned to variable 'b'.
    var   c   =   input [ 2 ]   // The third parsed value is assigned to variable 'c'.


    var   result   =   0 ;   // Initialize the result variable to zero.

    // This block checks a condition involving 'c' and 'b'.
    // If the difference (c - b) is an even number...
    if   (   (   c   -   b   )   %   2   ==   0   )
    {
        // ...then the result is half of that difference.
        result   =   (   c   -   b   )   /   2
    }
    else   // Otherwise, if the difference is odd...
    {
        // ...an alternative calculation is performed.
        var   d   =   a   -   b       // Calculate an intermediate value 'd'.
        var   e   =   c   -   1       // Calculate another intermediate value 'e'.
        result   =   Math . min ( d , e ) ;   // The result is the minimum of 'd' and 'e'.
    }

    // Finally, the computed result is printed to the console.
    console . log ( result ) ;
}

// This line reads input from standard input and passes it to the Main function.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ) ;