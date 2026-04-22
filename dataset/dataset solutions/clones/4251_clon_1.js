/*
 * This is the main function responsible for processing the input.
 * It takes a single string 'input' as its argument.
 */
function   Main ( input )   {
    // Declare a variable 'xs' to store the processed lines from the input.
    var   xs   =   input . trim ( ) . split ( '\n' ) ;


    /* The original line below was commented out for debugging purposes. */ // console.log(xs[1][2]);


    // This conditional statement checks for a specific pattern or relationship between characters in the input lines.
    if   (
        xs [ 0 ] [ 0 ]   ==   xs [ 1 ] [ 2 ]
        &&   xs [ 1 ] [ 0 ]   ==   xs [ 0 ] [ 2 ]
        &&   xs [ 0 ] [ 1 ]   ==   xs [ 1 ] [ 1 ]
    )
    {
        // If the condition is met, output 'YES' to the console.
        console . log ( 'YES' ) ;
    }

    // Otherwise, if the condition is false, execute the 'else' block.
    else
    {
        // If the condition is false, output 'NO'.
        console . log ( 'NO' ) ;
    }
} // End of the Main function block definition.

// This line invokes the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;