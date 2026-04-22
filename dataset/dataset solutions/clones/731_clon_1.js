/*
 * This JavaScript program processes input from standard input.
 * It expects a series of lines, each containing three space-separated numbers.
 * The program then performs calculations based on these numbers
 * to find a maximum value, which is then printed to the console.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// Resume standard input stream to ensure data is not lost.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach a 'data' event listener to the standard input stream.
// This function will be called whenever data is available from stdin.
process.stdin.on(
  'data',
  function ( raw )
  {
    // Split the raw input string by newline characters to get individual lines.
    raw = raw.split( '\n' );

    // Iterate over each line obtained from the input.
    // The 'for...in' loop iterates over the keys (indices) of the 'raw' array.
    for ( var row_idx in raw )
    {
      // Get the current line using its index and split it by spaces
      // to obtain an array of string numbers.
      var row = raw[row_idx].split( ' ' );

      // Check if the first three elements of the current row are truthy after
      // a bitwise OR operation. This effectively checks if they are not all zero
      // or empty strings, indicating valid input parts.
      if ( row[0] | row[1] | row[2] )
      {
        // Convert the string numbers to integers using the bitwise OR with 0.
        // This is a common and concise way to perform integer conversion in JavaScript.
        row[0] |= 0;
        row[1] |= 0;
        row[2] |= 0;

        // Initialize 'max' variable to store the maximum calculated value.
        var max = 0;

        // Calculate rate1 based on the first input number.
        // It's effectively (input_num / 100) + 1.
        var rate1 = row[0] / 100 + 1;

        // Calculate rate2 based on the second input number.
        // It's also (input_num / 100) + 1.
        var rate2 = row[1] / 100 + 1;

        // Begin a nested loop structure to iterate through possible values for 'i' and 'j'.
        // Both loops run from 1 up to (but not including) 1000.
        for ( var i = 1; i < 1000; i++ )
        {
          for ( var j = 1; j < 1000; j++ )
          {
            // Perform a calculation: (i * rate1) and (j * rate1) are truncated to integers,
            // then added together. If this sum equals the third input number (row[2]),
            // then a potential 'max' value can be calculated.
            if ( ( i * rate1 | 0 ) + ( j * rate1 | 0 ) === row[2] )
            {
              // If the condition is met, calculate a new value using rate2.
              // This value is also truncated to an integer.
              // Update 'max' if the newly calculated value is greater than the current 'max'.
              max = Math.max( max, ( i * rate2 | 0 ) + ( j * rate2 | 0 ) );
            }
          } // End of inner loop for 'j'
        } // End of outer loop for 'i'

        // Print the final calculated maximum value for the current input line to the console.
        console.log( max );

      } // End of if condition for valid input parts.
    } // End of for...in loop over raw input lines.
  } // End of data event handler function.
); // End of process.stdin.on call.