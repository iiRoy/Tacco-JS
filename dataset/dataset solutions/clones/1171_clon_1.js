let content = ''; /* This variable will accumulate all chunks received. */


process . stdin . resume(); // Ensures the input stream is ready.


process
  .stdin
  .setEncoding('utf8'); // Important for correct character interpretation.


/*
 * Event listener for 'data' chunks received from stdin.
 * Each chunk (buf) is appended to the 'content' variable.
 */
process.stdin.on('data' , buf => {
  // Appending the current data buffer to the content string.
  content += buf ;
});


// Event listener for the 'end' signal from stdin, indicating no more data.
process . stdin . on ( 'end' , () => { // This block executes once all input has been received.

  // Declaring an array 'points' but it's not actually used in the calculation.
  const points = [ 0 , 0 ] ; /* This line seems to be a leftover or placeholder,
                           as 'points' is not referenced later in the code. */

  // Processing the received content:
  // 1. Trim whitespace from the start/end.
  // 2. Split the string by spaces to get individual coordinate values.
  // 3. Destructure the resulting array into x1, y1, x2, y2.
  let [ x1 , y1 , x2 , y2 ] = content . trim() . split(' ') ;

  /*
   * Calculating the Euclidean distance between two points (x1, y1) and (x2, y2).
   * Formula: sqrt((x2-x1)^2 + (y2-y1)^2)
   * Math.pow(base, exponent) is used for squaring.
   * Math.sqrt() calculates the square root.
   */
  const distance = Math . sqrt (
    Math . pow ( x1 - x2 , 2 ) + Math . pow ( y1 - y2 , 2 )
  );

  // Printing the calculated distance to standard output, formatted to 6 decimal places.
  console . log ( distance . toFixed ( 6 ) ) ; // Outputting the final result.

}); // End of the 'end' event listener.