/* This function processes the input data provided. */
function Main ( input )
{
    input = input . split ( "\n" ) ; // Split the entire input by newline characters.

    var input0 = input [ 0 ] . split ( " " ) ; // Get the first line and split it by space.
    const N = parseInt ( input0 [ 0 ] ) ;
    const K = parseInt ( input0 [ 1 ] ) ; // Parse the second number as K.

    // Check a specific condition for N.
    if ( N == 1 )
    {
        console . log ( 0 ) ; // If N is 1, output 0.
    }
    else
    {
        // Otherwise, calculate N - K and output the result.
        console . log ( N - K ) ;
    }

}
/*  DO NOT EDIT THE LINE BELOW THIS COMMENT. This handles standard input/output and calls Main.  */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;