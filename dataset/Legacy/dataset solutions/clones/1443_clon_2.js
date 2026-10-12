function calculateTriangleProps(inputLines) {
  // Parse the input numbers from the first line
  let numberStrings = inputLines[0].split(/\s+/);

  // Extract and convert the three numerical inputs
  let sideA = parseFloat(numberStrings[0]);
  let sideB = parseFloat(numberStrings[1]);
  let angleDegrees = parseFloat(numberStrings[2]);

  // Convert the angle from degrees to radians for trigonometric functions
  let angleRadians = angleDegrees * Math.PI / 180.0;

  // Calculate the third side (sideC) using the Law of Cosines
  let sideC = Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2) - 2 * sideA * sideB * Math.cos(angleRadians));

  // Calculate the area of the triangle
  let triangleArea = sideA * sideB * Math.sin(angleRadians) / 2;

  // Calculate the perimeter of the triangle
  let trianglePerimeter = sideA + sideB + sideC;

  // Calculate the height 'h' relative to side 'a'
  let heightH = (2 * triangleArea) / sideA;

  // Output the calculated values, formatted to 6 decimal places and joined by a space
  console.log(
    [
      triangleArea.toFixed(6),
      trianglePerimeter.toFixed(6),
      heightH.toFixed(6),
    ].join(' ')
  );
}

// Initialize an array to store incoming data chunks from standard input
let dataChunks = [];

// Event listener for 'data' chunks received from standard input
process.stdin.on('data', function (dataPiece) {
  dataChunks.push(dataPiece);
});

// Event listener for the 'end' of standard input stream
process.stdin.on('end', function () {
  // Join all received data chunks and split them into individual lines
  let inputLinesCombined = dataChunks.join('').split('\n');

  // Call the main calculation function with the processed input lines
  calculateTriangleProps(inputLinesCombined);
});
