/*
 * This is the main function responsible for processing the input lines.
 * It expects an array of strings, where the first element is the number
 * of words, and subsequent elements are the words themselves.
 */
function   main ( lines )
{
    // Declare a variable to store the count of words.
    var    noWords    =    parseInt ( lines[0] ,   10 ) ;

    // Extract words from the input, excluding the first line, and then sort them alphabetically.
    var    words    =    lines . slice ( 1 ) . sort ( ) ;


    // Print the first word after sorting, which will be the alphabetically smallest word.
    console . log ( words[0] ) ;
}


// Declare an array to accumulate incoming data chunks from standard input.
var    chunks    =    [ ] ;

// Set up an event listener for 'data' events on standard input.
// Each time data is received, it's pushed into the 'chunks' array.
process . stdin . on ( 'data' ,   function ( chunk )
{
    // Add the received chunk of data to our collection.
    chunks . push ( chunk ) ;
} ) ;


// Set up an event listener for the 'end' event on standard input.
// This signifies that all input has been received.
process . stdin . on ( 'end' ,   function ( )
{
    // Join all received chunks into a single string, then split it into an array of lines.
    var    lines    =    chunks . join ( '' ) . split ( '\n' ) ;

    // Call the main processing function with the array of lines.
    main ( lines ) ;
} ) ;