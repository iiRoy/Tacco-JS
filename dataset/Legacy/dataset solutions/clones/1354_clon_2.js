process.stdin.resume(); // Start reading input from the standard input stream.
process.stdin.setEncoding('utf8'); // Configure the input stream to use UTF-8 encoding.

// Attach an event listener for incoming data chunks.
process.stdin.on('data', function (inputSegment) {
  // Split the received data string by spaces to get individual components.
  let parsedValues = inputSegment.split(" ");

  // Convert the first component to an integer, representing the initial measurement.
  let firstDimension = parseInt(parsedValues[0]);

  // Convert the second component to an integer, representing the subsequent measurement.
  let secondDimension = parseInt(parsedValues[1]);

  // Compute the product of the two dimensions.
  let calculatedSurface = firstDimension * secondDimension;

  // Compute twice the sum of the two dimensions.
  let totalPerimeter = 2 * (firstDimension + secondDimension);

  // Output the calculated surface and perimeter, separated by a space.
  console.log(calculatedSurface + " " + totalPerimeter);
});
