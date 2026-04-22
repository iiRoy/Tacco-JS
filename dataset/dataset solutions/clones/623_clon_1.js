var input = require('fs').readFileSync(
    '/dev/stdin', // This specifies the standard input file path.
    'utf8'        // The encoding used to read the file content.
) ; // End of the input reading statement.

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var Arr = ( input.trim() ) . split( "\n" ) ;

// The first element of the array (which is the first line of input) is the count.
var AL = Arr.shift() ;

// Initialize an empty JavaScript object to act as a hash map (dictionary).
var hash = { } ;

// Loop through the remaining lines of the input array.
for ( var i = 0 ; i < AL ; i ++ )
{
    // Split each line by space to separate the key and its value.
    var arr = Arr[ i ] . split( " " ) ;

    // The first part of the split line is our key.
    var a = arr[ 0 ] ;

    // Check if the hash map already contains this key.
    if ( ! hash . hasOwnProperty( a ) )
    {
        // If the key is new, initialize its value to zero.
        hash[ a ] = 0 ;
    }
    
    // Add the numeric value (second part of the split line) to the key's current total.
    // The `-0` ensures the string is converted to a number.
    hash[ a ] += arr[ 1 ] - 0 ;
}

// Declare an empty array to store the keys from our hash map.
var K = [ ] ;

// Iterate over the properties (keys) of the hash map.
for ( var i in hash )
{
    // Add each key to the array K.
    K . push( i ) ;
}
 
// Sort the array of keys alphabetically.
K . sort( ) ;

// Loop through the sorted keys and print each key along with its accumulated value.
for ( var i = 0 ; i < K . length ; i ++ )
{
    console . log( K[ i ] + " " + hash[ K[ i ] ] ) ;
}
// End of the program logic.