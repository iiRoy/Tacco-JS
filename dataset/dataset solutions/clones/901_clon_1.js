var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// This line reads the entire content of '/dev/stdin' as a UTF-8 string.
// The 'fs' module is used for file system operations.

var arr = input . trim ( ) . split ( "\n" ) ;

// The input string is first trimmed to remove any leading/trailing whitespace.
// Then, it's split into an array of strings, with each element representing a line.

arr . shift ( ) ;
// The first element (line) is removed from the 'arr' array.
// This is common in competitive programming where the first line might be a count.

var a = arr . shift ( ) . split ( " " ) . map ( Number ) ;
// The new first element (which was the second original line) is taken.
// It's split by spaces, and then each resulting string is converted to a Number.
// This creates the array 'a'.

a . sort ( function ( a , b ) {
    // Array 'a' is sorted numerically in ascending order.
    // The custom comparison function (a - b) ensures numerical sort.
    return a - b ;
} ) ;

arr . shift ( ) ;
// Another line is removed from the 'arr' array.

var b = arr . shift ( ) . split ( " " ) . map ( Number ) ;
// Similar to array 'a', the next line is processed to create array 'b'.

var c = arr . shift ( ) . split ( " " ) . map ( Number ) ;
// And the subsequent line is processed to create array 'c'.

var ary = [ ] ;
// An empty array 'ary' is declared. This will serve as a lookup table or a prefix sum array.

for ( var i = 0 ; i < 1000000 ; i ++ ) {
    // The 'ary' array is initialized with a fixed size of 1,000,000 elements.
    // Each element is set to 'false' initially.
    ary [ i ] = false ;
}

ary [ 0 ] = 0 ;
// The first element of 'ary' (at index 0) is specifically set to 0.

var sum = 0 ;
// A variable 'sum' is initialized to 0. This will be used to calculate prefix sums.

a . forEach ( function ( v ) {
    // Iterate through each value 'v' in the sorted array 'a'.
    sum += v ;
    // Accumulate the sum of elements of 'a'.
    ary [ v ] = sum ;
    // Store the current accumulated sum in 'ary' at the index corresponding to 'v'.
    // This effectively stores the sum of all elements in 'a' up to and including 'v'.
} ) ;

b . forEach ( function ( v , i ) {
    // Iterate through array 'b', using both the value 'v' and its index 'i'.
    while ( true ) {
        // This loop attempts to find the largest index 'v' (from array 'b')
        // for which 'ary[v]' contains a valid sum (i.e., not 'false').
        if ( ary [ v ] != false ) {
            // If 'ary[v]' is not 'false', it means a prefix sum was found for 'v'.
            break ;
            // Exit the inner while loop.
        }
        v -- ;
        // If 'ary[v]' is 'false', decrement 'v' to check the next smaller value.
    }
    // After the loop, 'v' holds the largest value from array 'a' (or smaller)
    // such that its prefix sum is available in 'ary'.

    // Compare the element c[i] with the found prefix sum ary[v].
    // If c[i] is less than or equal to ary[v], print "Yes", otherwise print "No".
    console . log ( ( c [ i ] <= ary [ v ] ) ? "Yes" : "No" ) ;
} ) ;