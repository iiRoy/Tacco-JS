/* This script processes an input string,
 * replacing specific keywords, and then
 * determines a final output based on the
 * transformed string's longest segment.
 */

// Module import for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


// Step 1: Pre-process the input string.
// Remove leading/trailing whitespace and replace 'egg' with 'E' and 'chicken' with 'C'.
var str = ( input . trim() )
          . replace( /egg/g , "E" ) // Replace all occurrences of 'egg'
          . replace( /chicken/g , "C" ) ; // Replace all occurrences of 'chicken'


// Step 2: Resolve consecutive 'E's.
// Loop to replace "EE" with "EAE" until no more "EE" pairs exist.
while ( /EE/ . test( str ) )
{
  str = str . replace( /EE/g , "EAE" ) ;
}


// Step 3: Resolve consecutive 'C's.
// Loop to replace "CC" with "CAC" until no more "CC" pairs exist.
while ( /CC/ . test( str ) )
{
  str = str . replace( /CC/g , "CAC" ) ;
}


// Step 4: Split the processed string into an array using 'A' as a delimiter.
var ary = str . split( "A" ) ; // 'ary' will hold segments.


// Initialize an empty string to store the longest segment found.
var ans = "" ; // 'ans' will store the final answer segment.

// Step 5: Iterate through the array to find the longest segment.
ary . forEach( function ( v )
{
  // Compare current segment length with the length of the longest found so far.
  if ( ans . length < v . length )
  {
    ans = v ; // Update 'ans' if a longer segment is found.
  }
} ) ;


// Step 6: Determine the final output based on the last character of the longest segment.
// If the last character is 'E', output "egg"; otherwise, output "chicken".
console . log( ( ans . slice( -1 ) == "E" ) ? "egg" : "chicken" ) ;

// End of script.