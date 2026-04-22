// This script initializes the standard input stream for processing numerical data.
process.stdin.resume();

// The input character encoding is defined as UTF-8.
process.stdin.setEncoding('utf8');

// An event listener is registered to handle incoming data chunks.
process.stdin.on( 'data',  function ( inputDataSegment )
{
  // The received data segment is split into individual parts based on spaces.
  let parsedComponents  =  inputDataSegment.split(" ");

  // The first component is converted to a floating-point number, representing the first side.
  let firstSideLength   =  parseFloat(parsedComponents[0]);

  // The second component is converted to a floating-point number, representing the second side.
  let secondSideLength  =  parseFloat(parsedComponents[1]);

  // The third component is converted to a floating-point number, representing the included angle in degrees.
  let includedAngleDegrees = parseFloat(parsedComponents[2]);


  // Convert the angle from degrees to radians for trigonometric calculations.
  let includedAngleRadians = includedAngleDegrees / 180 * Math.PI;

  // Calculate the area of the triangle using the formula: 0.5 * a * b * sin(C).
  let calculatedArea = 0.5 * firstSideLength * secondSideLength * Math.sin(includedAngleRadians);

  // Calculate the perimeter of the triangle using the law of cosines to find the third side.
  let calculatedPerimeter = firstSideLength + secondSideLength + Math.sqrt(
      firstSideLength * firstSideLength +
      secondSideLength * secondSideLength -
      2 * firstSideLength * secondSideLength * Math.cos(includedAngleRadians)
  );

  // Calculate the height of the triangle relative to the first side (base 'a').
  let calculatedHeight = calculatedArea / firstSideLength * 2;


  // Output the computed area to the console.
  console.log(calculatedArea);

  // Output the computed perimeter to the console.
  console.log(calculatedPerimeter);

  // Output the computed height to the console.
  console.log(calculatedHeight);
});