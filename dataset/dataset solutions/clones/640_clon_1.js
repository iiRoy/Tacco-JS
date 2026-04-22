/*
 * This JavaScript code processes numerical input data
 * from standard input to solve a dynamic programming problem.
 * It calculates a minimum cost based on two sets of numbers.
 */

// Utilize the 'fs' (file system) module to read input synchronously.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' );


// Process the raw input string:
// 1. Remove leading/trailing whitespace using .trim().
// 2. Split the string into an array of lines based on the newline character.
var arr = input . trim ( ) . split ( "\n" ) ;


// Extract the first line, which contains two space-separated numbers.
// 1. Remove the first element from 'arr' using .shift().
// 2. Split this element by space.
// 3. Convert each resulting string part into a Number using .map(Number).
var nm = arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Assign the extracted numbers to variables 'n' and 'm'.
var n = nm [ 0 ] ; // 'n' typically represents the count of items in array 'd'.
var m = nm [ 1 ] ; // 'm' typically represents the count of items in array 'c'.


// Initialize array 'd' to store 'n' numbers from the input.
var d = [ ] ;
// Loop 'n' times to populate 'd'.
for ( var i = 0 ; i < n ; i ++ )
{
    // Remove the next line from 'arr', convert it to a number, and push to 'd'.
    // Subtracting 0 is a common trick to cast a string to a number.
    d . push ( arr . shift ( ) - 0 ) ;
}


// Initialize array 'c' to store 'm' numbers from the input.
var c = [ ] ;
// Loop 'm' times to populate 'c'.
for ( var i = 0 ; i < m ; i ++ )
{
    // Remove the next line from 'arr', convert it to a number, and push to 'c'.
    c . push ( arr . shift ( ) - 0 ) ;
}


// Initialize a 2D array 'dp' (dynamic programming table).
var dp = [ ] ;

// Populate the 'dp' table with initial values.
// The table dimensions are (m+1) rows by (n+1) columns.
for ( var i = 0 ; i <= m ; i ++ )
{
    dp [ i ] = [ ] ; // Initialize the current row as an empty array.
    for ( var j = 0 ; j <= n ; j ++ )
    {
        dp [ i ] [ j ] = Infinity ; // Set each cell to positive Infinity as a starting large value.
    }
}


// Set the base case for the dynamic programming.
// dp[0][0] represents the cost of processing 0 items from 'c' and 0 items from 'd', which is 0.
dp [ 0 ] [ 0 ] = 0 ;


// Main dynamic programming computation loop.
// This calculates the minimum cost to match 'j' items from 'd' using 'i' items from 'c'.
for ( var i = 0 ; i < m ; i ++ )
{
    for ( var j = 0 ; j < n ; j ++ )
    {
        // Option 1: Skip the current item c[i].
        // The cost to process 'j' items from 'd' using 'i+1' items from 'c'
        // is at least the cost of processing 'j' items from 'd' using 'i' items from 'c'.
        dp [ i + 1 ] [ j ] = Math . min ( dp [ i + 1 ] [ j ] , dp [ i ] [ j ] ) ;

        // Option 2: Use the current item c[i] to match with d[j].
        // The cost to process 'j+1' items from 'd' using 'i+1' items from 'c'
        // includes the cost of processing 'j' items from 'd' using 'i' items from 'c',
        // plus the cost of matching c[i] with d[j] (c[i] * d[j]).
        dp [ i + 1 ] [ j + 1 ] = Math . min ( dp [ i + 1 ] [ j + 1 ] , dp [ i ] [ j ] + c [ i ] * d [ j ] ) ;
    }
}


// After filling the DP table, find the overall minimum cost.
// The minimum cost to process all 'n' items from 'd' will be found
// in the last column (index 'n') across all rows (up to 'm').
var min = Infinity ; // Initialize 'min' with a very large value.
for ( var i = 0 ; i <= m ; i ++ )
{
    min = Math . min ( min , dp [ i ] [ n ] ) ; // Update 'min' if a smaller value is found.
}


// Output the final calculated minimum value to the console.
console . log ( min ) ;