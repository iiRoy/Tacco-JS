/* This file enforces strict mode for better error handling and cleaner code. */
'use strict'

// Main function to process the input data.
function   main ( input   )
{
    // Split the input string into an array of lines.
    const   lines   =   input . split ( '\n' ) ;

    // Remove the last (often empty) line.
    lines . pop (  ) ;

    /* The problem statement might specify 'n' as the first line,
     * but it's not used in this particular implementation.
     * We still read it to adhere to the input format. */
    const   n   =   lines . shift (  ) ;

    // Call the core processing function with the remaining lines.
    f (  lines  ) ;
}


// Function 'f' performs the main logic of counting anagrams.
function   f (  lines  )
{
    // An object to store sorted strings and their counts.
    const   parsed   =   {  }

    // Iterate over each line in the input array.
    lines . forEach (   line   =>
    {
        // Sort the characters of the current line to create a canonical form.
        const   sorted   =   line . split ( '' ) . sort (  ) . join ( '' ) ;

        // Check if this sorted string (anagram group) already exists.
        if   (   !! parsed [ sorted ]   )
        {
            // If it exists, increment its count.
            parsed [ sorted ]   +=   1 ;
        }
        else
        {
            // Otherwise, initialize its count to 1.
            parsed [ sorted ]   =   1 ;
        }
    }  ) ;

    // Initialize the result variable.
    let   result   =   0 ;

    // Iterate over the keys (sorted strings) in the 'parsed' object.
    Object . keys ( parsed ) . forEach (   k   =>
    {
        // If an anagram group has 2 or more members, it contributes to the result.
        if   (   parsed [ k ]   >=   2   )
        {
            // Add the calculated value to the total result.
            // The formula used here is factorial(count) / 2.
            result   =   result   +   (   factorial ( parsed [ k ] )   /   2   ) ;
        }
    }  ) ;

    // Output the final calculated result to the console.
    console . log ( result ) ;
}


// Helper function to calculate the factorial of a number.
function   factorial (   num   )
{
    // Base case: factorial of 1 is 1.
    if   (   num   ===   1   )
    {
        return   1 ;
    }
    // Recursive step: n! = n * (n-1)!
    else
    {
        return   num   *   factorial (   num   -   1   ) ;
    }
} ; // Semicolon after function declaration is unusual but permitted.


// Entry point: Read input from stdin, then call the main function.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;