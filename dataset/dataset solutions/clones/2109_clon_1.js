// This function processes the input data.
function Main ( input )
{
    // The input string is split into an array of lines.
    input = input . split ( "\n" ) ;

    // The first line is further split by spaces.
    tmp = input [ 0 ] . split ( " " ) ;

    // Convert the first part of the first line to an integer.
    // parseInt is used for string-to-integer conversion, with radix 10.
    var n = parseInt ( tmp [ 0 ] , 10 ) ;

    var ans = 0 ; // Initialize an answer variable.

    // Check if n is an even number.
    if ( n % 2 == 0 )
    {
        console . log ( n / 2 ) ;
    }
    // Check if n is exactly 1.
    else if ( n == 1 )
    {
        console . log ( "1" ) ;
    }
    // This is the case for odd numbers greater than 1.
    else
    {
        var ans = Math . ceil ( n / 2 ) ; // Calculate the ceiling of n/2.
        console . log ( ans ) ;
    }


} // End of Main function.


/*
 * This section should not be modified. It handles standard input/output
 * and calls the Main function with the read data.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;