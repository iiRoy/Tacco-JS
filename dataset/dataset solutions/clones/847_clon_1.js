// This script processes input from standard input to determine a specific output.
// It's designed to simulate a peculiar string manipulation challenge based on specific string patterns.
// It reads a line, performs several replacements, splits the result, and then finds the longest segment.
// Finally, it checks the last character of this longest segment to print "egg" or "chicken".

var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ; // Reads the entire input from /dev/stdin as a UTF-8 string.


// First, the input string is trimmed of leading/trailing whitespace.
// Then, all occurrences of "gg" and "hicken" are removed globally.
var str = ( input . trim( ) ) . replace( /gg|hicken/g , "" ) ;


// This loop continuously replaces "ee" with "eAe" within the string 'str'.
// It repeats until no more "ee" substrings are found in 'str'.
while ( /ee/ . test( str ) )
{
    str = str . replace( /ee/g , "eAe" ) ;
}


// Similar to the previous loop, this one replaces "cc" with "cAc".
// This process continues until all "cc" sequences have been transformed.
while ( /cc/ . test( str ) )
{
    str = str . replace( /cc/g , "cAc" ) ;
}


// The modified string 'str' is then split into an array of substrings.
// The splitting character used is 'A', which was introduced in the previous replacement steps.
var ary = str . split( "A" ) ;


// An empty string variable 'ans' is initialized.
// This variable will be used to store the longest substring found in 'ary'.
var ans = "" ;


// The forEach method iterates over each element (substring) in the 'ary' array.
ary . forEach( function ( v )
{
    // Inside the loop, it compares the length of the current substring 'v'
    // with the length of the string currently stored in 'ans'.
    if ( ans . length < v . length )
    {
        // If 'v' is longer, it updates 'ans' to hold 'v'.
        ans = v ;
    }
} ) ;


// Finally, the script determines the output based on the last character of the 'ans' string.
// It uses slice(-1) to get the last character.
// If the last character is 'e', it prints "egg", otherwise it prints "chicken".
console . log( ( ans . slice( -1 ) == "e" ) ? "egg" : "chicken" ) ;