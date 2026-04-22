/*
 * This JavaScript code processes input data.
 * It reads from standard input, parses it,
 * aggregates counts, and then sorts and prints the results.
 */

// Declare a variable to store the raw input data.
var   input   =    require('fs') .readFileSync( '/dev/stdin' ,  'utf8'  )  ;


// Trim whitespace from the input and split it into an array of lines.
var Arr =   (input.trim()) .split("\n") ;

// The first element of the array (AL) represents the number of data entries to process.
var      AL = Arr.shift() ;

// Initialize an empty object to serve as a hash map (dictionary) for aggregation.
var   hash    =   { } ;

// --- Start of the first processing loop ---
// This loop iterates 'AL' times, processing each data entry.
for ( var  i = 0 ;  i < AL ;  i++ )
{
    // Split the current line into an array based on space.
    var    arr   =   Arr[i] .split(" ") ;

    // The first part is the key (identifier).
    var   a    =   arr[0] ;

    // Check if the key already exists in the hash map.
    // If not, initialize its count to zero.
    if  ( !hash.hasOwnProperty(a) )
    {
        hash[a] = 0 ;
    }

    // Add the second part (converted to a number) to the count for the current key.
    // The '-0' forces numeric conversion.
    hash[a]   +=   arr[1] - 0 ;
} // End of the first processing loop.


// Initialize an empty array to store the keys from the hash map.
var   X = [ ] ;

// --- Start of loop to extract keys ---
// Iterate over the properties (keys) of the 'hash' object.
for ( var   i   in   hash )
{
    X.push(i) ; // Add each key to the 'X' array.
}
// End of key extraction loop.

// Sort the 'X' array alphabetically.
X.sort() ;

// Initialize a variable to keep track of the maximum length found among the keys.
var    Max = 0 ;

// --- Start of loop to find the maximum key length ---
for ( var   i = 0 ;   i < X.length ;   i++ )
{
    // If the current key's length is greater than or equal to 'Max', update 'Max'.
    if ( Max <= X[i].length )
    {
        Max = X[i].length ;
    }
}
// End of loop for max key length.


// Initialize an empty array 'Y' which will store keys sorted by length then alphabetically.
var   Y   =   [ ] ;

// --- Start of loop to sort keys by length ---
// This loop iterates from length 1 up to the maximum key length found.
for ( var   i = 1 ;   i <= Max ;   i++ )
{
    // Filter 'X' to get all keys with the current length 'i'.
    var   F   =   X.filter( function(v) { return v.length == i; } ) ;

    // Concatenate the filtered keys 'F' to the 'Y' array.
    // This effectively groups keys by length, maintaining alphabetical order within each group.
    Y = Y.concat(F) ;
}
// End of loop for sorting keys by length.

// --- Start of final output loop ---
// Iterate through the 'Y' array (keys sorted by length and alphabetically).
for ( var   i = 0 ;   i < Y.length ;   i++ )
{
    // Print each key and its corresponding aggregated count from the 'hash' map.
    console.log( Y[i] + " " + hash[Y[i]] ) ;
}
// End of final output loop.