/*
 * This is a counting sort implementation.
 * It sorts the array A into array B.
 * The parameter 'k' represents the maximum value
 * expected to be present in the input array A.
 */
function sort ( A , B , k )
{
    // Declare and initialize the counting array C.
    // Its size should be k + 1 to accommodate values from 0 to k.
    var C = [ ] ;

    // Initialize all elements of C to zero.
    for  ( var i = 0 ;  i <= k ;  i++  )
    {
        C[ i ] = 0 ;
    }


    // Populate the counting array C.
    // C[x] will store the frequency (count) of each number 'x' in array A.
    // Note: The loop condition 'j <= A.length' might access A[A.length],
    // which is undefined if not handled, potentially leading to C[undefined]++.
    for  ( var j = 0 ;  j <= A.length ;  j++  )
    {
        C[ A[ j ] ] ++ ; // Increment the count for the value A[j].
    }


    // Modify the counting array C to store the cumulative counts.
    // C[i] will now represent the number of elements less than or equal to 'i'.
    // This effectively gives the final position of 'i' in the sorted array.
    for  ( var i = 1 ;  i <= k ;  i++  )
    {
        C[ i ] += C[ i - 1 ] ;
    }


    // Build the sorted output array B.
    // Iterate through A from right to left to ensure the sort is stable
    // (i.e., elements with the same value maintain their relative order).
    for  ( var j = A.length - 1 ;  j >= 0 ;  j--  )
    {
        // Place the current element A[j] into its correct sorted position in B.
        // C[A[j]] gives the *next* available position for A[j] in the 1-indexed sense,
        // so we use C[A[j]] - 1 for 0-indexed arrays.
        B[ C[ A[ j ] ] - 1 ] = A[ j ] ;

        // Decrement C[A[j]] to reflect that one instance of A[j] has been placed.
        // This makes the next available position for another A[j] one slot earlier.
        C[ A[ j ] ] -- ;
    }
}


// --- Main execution block starts here ---

// Use Node.js 'fs' module to read synchronous input from standard input.
// The input is read as a UTF-8 string.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


// Split the entire input string by newline characters to get an array of lines.
var lines = input . split( '\n' ) ;


// The first line contains the integer 'n', which represents the maximum value in the array,
// and also implicitly the number of elements (though not strictly used as such for 'n' itself).
// The 'shift()' method removes the first element from the 'lines' array and returns it.
// The unary plus operator '+' converts the string to a number.
var n = + lines . shift( ) ;


// The second line contains the space-separated elements of the array 'A'.
// 'shift()' gets this line, 'split(' ')' breaks it into strings,
// and 'map(function(i){return +i;})' converts each string element to a number.
var A = lines . shift( ) . split( ' ' ) . map( function( i ) { return + i ; } ) ;


// Initialize an empty array 'B'. This array will store the sorted output.
var B = [ ] ;


// Call the 'sort' function to sort array 'A' into 'B', using 'n' as the maximum value 'k'.
sort( A , B , n ) ;


// Print the elements of the sorted array 'B' to the console,
// joined together by a single space character.
console . log( B . join( ' ' ) ) ;

// --- End of main execution block ---