/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered. Only whitespace and comments have been changed
 * extensively to provide a visually distinct, yet logically identical, output.
 */

// A utility function to find the lower bound of a value in a sorted array segment.
// d: The array to search within.
// a: The starting index of the search segment (inclusive).
// b: The ending index of the search segment (exclusive).
// e: The value to search for.
function lower_bound( d , a , b , e ) {

    for ( var c ; 1 < b - a ; ) { // Loop continues as long as the segment has more than one element.

        // Calculate the middle index using bitwise right shift for integer division.
        c = 0 | ( a + b ) >> 1 ;

        // Check if the element at the middle index is less than the target value.
        if ( d[c] < e ) {
            // If it is, the lower bound must be in the right half.
            a = c ;
        } else {
            // Otherwise, the lower bound must be in the left half (or at 'c').
            b = c ;
        }
    }

    // After the loop, 'a' and 'b' will be adjacent (b = a + 1).
    // Determine the final lower bound index.
    return d[a] < e ? b : a ;
}

// A standard comparison function for sorting numbers in ascending order.
function compareNumbers( a , b ) {

    // Returns a negative value if a < b, zero if a == b, and a positive value if a > b.
    return a - b ;
}

// The main function where the program logic resides.
function Main( arg ) {

    // Parse the input argument, which is expected to be a string.

    // Extract the first line as N (number of elements).
    var N = arg . split ( "\n" ) [ 0 ] - 0 ;

    // Extract the second line, split it by spaces, and map to numbers for array L.
    var L = arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( v => v - 0 ) ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Declare variables for the elements a, b, and c (though 'c' isn't explicitly used here).
    var a , b , c ;

    // Sort the array L in ascending order using the custom comparison function.
    L . sort ( compareNumbers ) ;

    // Outer loop: Iterate through the first element 'a'.
    // It goes up to N - 2 because we need at least two more elements (b and a third one).
    for ( var i = 0 ; i < N - 2 ; i ++ ) {

        a = L [ i ] ; // Assign the current element to 'a'.

        // Inner loop: Iterate through the second element 'b'.
        // It starts from i + 1 to ensure b is distinct from a and after it.
        // It goes up to N - 1 because we need at least one more element after 'b'.
        for ( var j = i + 1 ; j < N - 1 ; j ++ ) {

            b = L [ j ] ; // Assign the current element to 'b'.

            // Use lower_bound to find the first element in L (from index j+1 to N)
            // that is NOT less than (a + b).
            // Subtract 1 from the result to get the index of the LAST element
            // that IS less than (a + b).
            var tmp = lower_bound ( L , j + 1 , N , a + b ) - 1 ;

            // Add the count of valid 'c' elements to the total answer.
            // This is (index of last valid 'c') - (index of 'b').
            ans += ( tmp - j ) ;
        }
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;

    // The function does not return a meaningful value in this context.
    return ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// End of file.