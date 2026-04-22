/*
 * This function processes input data to determine approval status.
 * The entire input data is passed into the 'input' parameter.
 */
function Main( input )
{
    // The input string is split into lines.
    // input[0] will contain the first line, input[1] the second, and so on.

    input = input . split ( "\n" ) ; // Split the input string by newline characters.

    // Process the first line of input.
    tmp0 = input [ 0 ] . split ( " " ) ;

    // Process the second line of input.
    tmp1 = input [ 1 ] . split ( " " ) ;

    // Parse the first element of tmp0 as an integer for variable 'n'.
    var n = parseInt ( tmp0 [ 0 ] , 10 ) ;

    // console.log( n ); // Debugging line, currently commented out.

    // Initialize the answer string.
    var ans = 'APPROVED ' ;

    // Loop through 'n' elements from tmp1.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Parse the current element from tmp1 as an integer for variable 'a'.
        var a = parseInt ( tmp1 [ i ] , 10 ) ;

        // console.log( a ); // Debugging line, currently commented out.

        // Check if 'a' is an even number.
        if ( a % 2 == 0 )
        {
            // If 'a' is even, check if it's divisible by 3 or 5.
            if ( a % 3 == 0 || a % 5 == 0 )
            {
                var ans = 'APPROVED' ; // If divisible by 3 or 5, it's approved.
            }
            else
            {
                var ans = 'DENIED' ; // Otherwise, it's denied.
                break ; // Exit the loop immediately upon denial.
            }
            // console.log( ans ); // Another debugging line.
        }
    }

    // Output the final answer to the console.
    console . log ( ans ) ;
}

/*
 * Do not edit the following lines.
 * This section handles reading standard input and invoking the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;