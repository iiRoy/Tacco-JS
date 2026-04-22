// This module is designed to process geometric input and calculate properties of a triangle.
// It reads input from standard input, parses it, and then computes the area, perimeter,
// and one of the altitudes of a triangle given two sides and the included angle.
function computeGeometricValues(  inputRows  ) {
  // Extract numerical string tokens from the first line of input
  var   valueTokens = inputRows[  0  ].split(  /\s+/  )  ;

  // Parse the string tokens into floating-point numbers for calculations
  var firstSide = parseFloat(  valueTokens[0]  );
  var secondSide = parseFloat(  valueTokens[  1  ]  )  ;
  var inputAngleDegrees = parseFloat(  valueTokens[  2  ]  )  ;

  // Convert the angle from degrees to radians, as trigonometric functions expect radians
  const angleInRadians = inputAngleDegrees * Math.PI / 180.0;

  // Apply the Law of Cosines to determine the length of the third side of the triangle
  // c^2 = a^2 + b^2 - 2ab*cos(C)
  var thirdSideLength = Math.sqrt(
    Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - 2 * firstSide * secondSide * Math.cos(angleInRadians)
  );

  // Calculate the area of the triangle using the formula: Area = 0.5 * a * b * sin(C)
  var calculatedArea = firstSide * secondSide * Math.sin(angleInRadians) / 2.0;

  // Compute the total length of the triangle's boundary
  var totalCircumference = firstSide + secondSide + thirdSideLength;

  // Determine the height (altitude) relative to side 'a' using the formula: h = 2 * Area / base
  var altitudeValue = (2 * calculatedArea) / firstSide;

  // Output the calculated values formatted to 6 decimal places, separated by spaces.
  console.log(
    [
      calculatedArea.toFixed(6),
      totalCircumference.toFixed(6),
      altitudeValue.toFixed(6),
    ].join(' ')
  );
}


// --- Input Processing Section ---
// This part handles reading data from standard input (stdin) in a Node.js environment.

// An array to store incoming data buffer chunks from stdin.
var receivedSegments = [];

// Event listener for 'data' event: fired when new data is available on stdin.
process.stdin.on('data', function (bufferSlice) {
  receivedSegments.push(bufferSlice); // Append each received data chunk to our array.
});

// Event listener for 'end' event: fired when the entire input stream has been received.
process.stdin.on('end', function (  ) {
  // Join all the received buffer segments into a single string, then split by newline characters.
  // This produces an array where each element is a line from the input.
  var finalInputArray = receivedSegments.join('').split('\n');

  // Invoke the main calculation function with the processed input lines.
  computeGeometricValues(finalInputArray);
});