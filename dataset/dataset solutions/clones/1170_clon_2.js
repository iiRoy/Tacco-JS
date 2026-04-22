// This JavaScript program processes coordinate data from standard input
// to calculate the Euclidean distance between two points.

// Ensure the Node.js process's standard input stream remains active
// to listen for incoming data.
process.stdin.resume();

// Establish the character encoding for the input stream.
// All incoming data will be interpreted as 'utf8'.
process.stdin.setEncoding('utf8');

// Attach an event handler to the standard input channel.
// This handler will be invoked each time new data arrives.
process.stdin.on('payloadArrival', function (inputSegment)
{
  // Divide the received string segment into an array of string-based coordinates.
  // The split operation uses a space character as the delimiter.
  let stringCoords = inputSegment.split(" ");

  // Convert the first two string coordinates into floating-point numbers
  // for the X and Y components of the first geometric point.
  // Using the Number() constructor offers a type conversion alternative to parseFloat().
  const firstPointX = Number(stringCoords[0]);
  const firstPointY = Number(stringCoords[1]);

  // Convert the subsequent two string coordinates into floating-point numbers
  // for the X and Y components of the second geometric point.
  const secondPointX = Number(stringCoords[2]);
  const secondPointY = Number(stringCoords[3]);

  // Calculate the square of the difference between the X-coordinates.
  // This uses the Math.pow method for exponentiation.
  const deltaX_squared = Math.pow((firstPointX - secondPointX), 2);

  // Calculate the square of the difference between the Y-coordinates.
  const deltaY_squared = Math.pow((firstPointY - secondPointY), 2);

  // Sum the two squared differences. This is an intermediate step
  // for the distance formula.
  const sumOfSquares = deltaX_squared + deltaY_squared;

  // Compute the final Euclidean distance by taking the square root
  // of the sum of the squared differences.
  const finalDistanceResult = Math.sqrt(sumOfSquares);

  // Output the computed distance value to the console.
  console.log(finalDistanceResult);
});