/* This JavaScript program processes input to find common elements between two specific lines. */


// First, we read all input from standard input.
var   input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin'  , 'utf8' ) ;


// The entire input string is then split into an array of individual lines.
var lines = input . split ( '\n' ) ;


// We extract the second line (index 1, as arrays are zero-indexed)
// and split it by spaces to form an array named S.
var S = lines [ 1 ] . split ( ' ' ) ;


// Similarly, we extract the fourth line (index 3)
// and split it by spaces to form an array named T.
var T = lines [ 3 ] . split ( ' ' ) ;


// An empty array is initialized to serve as a hash map or dictionary
// for efficient lookups of elements from S.
var dic = [ ] ;

// We iterate through each value in the array S.
S . forEach ( function ( val ) {

    // For every unique value encountered in S, we mark its presence
    // in our dictionary by setting its corresponding key to 'true'.
    dic [ val ] = true ; /* This indicates the value exists in S. */
} ) ;


// A counter variable is initialized to keep track of
// how many elements from T are also present in S.
var cnt = 0 ;


// Now, we iterate through each number in the array T.
T . forEach ( function ( num ) {

    // We check if the current number from T exists as a key in our 'dic' dictionary.
    // If 'dic[num]' evaluates to true, it means 'num' was present in array S.
    if ( dic [ num ] ) {
        // If the number is found in both S and T, we increment the counter.
        cnt ++ ; // Increment the count of common elements.
    }

} ) ;


// Finally, the total count of common elements found is printed to the console.
console . log ( cnt ) ;