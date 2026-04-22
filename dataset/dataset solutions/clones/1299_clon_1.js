// Initialize a string to accumulate input data
var input = ''; // This variable will store all incoming data chunks from stdin.

/*
 * Obtain the standard input stream object.
 * In Node.js, 'process.stdin' provides access to the standard input.
 */
var readable = process.stdin;

// Ensure the input stream is flowing.
// Without this, the 'data' event might not be emitted.
readable.resume();

// Set the character encoding for the input stream.
// 'utf-8' is a common and robust encoding for text data.
readable.setEncoding( 'utf-8' );

/*
 * Register an event listener for the 'data' event.
 * This event is emitted whenever a chunk of data is available from the input stream.
 * The 'chunk' parameter contains the piece of data received.
 */
readable.on( 'data', function( chunk ) {
  // Append the received data chunk to the 'input' string.
  // This accumulates all input until the 'end' event.
  input += chunk;
} ); // End of 'data' event handler function


// Register an event listener for the 'end' event.
// This event signifies that the input stream has finished and no more data will be received.
readable.on( 'end', function( ) { // The 'end' event means all input has been read.

  /*
   * Process the accumulated input.
   * First, split the entire input string by newline characters to get an array of lines.
   */
  var data = input.split( '\n' ); // Each element in 'data' is a single line from the input.

  // Parse the first line of the input to extract problem parameters (r and c).
  // It's assumed the first line contains space-separated numbers.
  var nums = data[0].split( ' ' ).map( Number );

  // Extract the number of rows (r) and columns (c) from the parsed numbers.
  var r = nums[0]; // 'r' represents the number of rows.
  var c = nums[1]; /* 'c' represents the number of columns in the data grid */

  // Declare and initialize an array 'rc' to store column sums.
  // It will have 'c' elements for column sums and an additional element for the grand total sum.
  var rc = Array( c+1 );

  // Initialize all elements of the 'rc' array to zero.
  for ( var i = 0; i <= c; i++ ) { // Loop from 0 up to and including 'c'.
    rc[i] = 0; // Set current element to 0.
  } // End of initialization loop for 'rc' array

  // Initialize an empty array to store the formatted output lines.
  var output = [ ]; // This array will hold strings, each representing a line of final output.

  /*
   * Iterate over the data lines, starting from the second line (index 1),
   * as the first line contains 'r' and 'c' and not actual data.
   */
  for ( var index = 1; index < data.length; index++ ) {

    // Parse the current data line into an array of numbers.
    // Each number is separated by a space.
    var nums = data[index].split( ' ' ).map( Number );

    // Initialize a variable to calculate the sum of numbers in the current row.
    var sum = 0;

    // Loop through the numbers in the current row (columns).
    for ( var j = 0; j < c; j++ ) {
      sum += nums[j]; // Add the current number to the row sum.
      rc[j] += nums[j]; // Add the current number to its corresponding column sum in 'rc'.
    } // End of inner loop for columns

    // After summing up the row, add the row's total sum to the grand total element in 'rc'.
    rc[c] += sum;

    // Append the calculated row sum to the end of the current 'nums' array.
    nums.push( sum ); // Now 'nums' contains the original numbers plus their row sum.

    // Convert the processed 'nums' array (including the row sum) into a space-separated string.
    // Add this string as a new line to the 'output' array.
    output.push( nums.join( ' ' ) );
  } // End of outer loop for data rows

  // After all data rows are processed, append the 'rc' array (column sums + grand total)
  // as the final line of output, formatted as a space-separated string.
  output.push( rc.join( ' ' ) ); // This is the last line of the table.

  // Print the entire collected output to the console.
  // Each element of the 'output' array is joined by a newline character.
  console.log( output.join( '\n' ) ); // Display the complete result.

} ); // End of 'end' event handler function definition