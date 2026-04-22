/*
 *  This is a Type I clone of the original JavaScript code.
 *  It preserves all identifiers, operators, and expressions exactly.
 *  Only whitespace and comments have been modified extensively.
 *  This file adheres to strict mode for better code quality.
 */

"use strict" ;

// Main function definition begins here.
function Main ( input )
{
    /*
     *  Declaration of a constant array 'arr'.
     *  It contains a predefined list of strings that will be processed.
     */
    const   arr   =   [ "dream" ,   "dreamer" ,   "erase" ,   "eraser" ] ;


    // Loop through each element in the 'arr' array.
    for  (  let   i   in   arr  )
    {
        // Reverse each string in the array using the 'reverse' helper function.
        arr [ i ]   =   reverse ( arr [ i ] ) ;
    }

    /*
     *  Reverse the main input string.
     *  This is a crucial step for the logic that follows.
     */
    input   =   reverse ( input ) ;


    // Begin an infinite loop for processing the input string.
    while   (   true   )
    {
        // Initialize a counter 'i' for iterating through the 'arr' elements.
        let   i   =   0 ;

        /*
         *  Iterate over each string 's' in the 'arr' array.
         *  This loop attempts to match prefixes of the input string.
         */
        for   (   let   s   of   arr   )
        {
            // Extract a slice from the input string with length equal to 's'.
            var   a   =   input . slice (   0 ,   s . length   ) ;

            // Check if the extracted slice 'a' is strictly equal to 's'.
            if   (   a   ===   s   )
            {
                // If a match is found, remove the matched prefix from 'input'.
                input   =   input . substr (   s . length   ) ;

                // Exit the inner loop as a match has been processed.
                break ;
            }

            // Increment the counter if no match was found for the current 's'.
            i ++ ;
        }

        // Check if the counter 'i' has exceeded 3.
        // This condition implies no match was found in the 'arr' for the current input prefix.
        if   (   i   >   3   )
        {
            // If no match was found, break out of the infinite 'while' loop.
            break ;
        }
    }


    /*
     *  Final check: Determine if the input string has been completely processed.
     *  If 'input' is an empty string, it means all parts were successfully matched and removed.
     */
    if   (   input   ===   ""   )
    {
        // Output "YES" to the console if the input was fully consumed.
        console . log ( "YES" ) ;
    }
    else
    {
        // Otherwise, output "NO", indicating that the input could not be fully matched.
        console . log ( "NO" ) ;
    }
}


/*
 *  Helper function to reverse a given string.
 *  It splits the string into an array of characters, reverses the array,
 *  and then joins the characters back into a string.
 */
function   reverse   (   str   )
{
    return   str . split ( "" ) . reverse ( ) . join ( "" ) ;
}


// Entry point of the script.
// It reads input from standard input, decodes it as UTF-8, and passes it to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf-8" )   ) ;