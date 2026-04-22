const fileSystemUtilities = require ( "fs" ) ;


const rawInputData = fileSystemUtilities
  . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read content from standard input synchronously.


rawInputData
  . trim ( ) // Remove leading/trailing whitespace from the entire input.
  . split ( '\n' ) // Split the input into an array of lines.
  . some (
    // Iterate over each line of input. The `some` method is used here to iterate,
    // and returning `false` ensures all lines are processed.
    function ( currentInputLine ) {
      const coordinateSegments = currentInputLine . split ( ' ' ) ; // Divide the line into space-separated strings.

      // Proceed only if there are enough segments to define at least two coordinates (i.e., a valid line).
      if ( coordinateSegments [ 1 ] ) {
        // Parse numerical values for the coordinates of three distinct points.
        const coordX1 = parseFloat ( coordinateSegments [ 0 ] ) ;
        const coordY1 = parseFloat ( coordinateSegments [ 1 ] ) ;
        const coordX2 = parseFloat ( coordinateSegments [ 2 ] ) ;
        const coordY2 = parseFloat ( coordinateSegments [ 3 ] ) ;
        const coordX3 = parseFloat ( coordinateSegments [ 4 ] ) ;
        const coordY3 = parseFloat ( coordinateSegments [ 5 ] ) ;

        // Pre-calculate squared values of coordinates to simplify later formulas.
        const sqCoordX1 = coordX1 * coordX1 ;
        const sqCoordY1 = coordY1 * coordY1 ;
        const sqCoordX2 = coordX2 * coordX2 ;
        const sqCoordY2 = coordY2 * coordY2 ;
        const sqCoordX3 = coordX3 * coordX3 ;
        const sqCoordY3 = coordY3 * coordY3 ;

        // Calculate the X-coordinate of the circumcenter using a determinant-based formula.
        const centerPointX = (
          ( ( coordY1 - coordY3 ) * ( sqCoordY1 - sqCoordY2 + sqCoordX1 - sqCoordX2 ) ) -
          ( ( coordY1 - coordY2 ) * ( sqCoordY1 - sqCoordY3 + sqCoordX1 - sqCoordX3 ) )
        ) / (
          ( 2 * ( coordY1 - coordY3 ) * ( coordX1 - coordX2 ) ) -
          ( 2 * ( coordY1 - coordY2 ) * ( coordX1 - coordX3 ) )
        ) ;

        // Calculate the Y-coordinate of the circumcenter using a similar formula.
        const centerPointY = (
          ( ( coordX1 - coordX3 ) * ( sqCoordX1 - sqCoordX2 + sqCoordY1 - sqCoordY2 ) ) -
          ( ( coordX1 - coordX2 ) * ( sqCoordX1 - sqCoordX3 + sqCoordY1 - sqCoordY3 ) )
        ) / (
          ( 2 * ( coordX1 - coordX3 ) * ( coordY1 - coordY2 ) ) -
          ( 2 * ( coordX1 - coordX2 ) * ( coordY1 - coordY3 ) )
        ) ;

        // Determine the circumradius by calculating the distance from the first point to the circumcenter.
        const dxFromCenter = ( coordX1 - centerPointX ) ;
        const dyFromCenter = ( coordY1 - centerPointY ) ;
        const circumRadiusValue = Math . sqrt ( ( dxFromCenter * dxFromCenter ) + ( dyFromCenter * dyFromCenter ) ) ;

        // Print the calculated circumcenter coordinates and the circumradius, formatted to three decimal places.
        console . log (
          centerPointX . toFixed ( 3 ) ,
          centerPointY . toFixed ( 3 ) ,
          circumRadiusValue . toFixed ( 3 )
        ) ;
      } // End of conditional block for valid input segments.
      return false ; // Continue processing subsequent lines.
    } // End of callback function for .some().
  ) ; // End of .some() method call.