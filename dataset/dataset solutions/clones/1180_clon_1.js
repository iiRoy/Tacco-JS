/* This JavaScript code processes numerical data from standard input to calculate standard deviation. */

// Declare a variable to accumulate all input data.
var input = '';

// Obtain a readable stream from standard input.
var readable = process.stdin;

// Ensure the stream is active and ready to receive data.
readable.resume();

// Set the encoding for the incoming data to UTF-8.
readable.setEncoding( 'utf-8' );

// Attach an event listener for 'data' events.
// This function is called whenever new data chunks are available.
readable.on( 'data', function( chunk )
{
  // Append the current data chunk to the 'input' string.
  input += chunk;
} ); // End of 'data' event handler.


// Attach an event listener for the 'end' event.
// This function is executed once all input data has been received.
readable.on( 'end', function()
{
  // Initialize an array to store the calculated standard deviations.
  var output = [];

  // Split the entire input string by newline characters to get individual data lines.
  var data = input.split( '\n' );

  // Loop through the data array, processing two lines at a time.
  // The first line (data[i]) is 'n', and the second (data[i+1]) is a space-separated list of numbers.
  for ( var i = 0; i < data.length; i += 2 )
  {
    // Parse the first line as an integer 'n'.
    var n = parseInt( data[ i ] );

    // If 'n' is 0, it signifies the end of input, so break the loop.
    if ( 0 == n )
    {
      break;
    }

    // Process the second line: split by spaces and convert each part to a number.
    var s = data[ i + 1 ].split( " " ).map( Number );

    // Initialize a variable to calculate the sum of numbers.
    var sum = 0;

    // Calculate the sum of all numbers in the 's' array.
    for ( var j = 0; j < n; j++ )
    {
      sum += s[ j ];
    }

    // Calculate the average (mean) of the numbers.
    var ave = sum / n;

    // Reset 'sum' to 0 for the next calculation (sum of squared differences).
    sum = 0;

    // Calculate the sum of squared differences from the mean.
    for ( var j = 0; j < n; j++ )
    {
      sum += Math.pow( s[ j ] - ave, 2 );
    }

    // Calculate the standard deviation (square root of (sum of squared differences / n)).
    // Push the result into the 'output' array.
    output.push( Math.sqrt( sum / n ) );
  }

  // After processing all data sets, join the results in the 'output' array with newlines
  // and print them to the console.
  console.log( output.join( '\n' ) );
} ); // End of 'end' event handler.