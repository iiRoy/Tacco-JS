// This script reads input from stdin, processes a string, and prints the result.

// Import the 'fs' (file system) module to read files.
var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// The first line of input (n) is shifted off and stored.
// It seems 'n' is not used later in this specific logic, but it's part of the input structure.
var n   =   arr . shift ( ) ;

// The second line of input (str) is shifted off.
var str = arr . shift ( ) ;

// Remove all spaces from the 'str' variable.
str = str . replace ( / /g , "" ) ;


// Loop until the 'str' variable has a length of 1 character.
while ( str . length   !=   1 )
{
   // Replace the first two characters of 'str' based on a specific set of rules.
   str   =   str . replace ( /../ ,   function ( s )
   {
      // If the two characters are "TT", replace with "T".
      if ( s   ==   "TT" )
         return   "T" ;
      // If the two characters are "TF", replace with "F".
      if ( s   ==   "TF" )
         return   "F" ;
      // If the two characters are "FT", replace with "T".
      if ( s   ==   "FT" )
         return   "T" ;
      // If the two characters are "FF", replace with "T".
      if ( s   ==   "FF" )
         return   "T" ;
   } ) ;
}

// Print the final single-character string to the console.
console . log ( str ) ;