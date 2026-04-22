/*
 * This JavaScript program processes input from standard input,
 * line by line, to generate a specific numerical sequence.
 * It identifies occurrences of 'c' and calculates distances to them.
 */

// We begin by importing the 'fs' module, which provides file system functionalities.
// Then, we read the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// The input string is first trimmed to remove any leading/trailing whitespace,
// and then split into an array of strings based on newline characters.
// Each element of 'Arr' will now represent a single line from the input.
var Arr = input . trim( ) . split( "\n" ) ;

// The first element of the array 'Arr' is removed.
// This is a common pattern where the first line might contain metadata
// like the number of test cases, which is not needed for the iteration itself.
Arr . shift( ) ;

// We iterate over each remaining line in the 'Arr' array.
// 'v' represents the current line (a string) being processed.
Arr . forEach(
    function ( v )
    {
        // Initialize an empty array named 'ans' which will store the
        // calculated numerical sequence for the current line.
        var ans = [ ] ;

        // The current line 'v' is split into an array of individual characters.
        // For example, if v is "c.c", arr will be ["c", ".", "c"].
        var arr = v . split( "" ) ;

        // Initialize a variable 't' to -1.
        // 't' will act as a counter or flag, primarily tracking the distance
        // from the last encountered 'c' character.
        var t = -1 ;

        // A standard 'for' loop is used to iterate through each character
        // in the 'arr' (character array) from left to right.
        for (
            var i = 0 ;
            i < arr . length ;
            i ++
        )
        {
            // Check if the current character is 'c'.
            if ( arr [ i ] == "c" )
            {
                ans . push( 0 ) ; // If it's 'c', the distance to itself is 0.
                t = 1 ;           // Reset 't' to 1, indicating the next character
                                  // will be 1 unit away from this 'c'.
            }
            // If the current character is '.' AND 't' is still -1.
            // This means a '.' is encountered before any 'c' has been seen.
            else if ( arr [ i ] == "." && t == -1 )
            {
                ans . push( t ) ; // In this case, push -1 (the initial value of t).
            }
            // If the current character is '.' AND 't' is not -1.
            // This implies a 'c' has been encountered previously, and 't' holds
            // the distance from that 'c'.
            else if ( arr [ i ] == "." && t != -1 )
            {
                ans . push( t ) ; // Add the current distance 't' to the result array.
                t ++ ;            // Increment 't' as we move further away from the 'c'.
            }
        }

        // After processing all characters for the current line,
        // the elements of the 'ans' array are joined together with a space
        // and then printed to the console, followed by a newline.
        console . log( ans . join( " " ) ) ;
    }
) ;