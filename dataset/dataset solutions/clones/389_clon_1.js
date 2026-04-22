var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // This line reads input from standard input.

// It's a common pattern for competitive programming tasks.

var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;

/*
 * The input string is processed here:
 * 1. .trim() removes leading/trailing whitespace.
 * 2. .split("\n") splits the string into an array of lines.
 * 3. .map(Number) converts each string element to a numeric type.
 */

while ( true ) {

    // The main processing loop. It continues until a specific condition is met.

    var n = arr . shift ( ) ; // Get the first element from 'arr' and remove it.

    if ( n == 0 ) break ; /* If the shifted value 'n' is zero, terminate the loop. */

    if ( n == 1 ) {

        console . log ( "" ) ; // Output an empty line if n is 1.
        continue ; // Skip the rest of the current iteration and proceed to the next 'while' loop check.

    }

    // Initialize an array 'ary' with 'n' boolean false values.
    var ary = [ ] ;
    for ( var i = 0 ; i < n ; i ++ ) ary [ i ] = false ;

    // Mark elements in 'ary' based on the square of indices modulo 'n'.
    for ( var i = 1 ; i < n ; i ++ ) {
        ary [ i * i % n ] = true ;
    }

    /*
     * Create a new array 'm' to store the indices where 'ary' has 'true' values.
     */
    var m = [ ] ;
    ary . forEach ( function ( v , i ) {
        if ( v ) m . push ( i ) ; // If 'v' (value) is true, push its index 'i' into 'm'.
    } ) ;

    var ans = [ ] ; // Initialize 'ans' array to store the final counts.

    var len = ( n - 1 ) / 2 ; // Calculate 'len', which is half of (n-1).

    // Initialize 'ans' array with zeros up to 'len'.
    for ( var i = 0 ; i <= len ; i ++ ) ans [ i ] = 0 ;

    // Nested loops to calculate differences between pairs of elements in 'm'.
    for ( var i = 0 ; i < m . length ; i ++ ) {

        for ( var j = i + 1 ; j < m . length ; j ++ ) {

            // First difference calculation: m[i] - m[j]
            var x = m [ i ] - m [ j ] ;

            if ( x < 0 ) x += n ; // Adjust 'x' if it's negative by adding 'n'.

            if ( len < x ) x -= n ; // Further adjust 'x' if it exceeds 'len' by subtracting 'n'.

            ans [ x ] ++ ; // Increment the count for this 'x' in the 'ans' array.


            // Second difference calculation: m[j] - m[i] (symmetric)
            var x = m [ j ] - m [ i ] ;

            if ( x < 0 ) x += n ; // Adjust 'x' if it's negative.

            if ( len < x ) x -= n ; // Further adjust 'x' if it's too large.

            ans [ x ] ++ ; // Increment the count for this 'x'.

        } // End of inner loop (j)

    } // End of outer loop (i)

    ans . shift ( ) ; // Remove the first element from 'ans' (index 0).

    // Iterate through the remaining elements in 'ans' and print each multiplied by 2.
    ans . forEach ( function ( v ) {
        console . log ( v * 2 ) ;
    } ) ;

} // End of while (true) loop