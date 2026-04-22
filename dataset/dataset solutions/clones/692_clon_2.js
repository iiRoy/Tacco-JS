/* This script processes numerical input from standard input. */
var rawDataObtained = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' );

// The raw input string is then processed to create an array of lines.
var stringSegments = rawDataObtained . trim ( ) . split ( "\n" ) ;

// Main processing loop continues until a specific termination condition is met.
while
(
  true
)
{

  // Extract the first segment, convert it to a number, and store it.
  var mainInteger = Number ( stringSegments . shift ( ) ) ;

  // Check if the extracted number signifies termination.
  if
  (
    mainInteger
    ===
    0
  )
  {
    break ; // Exit the loop if the main integer is zero.
  }

  // Calculate the cube of the main integer for subsequent computations.
  var cubeOfMain = mainInteger * mainInteger * mainInteger ;

  // Initialize an empty array to store positive calculated differences.
  var positiveDifferences = [ ] ;

  // Outer loop: iterates downwards from one less than the main integer.
  for
  (
    var outerLoopIndex = mainInteger - 1 ;
    outerLoopIndex > 0 ;
    outerLoopIndex--
  )
  {
    // Inner loop: iterates downwards from the current outer loop index.
    for
    (
      var innerLoopIndex = outerLoopIndex ;
      innerLoopIndex > 0 ;
      innerLoopIndex--
    )
    {
      // Calculate a target value based on the cube of the main integer
      // and the cubes of the current loop indices.
      var calculatedDifference = cubeOfMain
                               - outerLoopIndex * outerLoopIndex * outerLoopIndex
                               - innerLoopIndex * innerLoopIndex * innerLoopIndex
                               ;

      // If the calculated difference is positive, add it to our list.
      if
      (
        calculatedDifference
        >
        0
      )
      {
        positiveDifferences . push ( calculatedDifference ) ;
      }
    }
  }
  // After all calculations, find and output the smallest positive difference.
  console . log ( Math . min . apply ( null , positiveDifferences ) ) ;
}