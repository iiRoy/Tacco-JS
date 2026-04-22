function   main   ( input ) {
    // This function processes the input string to calculate a count.

    /*
     * First, we split the input string by spaces
     * to get an array of string arguments.
     */
    var   args   =   input . split ( ' ' ) ;


    // Parse the first four arguments as integers.
    var   r   =   parseInt ( args[0] ,   10 ) ; // Represents the first value
    var   g   =   parseInt ( args[1] ,   10 ) ; // Represents the second value
    var   b   =   parseInt ( args[2] ,   10 ) ; // Represents the third value


    var   n   =   parseInt ( args[3] ,   10 ) ; // This is the target sum


    // Create an array from r, g, b and sort it.
    // This might be for optimization, but not used directly in the loops below.
    // The original logic uses r, g, b directly.
    var   arr   =   [ r , g , b ] . sort ( ) ;


    // Calculate maximum possible iterations for each variable based on 'n' and sorted 'arr' elements.
    // These 'rr', 'gr', 'br' values are not actually used in the nested loops' conditions.
    // The loops use 'n - r * i' etc. which is more precise.
    var   rr   =   Math . floor ( n   /   arr[0] ) ;
    var   gr   =   Math . floor ( n   /   arr[1] ) ;
    var   br   =   Math . floor ( n   /   arr[2] ) ;


    // Initialize a counter for valid combinations.
    var   cnt   =   0 ; // This variable will store our final count.


    // Start the first nested loop for 'r'.
    for ( var   i = 0 ;   i <= rr ;   i++ ) {

        // Check for a direct match with 'r' only.
        if (   i   *   r   ===   n   ) {
            cnt ++ ; // Increment count if 'i * r' equals 'n'.
            continue ; // Move to the next iteration of the outer loop.
        }

        // Start the second nested loop for 'g'.
        // The upper bound depends on 'n' and the current 'i * r'.
        for ( var   j = 0 ;   j <= n   -   r   *   i ;   j ++   ) {

            // Check for a match with 'r' and 'g'.
            if (   i   *   r   +   g   *   j   ===   n   ) {
                cnt ++ ; // Increment count if 'i * r + g * j' equals 'n'.
                continue ; // Move to the next iteration of the second loop.
            }

            // Start the third nested loop for 'b'.
            // The upper bound depends on 'n', 'i * r', and 'g * j'.
            for ( var   k = 0 ;   k <= n   -   r   *   i   -   g   *   j ;   k ++   ) {

                // Check for a match with 'r', 'g', and 'b'.
                if (   r   *   i   +   g   *   j   +   b   *   k   ===   n   ) {
                    cnt ++ ; // Increment count if the sum equals 'n'.
                }
            }
        }
    }

    // Output the final count to the console.
    console . log ( cnt ) ;
}

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;