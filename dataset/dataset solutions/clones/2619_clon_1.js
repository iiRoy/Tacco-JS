function Main ( input )
{
    // This function processes the given input string.
    // It first extracts N and K, then two lists of numbers.
    // Finally, it performs calculations based on these lists and K.

    // Parse N from the first part of the input.
    // input.split("\n")[0] gets the first line.
    // .split(" ")[0] gets the first space-separated token.
    var N = parseInt( input . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Parse K from the first part of the input.
    // input.split("\n")[0] gets the first line.
    // .split(" ")[1] gets the second space-separated token.
    var K = parseInt( input . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] ) ;


    // Get the second line of the input, which contains the list of numbers.
    var tmpList = input . split ( "\n" ) [ 1 ] ;

    // Convert the space-separated string into an array of numbers (tmpListAonly).
    var tmpListAonly = tmpList . split ( " " ) . map ( ( tmpListAonly ) => Number ( tmpListAonly ) ) ;


    // Create a doubled version of the list for specific calculations (tmpListBonly).
    // This effectively concatenates the list with itself.
    var tmpListBonly = ( tmpList + " " + tmpList ) . split ( " " ) . map ( ( tmpListBonly ) => Number ( tmpListBonly ) ) ;


    // Initialize a flag to check if all elements in tmpListAonly are identical.
    var flag = false ;

    // Loop through tmpListAonly to check for differing adjacent elements.
    for ( var i = 0 ; i < tmpListAonly . length - 1 ; i ++ )
    {
        // If two adjacent elements are not equal, set the flag and break.
        if ( tmpListAonly [ i ] != tmpListAonly [ i + 1 ] )
        {
            flag = true ;
            break ; // Exit the loop early as a difference is found.
        }
    }


    /*
     * Conditional block based on the 'flag' value.
     * If 'flag' is false, all elements in tmpListAonly are identical.
     * Otherwise, proceed with more complex calculations.
     */
    if ( ! flag )
    {
        // If all elements are the same, the result is 0.
        console . log ( "0" ) ;
        return ; // Terminate the function.
    }
    else
    {
        // Initialize an array to store intermediate results.
        var resultList = [ ] ;
        // Initialize a variable to count inversions.
        var result = 0 ;

        // Calculate inversions for tmpListAonly.
        // An inversion is a pair (i, j) such that i < j and tmpListAonly[i] > tmpListAonly[j].
        for ( var i = 0 ; i < tmpListAonly . length ; i ++ )
        {
            for ( var j = i + 1 ; j < tmpListAonly . length ; j ++ )
            {
                var mae = tmpListAonly [ i ] ; // 'mae' means 'before' in Japanese.
                var ato = tmpListAonly [ j ] ; // 'ato' means 'after' in Japanese.

                if ( mae > ato )
                {
                    result ++ ; // Increment the inversion count.
                }
            }
        }
        // Store the inversion count for tmpListAonly.
        resultList . push ( result ) ;

        // Reset the result counter for the next calculation.
        result = 0 ;

        // Calculate inversions for tmpListBonly (the doubled list).
        for ( var i = 0 ; i < tmpListBonly . length ; i ++ )
        {
            for ( var j = i + 1 ; j < tmpListBonly . length ; j ++ )
            {
                var mae = tmpListBonly [ i ] ;
                var ato = tmpListBonly [ j ] ;

                if ( mae > ato )
                {
                    result ++ ; // Increment the inversion count.
                }
            }
        }
        // Store the inversion count for tmpListBonly.
        resultList . push ( result ) ;

        // Reset the result counter (though not strictly necessary here, good practice).
        result = 0 ;

        /*
         * Final conditional block based on the value of K.
         * Different logic applies for K <= 2 versus K > 2.
         */
        if ( K <= 2 )
        {
            // If K is 1 or 2, output the corresponding pre-calculated result.
            // resultList[0] for K=1, resultList[1] for K=2.
            console . log ( resultList [ K - 1 ] ) ;
        }
        else
        {
            // If K is greater than 2, perform an iterative calculation.
            var count = 2 ; // Start counting from 2, as first two results are known.
            while ( count != K )
            {
                // Calculate the next addition based on a specific pattern.
                // This pattern seems to be related to cumulative inversions.
                var nextAdd = resultList [ 0 ] + resultList [ 1 ] + resultList [ 1 ] ;

                resultList . push ( nextAdd ) ; // Add the new result to the list.
                resultList . shift ( ) ; // Remove the oldest result from the front.

                count ++ ; // Increment the counter towards K.
            }
            // Output the final result, modulo (10^9 + 7).
            // This is a common practice in competitive programming to prevent integer overflow.
            console . log ( resultList [ 1 ] % ( 1e9 + 7 ) ) ;
        }
    }
}

// Call the Main function with input read from standard input.
// require("fs").readFileSync("/dev/stdin", "utf8") reads the entire file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;