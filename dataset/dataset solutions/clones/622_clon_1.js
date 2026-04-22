/*
 * This is a Type I clone of a JavaScript program.
 * It processes input from stdin, aggregates data in a hash map,
 * and then sorts and prints the results.
 * No logical or structural changes have been made, only
 * whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical clone.
 */
// Import the 'fs' module to read from the file system.
var input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' );


// Trim whitespace from the input and split it into an array of lines.
var   Arr  =  ( input.trim() ) . split ( "\n" );


// Get the first line, which is assumed to be the count of subsequent lines.
var AL = Arr . shift();


// Initialize an empty hash map (object) to store aggregated data.
var hash = {};


// Loop through the remaining lines of input based on the 'AL' count.
for ( var i = 0 ;   i < AL ;   i ++ )
{
    // Split each line by space to get individual components.
    var arr = Arr[i] . split ( " " );

    // The first component is the key for our hash map.
    var a = arr[0];

    // If the key does not exist in the hash map, initialize its value to 0.
    if ( ! hash . hasOwnProperty ( a ) )
    {
        hash[a] = 0;
    }

    // Add the second component (converted to a number) to the value associated with the key.
    hash[a] += arr[1] - 0; // The '- 0' ensures string-to-number conversion.
}


// Initialize an empty array to store the keys from the hash map.
var K = [];

// Iterate over the keys in the hash map and add them to the 'K' array.
for ( var i in hash )
{
  K.push( i );
}


// Define a custom comparison function for sorting strings by length.
// This function will be used with K.sort() later.
function ab( a, b )
{
    // Compare lengths of the two strings.
    if ( a.length > b.length )
    {
        return 1; // 'a' is longer, so it should come after 'b'.
    }
    if ( a.length < b.length )
    {
        return -1; // 'a' is shorter, so it should come before 'b'.
    }
    return 0; // Lengths are equal, maintain relative order.
}


// Sort the array of keys lexicographically (alphabetically).
// This sort will be overridden by the next one, but is kept for Type I fidelity.
K.sort();

// Sort the array of keys again, this time using the custom length-based comparison function.
K.sort( ab );


// Loop through the sorted keys and print each key along with its corresponding aggregated value.
for ( var i = 0 ;   i < K.length ;   i ++ )
{
    console.log( K[i] + " " + hash[K[i]] );
}