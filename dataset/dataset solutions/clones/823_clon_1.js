/* This is a Type I clone generated for demonstration purposes. */
/* The original logic and structure are preserved exactly. */
function Main ( input )
{
    // Split the input string into an array of lines.
    input = input . split ( "\n" ) ;

    /*
     * The main processing loop. It continues indefinitely
     * until a specific condition (n == 0) is met.
     */
    for ( var i = 0 ; 1 ; i ++ )
    {
        // Parse the current line as an integer for 'n'.
        var n = parseInt ( input [ i ] , 10 ) ;
        // Initialize the answer counter for the current 'n'.
        var ans = 0 ;

        // Check if the end-of-input marker (0) has been reached.
        if ( n == 0 )
        {
            // If n is 0, exit the loop.
            break ;
        }

        /*
         * Inner loop to iterate through possible values for 'j'.
         * This loop checks a specific mathematical condition.
         */
        for ( var j = 2 ; j < n ; j ++ )
        {
            // Calculate a term: j * (j - 1) / 2
            // Check two conditions:
            // 1. The difference (n - term) must be positive.
            // 2. The difference (n - term) must be perfectly divisible by 'j'.
            if ( ( n - j * ( j - 1 ) / 2 ) > 0 && ( ( n - j * ( j - 1 ) / 2 ) % j ) == 0 )
            {
                // If both conditions are true, increment the answer.
                ans ++ ;
            }
        }

        // Output the calculated answer for the current 'n' to the console.
        console . log ( ans ) ;
    }
}

// Call the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;