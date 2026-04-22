/*
 * This JavaScript file implements a program that reads lines from standard input,
 * identifies a target word from the first line, and then counts the occurrences
 * of that target word in the subsequent lines. The final count is printed
 * to standard output. This structure is common for competitive programming
 * or scripting tasks where input is provided via stdin.
 */

// Define the primary function responsible for the word counting logic.
// It accepts an array of strings, where each string represents a line of input.
function main ( lines )
{
  // The first element of the 'lines' array is designated as the target word.
  // This word will be searched for in all subsequent lines.
  var target = lines [ 0 ] ; /* Initialize the 'target' variable with the first line. */

  // A counter variable is initialized to keep track of how many times
  // the 'target' word is found throughout the input.
  var wordCount = 0 ; /* This will store the final count. */

  // This loop iterates through the 'lines' array, starting from the second line (index 1).
  // The first line was already consumed to identify the target word.
  for ( var i = 1 ; i < lines . length ; i++ )
  {
    // For each line, it is split into individual words.
    // The regular expression /\s+/ is used as a delimiter, meaning one or more
    // whitespace characters (spaces, tabs, newlines) will separate words.
    var words = lines [ i ] . split ( / \s+ / ) ; /* Split current line into an array of words. */

    // This nested loop then iterates through each word obtained from the current line.
    for ( var wi = 0 ; wi < words . length ; wi++ )
    {
      // A strict equality check is performed to see if the current word
      // from the line exactly matches the 'target' word.
      if ( words [ wi ] === target )
      {
        // If a match is found, the 'wordCount' is incremented.
        wordCount++ ; /* Increment the counter for each match. */
      } // End of the 'if' condition block.
    } // End of the inner 'for' loop (iterating through words in a single line).
  } // End of the outer 'for' loop (iterating through all input lines).

  // After all lines have been processed and all words checked,
  // the final 'wordCount' is printed to the console (standard output).
  console . log ( wordCount ) ; /* Output the total count. */
} // End of the 'main' function.


// --- Standard Input Handling Section ---

// An empty array is declared to store incoming data chunks from standard input.
// Node.js often reads input in chunks, especially for large inputs.
var chunks = [ ] ; /* Array to hold raw input data. */

// An event listener is set up for the 'data' event on the standard input stream.
// This event fires whenever a new piece of data becomes available.
process . stdin . on ( 'data' , function ( chunk )
{
  // Each incoming 'chunk' of data (a Buffer object) is pushed into the 'chunks' array.
  chunks . push ( chunk ) ; /* Add the received data chunk. */
} ) ; // End of the 'data' event handler definition.

// Another event listener is set up for the 'end' event on the standard input stream.
// This event fires when the input stream has finished sending all its data.
process . stdin . on ( 'end' , function ( )
{
  // Once all chunks have been received, they are joined together into a single string.
  // Then, this complete string is split into an array of lines using the newline character ('\n')
  // as the delimiter. This prepares the data for the 'main' function.
  var lines = chunks . join ( '' ) . split ( '\n' ) ; /* Process all chunks into an array of lines. */

  // Finally, the 'main' function is called with the prepared 'lines' array,
  // initiating the word counting logic.
  main ( lines ) ; /* Execute the core application logic. */
} ) ; // End of the 'end' event handler definition.