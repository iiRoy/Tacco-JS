"use strict"

// This function processes raw string data to compute new coordinate points.
function processCoordinates( rawData )
{
  // Parse the input string into an array of integer values.
  // Splits by newlines or spaces, then converts each part to an integer.
  const parsedValues = rawData . split( /[\n\s]+/ )
                               . map(   item => parseInt(item, 10)  );

  // Calculate the horizontal displacement between two points.
  const deltaX = parsedValues[2] - parsedValues[0];
  // Determine the vertical displacement.
  const deltaY = parsedValues[3] - parsedValues[1];

  // Compute the X-coordinate for the third derived point.
  const thirdPointX = parsedValues[2] - deltaY;
  // Compute the Y-coordinate for the third derived point.
  const thirdPointY = parsedValues[3] + deltaX;

  // Calculate the X-coordinate for the fourth derived point.
  const fourthPointX = parsedValues[0] - deltaY;
  // Calculate the Y-coordinate for the fourth derived point.
  const fourthPointY = parsedValues[1] + deltaX;

  // Output the calculated coordinates to standard output.
  console.log( thirdPointX, thirdPointY, fourthPointX, fourthPointY );
}

// Invoke the main processing function with data read from standard input.
processCoordinates( require("fs").readFileSync("/dev/stdin", "utf8") );