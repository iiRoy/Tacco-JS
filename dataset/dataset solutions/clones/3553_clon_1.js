function   main  ( arg ) { // This is the main function that processes the input argument.

   /*
    * The input 'arg' is expected to be a string
    * containing multiple lines. We split it by newline characters.
    */
    arg = arg.split ( "\n" ) ;


    // The first line of input contains two space-separated values.
    var tmp = arg[ 0 ] . split ( " " ) ;

    var N = tmp[ 0 ] ; // N is the first value from the first line.
    var X = tmp[ 1 ] ; // X is the second value from the first line.

    // The second line of input contains space-separated numbers (xi values).
    var xi = arg[ 1 ] . split ( " " ) ;


    // We need to include X in the xi array for processing.
    xi . push ( X ) ;

    /*
     * Convert all elements in the xi array to integers.
     * The radix 10 ensures decimal parsing.
     */
    xi = xi . map ( function ( e ) {
        return parseInt ( e , 10 ) ;
    } ) ;


    // Sort the xi array in ascending order.
    xi . sort ( function ( a , b ) {

        if ( a > b ) {
            return 1 ; // a comes after b
        }
        return -1 ; // a comes before b
    } ) ;


    // Special case: if there are only two elements after sorting.
    if ( xi . length === 2 ) {
        console . log ( xi[ 1 ] - xi[ 0 ] ) ; // Output the difference.
        return ; // Exit the function.
    }


    /*
     * Initialize an array to store the differences between
     * consecutive elements in the sorted xi array.
     */
    var result = [ ] ;


    // Iterate through the sorted xi array to calculate differences.
    for ( var i = 1 ; i < xi . length ; i++ ) {
        result . push ( xi[ i ] - xi[ i-1 ] ) ;
    }

    // Filter out duplicate differences to get only unique values.
    result = result . filter ( function ( x , i , self ) {
        return self . indexOf ( x ) === i ;
    } ) ;


    // After the first round of differences and filtering:
    if ( result . length === 1 ) {
        console . log ( result[ 0 ] ) ; // If only one unique difference, print it.
        return ; // Exit.
    }

    // If there's more than one unique difference, we enter a loop.
    else {

        // This loop continues until only one unique difference remains.
        while ( 1 ) {

            var _tmp = [ ] ; // Temporary array for storing new differences.

            // Sort the current result array again.
            result = result . sort ( function ( a , b ) {
                if ( a > b ) {
                    return 1 ;
                }
                return -1 ;
            } ) ;

            // Calculate differences between consecutive elements in the 'result' array.
            for ( var i = 1 ; i < result . length ; i++ ) {
                _tmp . push ( result[ i ] - result[ i-1 ] ) ;
            }

            // Filter out duplicates from the new differences.
            _tmp = _tmp . filter ( function ( x , i , self ) {
                return self . indexOf ( x ) === i ;
            } ) ;


            result = _tmp ; // Update 'result' with the new unique differences.

            // Check if we've converged to a single unique difference.
            if ( result . length === 1 ) {
                break ; // Exit the while loop.
            }

            else {
                // If not, 'result' already holds the new _tmp for the next iteration.
                // This line is redundant but kept for Type I cloning.
                result = _tmp ;
            }
        }
        console . log ( result[ 0 ] ) ; // Print the final single unique difference.
    }
}

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;