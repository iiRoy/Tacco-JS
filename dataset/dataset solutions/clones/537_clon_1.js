/*
 * This JavaScript code processes input from standard input to solve a specific problem.
 * It reads an array of numbers, sorts a copy of it, and then performs a series of swaps
 * based on query instructions, checking for a specific condition.
 */

// Step 1: Read the entire input from /dev/stdin
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' );

// Step 2: Process the raw input string
// Remove leading/trailing whitespace and split into an array of lines.
var arr = input . trim ( ) . split ( "\n" );


// Step 3: Extract the first number 'n' from the array.
// The '-0' converts the string to a number.
var n = arr . shift ( ) - 0 ; // Number of elements (not directly used in later logic, but part of input format)


// Step 4: Extract and parse the main array 'a'.
// The second line of input contains space-separated numbers.
// map(Number) converts each string element to a number.
var a = arr . shift ( ) . split ( " " ) . map ( Number );

// Step 5: Create a sorted copy of array 'a', named 'b'.
// slice() creates a shallow copy, then sort() sorts it numerically.
var b = a . slice ( ) . sort ( ( x , y ) => x - y );

// Step 6: Extract the number of queries 'q'.
// The next line in 'arr' is 'q'.
var q = arr . shift ( ) - 0 ; // Number of queries


// Step 7: Parse the query coordinates.
// Each remaining line in 'arr' represents a query.
// 'v.split(" ")' splits the line by space.
// 'map(Number)' converts parts to numbers.
// 'map(v=>v-1)' converts 1-based indices to 0-based indices.
var xy = arr . map ( v => v . split ( " " ) . map ( Number ) . map ( v => v - 1 ) );

/*
 * The problem statement often implies that the 0th query is a "pre-check"
 * or a state before any actual swaps.
 * Here, a dummy query [0,0] is prepended.
 * This ensures the loop for queries starts from a consistent state (index 0)
 * and includes the initial configuration check.
 */
xy . unshift ( [ 0 , 0 ] ) ; // Prepend a dummy query for initial state check, ensures loop starts at i=0 for the first real state.


// Step 8: Initialize objects 'A' and 'B'.
// These objects will store elements where 'a' differs from 'b' at the same index.
var A = { } ; // Stores differing elements from array 'a'
var B = { } ; // Stores corresponding elements from sorted array 'b'


// Step 9: Populate 'A' and 'B' with differing elements.
// This loop iterates through the original array 'a' and its sorted version 'b'.
// If an element at a given index 'i' in 'a' is not equal to 'b[i]',
// then 'a[i]' is stored in 'A' at key 'i', and 'b[i]' in 'B' at key 'i'.
for ( var i = 0 ; i < a . length ; i ++ )
{
    if ( a [ i ] != b [ i ] )
    {
        A [ i ] = a [ i ] ; // Store the value from 'a' at index 'i'
        B [ i ] = b [ i ] ; // Store the value from 'b' at index 'i'
    }
}

// Step 10: Calculate the initial number of differing elements.
// This is the count of keys in object 'A'.
var num = Object . keys ( A ) . length ;

// Step 11: Create a string representation of the values in object 'B'.
// This will be used for comparison later.
var BB = "" ;
for ( var k in B )
{
    BB += B [ k ] ; // Concatenate values from B
}

// Step 12: Initialize a flag to track if the condition is met.
var flag = false ;

// Step 13: Main loop to process queries and check the condition.
// The loop runs from i=0 (initial state) up to 'q' (after all actual swaps).
for ( var i = 0 ; i <= q ; i ++ )
{
    // Perform a swap of elements in object 'A' based on the current query 'xy[i]'.
    // Note: This swaps values in 'A' only if the keys exist.
    // If a key doesn't exist in A, A[key] will be undefined, which is still a valid swap operation.
    [ A [ xy [ i ] [ 0 ] ] , A [ xy [ i ] [ 1 ] ] ] = [ A [ xy [ i ] [ 1 ] ] , A [ xy [ i ] [ 0 ] ] ] ;

    // Create a string representation of the current state of 'A'.
    var AA = "" ;
    for ( var k in A )
    {
        AA += A [ k ] ; // Concatenate values from A
    }

    // Check if the string representation of 'A' matches that of 'B'.
    // If they match, it means the elements in 'A' (the differing ones from 'a')
    // have been rearranged to match the order of 'B' (the differing ones from 'b').
    if ( AA == BB )
    {
        flag = true ; // Set the flag to true if a match is found.
        break ; // Exit the loop early as the condition is met.
    }
}


// Step 14: Output the result based on the conditions.
// Case 1: If 'num' is 0, it means 'a' was already sorted (or identical to 'b').
if ( num == 0 )
{
    console . log ( 0 ) ; // Output 0 if the array was already sorted.
}
// Case 2: If 'flag' is true, it means the condition was met at some point during the queries.
else if ( flag )
{
    console . log ( i ) ; // Output the query index 'i' at which the condition was met.
}
// Case 3: If neither of the above, it means the condition was never met.
else
{
    console . log ( -1 ) ; // Output -1 if the condition was never met.
}

// End of script.