// This program calculates the perimeter (circumference) of a circle.

// Obtain the radius value from standard input.
// The input is expected to be a whole number.
const circleDimension = parseInt(
  require( 'fs' ) // Utilize the Node.js file system module for I/O operations.
    .readFileSync(
      '/dev/stdin',    // Specify the standard input file path.
      'utf8'           // Decode the input content using UTF-8 encoding.
    )
);

// Display the computed circumference.
// The formula for circumference is 2 * Pi * radius.
console.log(
  circleDimension * Math.PI * 2
);

// Program execution complete.