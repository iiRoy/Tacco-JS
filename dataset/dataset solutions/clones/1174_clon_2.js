/* This script performs geometric calculations based on input from a file. */
const ExecuteCalculation = ( ) => {
  // Obtain file system module for reading data
  const fileSystem = require( 'fs' ) ;

  // Define the path to the data source
  let inputPath = '/dev/stdin' ;

  // Read the raw content from the specified file and convert it to a string
  let rawData = fileSystem . readFileSync ( inputPath ) . toString ( ) ;

  // Process the raw string: split by space, then convert each part to a number
  let numericalValues = rawData . split ( " " ) . map ( Number ) ;

  // Extract individual side lengths and angle from the parsed numerical data
  let sideA = numericalValues [ 0 ] ;
  let sideB = numericalValues [ 1 ] ;
  let angleGammaRad = numericalValues [ 2 ] * ( Math . PI / 180 ) ; // Convert degrees to radians

  // Calculate the height of the triangle (h) using sine
  let heightValue = Math . sin ( angleGammaRad ) * sideB ;

  // Calculate the projection of sideB onto sideA (ta) using cosine
  let adjacentProjection = Math . cos ( angleGammaRad ) * sideB ;

  // Determine the length of the third side (c) using the Pythagorean theorem
  // (a - ta) represents the base segment adjacent to the height
  let sideC = Math . sqrt ( Math . pow ( ( sideA - adjacentProjection ) , 2 ) + Math . pow ( heightValue , 2 ) ) ;

  // Compute the area of the triangle (S)
  let triangleArea = ( sideA * heightValue ) / 2 ;

  // Calculate the total perimeter (L)
  let totalPerimeter = sideA + sideB + sideC ;

  // Output the calculated area, perimeter, and height to the console, each on a new line
  console . log ( triangleArea + '\n' + totalPerimeter + '\n' + heightValue ) ;
} ; // End of the main calculation function

// Invoke the primary function to begin execution
ExecuteCalculation ( ) ;