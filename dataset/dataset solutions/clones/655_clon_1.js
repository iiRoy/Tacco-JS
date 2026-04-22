/*
 * This JavaScript file processes input from stdin,
 * sums pairs of numbers from each line, and outputs the result to stdout.
 * It's designed to read all data first, then process it.
 */


// Resume the standard input stream to begin receiving data.
process . stdin . resume ( ) ;


// Set the encoding for the standard input stream to UTF-8.
// This ensures proper handling of various characters.
process . stdin . setEncoding ( "utf8" ) ;


// Declare a variable to accumulate all incoming data chunks.
var   alldata   =   ""   ;


/**
 * Event listener for the 'data' event on stdin.
 * This function is called whenever a new chunk of data is available.
 * It appends the received chunk to the 'alldata' variable.
 * @param {string} chunk - The received data chunk.
 */
process . stdin . on ( "data" , function (   chunk   )   {
  alldata   +=   chunk   ;
} ) ;


/**
 * Event listener for the 'end' event on stdin.
 * This function is called once all input data has been received.
 * It then processes the accumulated data line by line.
 */
process . stdin . on ( "end" , function ( )   {

  // Split the accumulated data into an array of lines.
  var   data   =   alldata . split ( "\n" ) ;

  // Define a regular expression to parse two numbers from each line.
  // It captures two groups of one or more digits.
  var   reg   =   /([\d]+) ([\d]+)/   ;

  // Loop through each line of the input data.
  for (   var   i   =   0   ;   i   <   data . length   ;   i   ++   )   {

    // Execute the regular expression on the current line.
    // The result will be an array if a match is found.
    var   result   =   reg . exec ( data [   i   ]   )   ;

    // Check if a match was found and if it contains two captured groups (the two numbers).
    if (   result   &&   result . length   ===   3   )   {

      // Parse the first and second captured numbers as integers and sum them.
      // Then convert the sum back to a string for output.
      process . stdout . write (   (   parseInt (   result [   1   ]   )   +   parseInt (   result [   2   ]   )   ) . toString ( )   )   ;

      // Write a newline character to stdout after each sum.
      process . stdout . write (   "\n"   )   ;

    } // End of if condition for result validation

  } // End of for loop iterating through data lines

} ) ;