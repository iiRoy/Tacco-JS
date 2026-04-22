"use strict" ;

const executeProcessing = ( sourceData ) => {
  // This function handles the primary logic for analyzing device measurements.

  let parsedLines = sourceData.split( "\n" ) ; // Divide the raw input into separate string components.

  // The final numeric constraint is extracted from the last element of the parsed input.
  const rangeConstraint = parseInt( parsedLines.pop() ) ;

  // Convert the remaining string elements into an array of integer coordinates.
  const deviceCoordinates = parsedLines.map( coordinateText => parseInt( coordinateText ) ) ;

  // Determine the outcome based on a specific difference check between device positions.
  // We compare the difference between the fifth and first coordinates against our constraint.
  console.log( deviceCoordinates[ 4 ] - deviceCoordinates[ 0 ] > rangeConstraint ? ":(" : "Yay!" ) ;

  /*
   * This multi-line comment section contains a more exhaustive,
   * pairwise comparison logic. It's currently commented out
   * because the problem's scope is limited to a specific range check.
   * This might be useful for future enhancements or different problem variations.
   *
   * for ( let firstIndex = 0 ; firstIndex < deviceCoordinates.length ; firstIndex++ ) {
   *   for ( let secondIndex = firstIndex + 1 ; secondIndex < deviceCoordinates.length ; secondIndex++ ) {
   *     if ( deviceCoordinates[ secondIndex ] - deviceCoordinates[ firstIndex ] > rangeConstraint ) {
   *       console.log( ":(" ) ;
   *       return ;
   *     }
   *   }
   * }
   * console.log( "Yay!" ) ;
   */

} ; // End of the main processing function definition.

// Begin execution by fetching data from the standard input stream.
executeProcessing( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;