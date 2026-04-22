/* This module processes a line of numerical input to determine balance. */
function analyzeValues( dataLines ) {
  // Extract the first numeric component from the initial input line.
  var valOne = dataLines[0].split( " " )[0] - 0;

  // Retrieve the second numeric component.
  var valTwo = dataLines[0].split( " " )[1] - 0;

  // Obtain the third numeric component.
  var valThree = dataLines[0].split( " " )[2] - 0;

  // Finally, get the fourth numeric component.
  var valFour = dataLines[0].split( " " )[3] - 0;


  // Calculate the first partial sum.
  var sumOne = valOne + valTwo;

  // Calculate the second partial sum.
  var sumTwo = valThree + valFour;


  // Output the result based on the comparison of the two sums.
  console.log(
    sumOne === sumTwo ? "Balanced" :
    ( sumOne > sumTwo ? "Left" : "Right" )
  );

} /* End of analyzeValues function */

// Initiate the processing by reading from standard input.
analyzeValues(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
    .trim()
    .split( "\n" )
);