process
  .stdin
  .on(
    'data',
    // Anonymous callback function invoked whenever new data arrives on the input stream.
    function (
      receivedChunk // Parameter representing the data buffer received from stdin.
    ) {
      // Output the processed data to the standard console.
      console
        .log(
          receivedChunk // The input data buffer.
            .split(' ') // Splits the buffer (implicitly converted to string) by spaces into an array of strings.
            .sort(
              // Defines a custom comparison function for the array's sort method.
              function (
                valOne, // First value for comparison.
                valTwo // Second value for comparison.
              ) {
                // Compares two values numerically to achieve ascending order.
                // Subtraction works because JavaScript will attempt to convert string numbers to actual numbers.
                return valOne - valTwo;
              }
            )
            .join(' ') // Joins the sorted array elements back into a single string, separated by spaces.
        ); // Concludes the console.log statement.
    } // Ends the definition of the data event handler function.
  ); // Ends the call to the 'on' method for the stdin stream.

// The program remains active, continuously waiting for more data input.