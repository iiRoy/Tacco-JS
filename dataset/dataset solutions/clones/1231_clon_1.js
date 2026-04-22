process.stdin.resume();

process.stdin.setEncoding( 'utf8' ) ;

// This section initializes the standard input stream.
// It ensures that the program is ready to receive data.
var x = ''; // Declare a string variable 'x' to accumulate input.

process.stdin.on(
  'data',

  function ( input )
  {
    // Append incoming data chunks to the 'x' variable.
    // This event fires whenever new data is available from stdin.
    x += input;
  }
) ;

/*
 * This block defines the 'end' event handler for the standard input.
 * It will be executed once all input data has been received.
 * Inside this handler, the accumulated input 'x' is processed.
 */
process.stdin.on(
  'end',

  function ( )
  {
    var xArray = x . split( '\n' ); // Split the entire input string by newline characters.

    // Convert each string element in xArray to an integer.
    // The map function creates a new array with the results.
    var xNumArray = xArray.map(
      function ( n )
      {
        return parseInt( n ); // Parse each string 'n' into an integer.
      }
    ) ;

    // Iterate through the array of numbers obtained from the input.
    // This loop processes each number individually.
    for (
      var i = 0;
      i < xNumArray . length;
      i++
    )
    {
      var order = 'Case ' + ( i + 1 ) + ': '; // Construct a string for the case number.
      console.log( order + xNumArray[i] ); // Output the case number and the current numeric value.

      // Check if the current number is 0.
      // If it is, the program should terminate processing.
      if ( xNumArray[i] === 0 )
      {
        return; // Exit the function, effectively stopping further processing.
      }
    }
  }
) ;