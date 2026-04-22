// This function processes the input data.
function Main( input )
{

    // The input string is converted to an integer using base 10.
    var n = parseInt( input , 10 ) ;

    var ans = 0 ; // Initialize the answer variable.


    // This is an infinite loop, designed to be exited by 'break' statements.
    while ( true )
    {

        // Loop for powers of 9.
        for ( var nine_count = 9 ; ; nine_count *= 9 )
        {

            // Check if subtracting nine_count would make n negative.
            if ( n - nine_count < 0 )
            {

                // If nine_count is not the initial 9, it means we found a suitable power of 9.
                if ( nine_count != 9 )
                {
                    nine_count /= 9 ; // Revert to the last valid power of 9.
                    n -= nine_count ; // Subtract it from n.
                    ans++ ;           // Increment the answer.
                }
                else
                {
                    // If even 9 is too large, break out of this inner loop.
                    break ;
                }
            }
        }


        // Loop for powers of 6.
        for ( var six_count = 6 ; ; six_count *= 6 )
        {

            // Check if subtracting six_count would make n negative.
            if ( n - six_count < 0 )
            {

                // If six_count is not the initial 6, it means we found a suitable power of 6.
                if ( six_count != 6 )
                {
                    six_count /= 6 ; // Revert to the last valid power of 6.
                    n -= six_count ; // Subtract it from n.
                    ans++ ;          // Increment the answer.
                }
                else
                {
                    // If even 6 is too large, break out of this inner loop.
                    break ;
                }
            }
        }

        ans += n ; // Add the remaining value of n to the answer.
        break ;    // Exit the main while loop.
    }


    // Output the final calculated answer to the console.
    console.log( ans ) ;
}


// NOTE: Please do not modify the lines below this point.
// These lines handle reading input from stdin and calling the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;