/*
 * This JavaScript file extends the String prototype and processes standard input.
 * It filters words based on their length and then outputs them.
 */

// Define a custom method 'repAll' on the String prototype
// This method replaces all occurrences of a substring with another.
String . prototype . repAll = function (a, b)
{
    // The core logic: split the string by 'a' and then join the parts back with 'b'.
    return this . split (a) . join (b) ;

} // End of String.prototype.repAll method definition.


// Initialize an empty array to store words that meet specific criteria.
var words = [ ] ;


// Prepare to read from standard input.
process . stdin . resume ( ) ; // Keeps the process running even if there's no more input initially.
process . stdin . setEncoding ( 'utf8' ) ; // Specifies the character encoding for the input stream.


// Set up an event listener for when data is received from standard input.
process . stdin . on ( 'data', function(input)
{
    // First, replace all periods and commas in the input string with spaces.
    // Then, split the resulting string by spaces to get an array of potential words.
    var arr = input . repAll ( ".", " " ) . repAll ( ",", " " ) . split ( " " ) ;

    // Iterate over each item (potential word) in the 'arr' array.
    for ( var i in arr )
    {
        // Check if the current word's length is greater than 2 AND less than 7.
        // This filters for words with lengths 3, 4, 5, or 6 characters long.
        if ( arr[i] . length > 2 && arr[i] . length < 7 )
        {
            // If the word meets the length criteria, add it to the 'words' array.
            words . push ( arr[i] ) ;
        }
    }
} ) ; // End of the 'data' event handler function.


// Set up an event listener for when the standard input stream ends.
process . stdin . on ( 'end', function ( )
{
    // Once all input has been processed and the stream has ended,
    // join all the collected words in the 'words' array with a space
    // and print the resulting string to the console.
    console . log ( words . join ( " " ) ) ;
} ) ; // End of the 'end' event handler function.

// The script finishes execution after the 'end' event is handled.