/*
 * This JavaScript code implements a basic insertion sort algorithm.
 * It's designed to read an array of numbers from standard input,
 * sort them incrementally, and print the array's state after each insertion.
 *
 * This particular implementation is for educational purposes or specific
 * problem-solving contexts, often seen in competitive programming.
 */

// Ensure the standard input stream remains open, preventing the process from exiting prematurely.
process.stdin.resume();

// Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding( 'utf8' );

// Attach an event listener to the standard input stream.
// This function will be executed every time new data (a 'chunk') is received.
process.stdin.on( 'data', function ( chunk ) {

  // Convert the received data chunk to a string and then split it into an array of lines
  // based on the newline character.
  var lines = chunk.toString().split( '\n' );

  // The first line of input is expected to contain the number of elements (N) in the array.
  // Although 'N' is read, the loop iterates based on array length, not 'N' directly.
  var N = lines[ 0 ];

  // The second line contains the space-separated elements of the array 'A'.
  // Split this line by spaces to get the individual elements.
  var A = lines[ 1 ].split( ' ' );


  // Output the initial, unsorted state of the array 'A' to the console.
  // Elements are joined back with spaces for display.
  console.log( A.join( " " ) );


  // Begin the insertion sort process.
  // The loop starts from the second element (index 1) because the first element
  // is considered to be a sorted sub-array of size one.
  for ( var i = 1; i < N; i++ ) {

    // Store the current element to be inserted into the correct position.
    var key = A[ i ];

    // Initialize 'j' to the index of the last element in the already sorted sub-array.
    var j = i - 1;

    // This inner loop shifts elements of the sorted sub-array (A[0...i-1])
    // that are greater than 'key' one position to their right.
    // The '- 0' trick is used to explicitly convert string numbers to numeric values for comparison.
    while ( j >= 0 && A[ j ] - 0 > key - 0 ) {
        // Move the element at A[j] to A[j+1].
        A[ j + 1 ] = A[ j ];
        // Decrement 'j' to check the next element to the left.
        j--;
    }

    // After the while loop, 'j + 1' is the correct position for 'key'.
    // Insert 'key' into its sorted place.
    A[ j + 1 ] = key;

    // After each insertion, print the current state of the array 'A'.
    // This shows the step-by-step sorting process.
    console.log( A.join( " " ) );

  } // End of the 'for' loop (insertion sort).

}); // End of the 'data' event handler function.

// End of the JavaScript program.