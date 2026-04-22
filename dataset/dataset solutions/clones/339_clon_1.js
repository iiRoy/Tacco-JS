/*
 * This JavaScript program processes input data from standard input.
 * It reads lines, parses key-value pairs, aggregates values by key,
 * sorts the aggregated values, and then prints the results.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize an empty object to store aggregated data.
var obj = { } ;

// Loop through each line in the input array.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Split the current line into an array of parts based on space.
    var arr = Arr [ i ] . split ( " " ) ;

    // Extract the first part as key 'a'.
    var a = arr [ 0 ] ;

    // Extract the second part as value 'b'.
    var b = arr [ 1 ] ;

    // Check if key 'a' already exists in the 'obj'.
    if ( a in obj )
    {
        // If it exists, append the new value 'b' with a space separator.
        obj [ a ] += ( " " + b ) ;
    }
    else
    {
        // If it doesn't exist, assign 'b' as the initial value for key 'a'.
        obj [ a ] = b ;
    }
} // End of first processing loop.


// Initialize an empty array to store the keys from the 'obj'.
var keys = [ ] ;

// Iterate over each key-value pair in the 'obj'.
for ( var k in obj )
{
    // Add the current key to the 'keys' array.
    keys . push ( k ) ;

    /*
     * For each key, take its aggregated string value,
     * split it by space, convert each part to a Number,
     * sort these numbers in ascending order, and then
     * join them back into a space-separated string.
     */
    obj [ k ] = obj [ k ] . split ( " " ) . map ( Number ) . sort ( function ( a , b ) { return a - b ; } ) . join ( " " ) ;
} // End of key processing loop.


// Sort the array of keys alphabetically.
keys . sort ( ) ;


// Loop through the sorted keys and print the results.
for ( var i = 0 ; i < keys . length ; i ++ )
{
    // Print the key, a newline character, and its corresponding sorted values.
    console . log ( keys [ i ] + "\n" + obj [ keys [ i ] ] ) ;
} // End of printing loop.