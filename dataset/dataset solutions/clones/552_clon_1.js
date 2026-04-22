// This file processes input data for a simple string translation task.
// It reads key-value pairs and then translates a list of strings based on these pairs.
// The input is expected to come from standard input.

var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// The entire input string is first trimmed to remove any leading/trailing whitespace,
// and then split into an array of lines based on the newline character.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// The main processing loop. It continues as long as there's enough data
// in the 'Arr' array to perform at least one translation block.
while ( Arr . length > 1 )
{

    // The first line of each block indicates the number of key-value pairs (AL = Array Length).
    var AL = Arr . shift ( ) ;


    // An empty JavaScript object is initialized to serve as a hash map (dictionary)
    // for storing the translation rules.
    var hash = { } ;


    // This loop populates the 'hash' map with the specified number of key-value pairs.
    for ( var i = 0 ; i < AL ; i ++ )
    {
        // Each key-value pair is read from a line, split by a space.
        var arr = ( Arr . shift ( ) ) . split ( " " ) ;

        // The first part of the split array becomes the key, the second part becomes the value.
        hash [ arr [ 0 ] ] = arr [ 1 ] ;
    } // End of loop for populating hash map.


    // After the hash map is built, the next line specifies how many strings need to be translated.
    var AL = Arr . shift ( ) ;


    // An empty string is initialized to accumulate the translated output.
    var str = "" ;


    // This loop iterates through the strings that need translation.
    for ( var i = 0 ; i < AL ; i ++ )
    {
        // Get the current string to be translated from the input array.
        var k = Arr . shift ( ) ;

        // Check if the string 'k' exists as a key in our 'hash' map.
        // If it does, append its corresponding value to 'str'.
        // Otherwise, append the original string 'k' itself.
        str += ( k in hash ) ? hash [ k ] : k ;
    } // End of loop for translating strings.


    // The final translated string for the current block is printed to the console.
    console . log ( str ) ;


    // A special condition to break the main loop: if the next element in 'Arr' is "0",
    // it signifies the end of all input blocks.
    if ( Arr [ 0 ] == "0" )
    {
        break ; // Exit the while loop.
    }

} // End of main processing loop.

// End of script.