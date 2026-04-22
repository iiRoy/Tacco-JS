/*
 * This file processes input data to find the maximum consecutive
 * non-decreasing sequence length.
 */
function Main( input )
{

    // The input string is split by newline characters to get individual lines.
    input = input . split ( "\n" ) ;

    // Parse the first line as an integer 'n'.
    var n = parseInt ( input [ 0 ] , 10 ) ;

    // Split the second line by spaces to get an array of height values 'h'.
    var h = input [ 1 ] . split ( " " ) ;


    // Initialize a counter for consecutive non-decreasing elements.
    var count = 0 ;

    // Initialize 'max' to store the maximum count found so far.
    var max = count ;


    // Loop through the height array from the first element up to the second-to-last.
    // The loop runs 'n - 1' times because we compare h[i] with h[i+1].
    for ( var i = 0 ; i < ( n - 1 ) ; i ++ )
    {
        // Check if the current height is greater than or equal to the next height.
        if ( h [ i ] >= h [ i + 1 ] )
        {
            // If it is, increment the consecutive count.
            count ++ ;
        }
        else
        {
            // If the sequence is broken, reset the count to zero.
            count = 0 ;
        }

        // After updating 'count', compare it with the current maximum.
        if ( count > max )
        {
            // If 'count' is greater, update 'max'.
            max = count ;
        }
    }


    // Output the final maximum consecutive non-decreasing count.
    console . log ( '%s' , max ) ;

}

/*
 * This part of the code handles standard input/output
 * and should not be modified to ensure proper execution
 * within the typical competitive programming environment.
 * It reads all input at once and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;