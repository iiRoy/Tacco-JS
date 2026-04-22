/*
 * This JavaScript file processes input from stdin, counts the frequency of
 * each lowercase English letter, and then prints the counts.
 * It's a demonstration of character frequency analysis.
 */

//  Import the 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' ) ;


//  Split the entire input content into an array of lines, using newline as delimiter.
var lines = input . split( '\n' ) ;


//  Initialize an array to store the sum (frequency count) for each letter.
//  The indices will correspond to 'a' through 'z'.
var sum = [ ] ;

//  Loop through each line provided in the input.
for ( var i = 0 ;  i < lines . length ;  i++ )
{
    //  Retrieve and remove the first line from the array for processing.
    var line = lines . shift( ) ;

    //  Split the current line into an array of individual characters.
    var cs = line . split( '' ) ;

    //  Iterate over each character in the current line.
    cs . forEach( function ( c )
    {
        //  Convert the character to its lowercase equivalent for case-insensitive counting.
        var low = c . toLowerCase( ) ;

        //  Check if the lowercase character is not an English alphabet letter.
        if ( low < 'a'  ||  low > 'z' )
        {
            //  If it's not a letter, skip to the next character.
            return ;
        }

        //  Calculate the index for the 'sum' array (0 for 'a', 1 for 'b', etc.).
        var idx = low . charCodeAt( 0 )  -  'a' . charCodeAt( 0 ) ;

        //  Ensure the sum at this index is initialized to 0 if it's currently undefined.
        sum[ idx ]  |=  0 ;

        //  Increment the count for the current letter.
        sum[ idx ] ++ ;
    } ) ; // End of forEach for characters.
} // End of for loop for lines.


//  Get the ASCII code for the character 'a' to use as a base for conversion.
var base = 'a' . charCodeAt( 0 ) ;

//  Loop from 0 to 25 (representing 'a' through 'z').
for ( var i = 0 ;  i < 26 ;  i++ )
{
    //  Convert the current index back to its corresponding character.
    var c = String . fromCharCode( base  +  i ) ;

    //  Get the count for the current character, defaulting to 0 if no count was recorded.
    var cnt = sum[ i ]  ||  0 ;

    //  Print the character and its frequency count to the console.
    console . log( c  +  ' : '  +  cnt ) ;
}

//  End of program execution.
//  Thank you for reviewing this code!