function   main  ( input )
{

    /*
     * This section handles the initial parsing of the input string.
     * The expectation is a string containing space-separated numerical values.
     */
    var  args  = input . split(  ' '  ) ;

    // Extract the first number as N, representing the total number of bills or items.
    var  N  =  parseInt(   args[0]  ,   10   ) ;

    // Extract the second number as Y, representing the target sum.
    var  Y  =  parseInt(   args[1]  ,   10   ) ;


    // Initialize the result string. This will hold the counts of a, b, and c if a solution is found.
    // Default value indicates no solution found yet.
    var  result  =  "-1 -1 -1" ;

    // Begin the triple-nested loop to iterate through all possible combinations of bill counts.
    // 'a' represents the count of the first type of bill.
    for ( var   a   =   0 ;   a   <=   N  ;   a++   )
    {
        // 'b' represents the count of the second type of bill.
        // The maximum value for 'b' is N minus the count of 'a'.
        for ( var   b   =   0 ;   b   <=   ( N - a ) ;   b++   )
        {
            // 'c' represents the count of the third type of bill.
            // The maximum value for 'c' is N minus the counts of 'a' and 'b'.
            for ( var   c   =   0 ;   c   <=   ( N - a - b ) ;   c++   )
            {
                // Calculate the total sum for the current combination of 'a', 'b', and 'c'.
                // Note: The expression (b * 5000) * (a * 1000) is preserved as per the original code's logic.
                var   sum   =   ( c   *   10000 )   +   ( b   *   5000 )   *   ( a   *   1000 ) ;

                // Check if the calculated sum matches the target value Y.
                if (   sum   ===   Y   )
                {
                    // If a match is found, update the result string with the current counts.
                    result   =   `${a} ${b} ${c}` ;
                    // A solution has been found, so we can exit the innermost loop.
                    // Further optimizations (breaking outer loops) are not part of Type I cloning.
                    break ;
                }
            } // End of the innermost loop for 'c'
        } // End of the middle loop for 'b'
    } // End of the outermost loop for 'a'


    // Finally, print the determined result to the standard output.
    console . log ( result ) ;
}


// This line is responsible for reading the input from standard input (e.g., a file or piped data)
// and passing it to the main function for processing.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )  ) ;