/*
 * This JavaScript module is designed to process a specific set of coordinate inputs.
 * It reads a single line of space-separated numerical values, interprets them as
 * two initial points, and then calculates two new points based on a geometric transformation.
 */
function  CoordinateProcessor ( rawInputData ) { // Defines the primary function for handling coordinate transformations.

  // Divides the raw incoming string data into an array of lines, typically just one line for this problem.
  var    inputLines = rawInputData.split( "\n" ) ;

  // Parses the first X-coordinate from the first line of the input.
  var  pointOneX = parseInt( inputLines[0].split( " " )[0] ) ;

  // Extracts and converts the first Y-coordinate.
  var pointOneY = parseInt( inputLines[0].split( " " )[1] ) ;

  // Processes the second X-coordinate from the same input line.
  var pointTwoX = parseInt( inputLines[0].split( " " )[2] ) ;

  // Retrieves the second Y-coordinate.
  var pointTwoY = parseInt( inputLines[0].split( " " )[3] ) ;

  // Initializes a variable to hold the final string result before it's fully constructed.
  var calculatedResult = 0 ;

  // Computes the X-coordinate for the third derived point using a rotation-like formula.
  var pointThreeX = pointTwoX - ( pointTwoY - pointOneY ) ;

  // Determines the Y-coordinate for the third point based on the same transformation.
  var pointThreeY = pointTwoY + ( pointTwoX - pointOneX ) ;

  // Calculates the X-coordinate for the fourth derived point.
  var pointFourX = pointOneX - ( pointTwoY - pointOneY ) ;

  // Ascertains the Y-coordinate for the fourth point.
  var pointFourY = pointOneY + ( pointTwoX - pointOneX ) ;

  // Concatenates all four derived coordinates into a single string, separated by spaces, for output.
  var outputString = pointThreeX + " " + pointThreeY + " " + pointFourX + " " + pointFourY ;

  // Outputs the final coordinate string to the standard console.
  console.log( '%s', outputString ) ;
}

// Initiates the coordinate processing by reading data from standard input asynchronously.
CoordinateProcessor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;