/*
 * This is a Type I clone generated from the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * while maintaining the exact same logical and structural integrity.
 * The core functionality remains identical to the source.
 */

// Define the main function that will process the input data.
function   main   ( input )
{

    // Declare three constant variables: a1, a2, and a3.
    // Note: In the original code, these are declared but not initialized.
    // This implies they will hold 'undefined' values by default.
    const   a1 ,   a2 ,   a3 ;


    // Calculate the sum of these three constants.
    // If any of a1, a2, or a3 are 'undefined', the sum will result in NaN (Not a Number).
    const   sum   =   a1   +   a2   +   a3 ;


    // Evaluate a condition based on the calculated sum.
    // If 'sum' is NaN, any comparison like 'NaN <= 21' will evaluate to 'false'.
    if   ( sum   <=   21 )
    {
        // If the sum is less than or equal to 21, log "win".
        console . log ( "win" ) ;
    }
    // Otherwise, if the condition is not met (i.e., sum > 21 or sum is NaN).
    else
    {
        // Log "bust" to the console.
        console . log ( "bust" ) ;
    }

}   // End of the main function definition.


// This line invokes the main function immediately.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as the 'input' argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of the JavaScript program.