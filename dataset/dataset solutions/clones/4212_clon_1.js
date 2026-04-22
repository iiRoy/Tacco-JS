/*
 * This is a Type I code clone example.
 * It demonstrates how to achieve exact functional equivalence
 * while varying whitespace and comments extensively.
 */

  /**
   * Main function to process the input string.
   *
   * @param   {string}  s  The input string to be processed.
   * @returns {void}
   */
function   main  (   s   )
{

    // Initialize a variable 'r' by trimming leading/trailing whitespace from the input string 's'.
    var    r    =   s . trim ( )  ;


    /*
     * Define an array of indices where 'A' characters
     * might need to be injected or verified.
     */
    var   inject   =   [   0  ,  4  ,  6  ,  8   ]  ;


    // Loop through each index specified in the 'inject' array.
    for
    (
        var   i   =   0   ;   i   <   inject . length   ;
        i   ++
    )
    {
            // Get the current injection index 'j'.
            var   j   =   inject [   i   ]   ;

            // Check if the character at the current index 'j' in 'r' is not 'A'.
            if   (   r [   j   ]    !==    'A'   )
            {
                // If it's not 'A', inject 'A' at that position.
                // This creates a new string 'r' by concatenating parts.
                r   =   r . slice (   0  ,   j   )   +   "A"   +   r . slice (   j  ,   r . length   )   ;
            }
    }   /*   End of the injection loop   */


    // After all checks/injections, compare the modified string 'r' with "AKIHABARA".
    // Output "YES" if they are identical, otherwise output "NO".
    console . log (   r   ===   "AKIHABARA"   ?   "YES"   :   "NO"   )   ;

}   //   End of the main function definition


// This section handles reading input from standard input and calling the main function.
main   (
    require (   'fs'   )
        . readFileSync (   '/dev/stdin'  ,   'utf8'   )
)   ;   /*   Function call completes here   */