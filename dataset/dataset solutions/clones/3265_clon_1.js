/*
 * This is a Type I code clone generated from an original JavaScript snippet.
 * The core logic and identifiers remain absolutely identical.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a visually distinct but functionally equivalent version.
 */

function   Main  (  input  )

{
        // Declare a temporary variable to hold the split input.
        // The input string is expected to be space-separated.
    tmp = input . split ( " " ) ;

    /*
     * Initialize several flag variables (a, b, c, d) to zero.
     * These flags will be set to 1 if their corresponding target number is found.
     * Also, initialize a counter 'e' to zero, which will track how many
     * of the specific target numbers have been encountered.
     */
    a = 0 ;     // Flag for number 1
    b = 0 ;   // Flag for number 9
    c = 0 ; // Flag for number 7
    d = 0 ; // Flag for number 4
    e = 0 ; // Counter for total found specific numbers

    // Begin a loop to iterate through the first four elements of the 'tmp' array.
    // This assumes the input will always have at least four relevant tokens.
    for (
        var   i   =   0
        ;
        i   <   4
        ;
        i++
    )
    {
        // Check if the current element is the string "1".
        if ( tmp [ i ] == "1" )
        {
            a = 1 ; // Set flag 'a' to indicate '1' was found.
            e++ ; // Increment the counter for found specific numbers.
        }

        // Check if the current element is the string "9".
        if ( tmp [ i ] == "9" )
        {
            b = 1 ; // Set flag 'b' to indicate '9' was found.
            e++ ; // Increment the counter.
        }

        // Check if the current element is the string "7".
        if ( tmp [ i ] == "7" )
        {
            c = 1 ; // Set flag 'c' to indicate '7' was found.
            e++ ; // Increment the counter.
        }

        // Check if the current element is the string "4".
        if ( tmp [ i ] == "4" )
        {
            d = 1 ; // Set flag 'd' to indicate '4' was found.
            e++ ; // Increment the counter.
        }
    }

    /*
     * After checking all relevant input elements, evaluate the final condition.
     * The condition requires that all four specific numbers (1, 9, 7, 4) were found
     * (indicated by their flags being 1) AND that exactly four specific numbers
     * were found in total (indicated by 'e' being 4).
     * This ensures that the input contained exactly "1", "9", "7", and "4"
     * in some order, without duplicates or other numbers.
     */
    if
    (
        a == 1
        &&
        b == 1
        &&
        c == 1
        &&
        d == 1
        &&
        e == 4
    )
    {
        console . log ( "YES" ) ; // Output "YES" if the condition is met.
    }
    else
    {
        console . log ( "NO" ) ; // Otherwise, output "NO".
    }

} // End of the Main function definition.

// This line handles the execution of the script.
// It reads input from standard input, typically from a file or pipe,
// decodes it as UTF-8, and then passes it to the Main function.
Main
(
    require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" )
) ;

// End of program.