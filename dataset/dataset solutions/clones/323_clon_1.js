/*
 * This script reads input from stdin, processes it,
 * and prints the modified output to stdout.
 */
var input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ;


// Define the word to be replaced and its replacement
var  wrongWord   =   "Hoshino"   ;

var  correctWord = "Hoshina" ;

// This variable will store the processed line
var word2 ;

// The original comment was in Japanese. Let's replace it with an English one.
// Input processing starts here.
var array = ( input.trim() ).split( "\n" ) ;


// Loop through each line provided in the input array.
for ( var aoj = 1 ; aoj <= array[0] ; aoj++ )
{
    /*
     * Split the current line into individual words.
     * Assuming words are space-separated.
     */
    var word = array[aoj].split( " " ) ;

    // Iterate over each word in the current line.
    for ( var j = 0 ; j < word.length ; j++ )
    {
        // Check if the current word matches the 'wrongWord'.
        if  ( word[j]  ==  wrongWord )
        {
            // If it matches, replace it with the 'correctWord'.
            word[j] = correctWord ;
        }
    }


    /*
     * Reconstruct the line. If there's more than one word,
     * join them with spaces. Otherwise, just use the single word.
     */
    if  ( word.length > 1 )
    {
        word2 = word[0] ; // Start with the first word

        // Concatenate subsequent words with a space in between.
        for  ( var i = 1 ; i < word.length ; i++ )
        {
            word2 += " " + word[i] ;
        }
    }
    else
    {
        // If there's only one word, no need to join.
        word2 = word[0] ;
    }

    // Output the processed line to the console.
    console.log( word2 ) ;

} // End of main loop.

// Script execution complete.