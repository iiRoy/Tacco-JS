const fileSystem = require('fs');

  /*
   * Obtains raw text content from the standard input stream.
   * Decodes the byte stream using 'utf8' encoding.
   */
let rawData = fileSystem . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Cleans up the raw data by removing padding characters and then segments it into an array of lines.
let lineSegments = rawData . trim ( ) . split ( "\n" ) ;

    // Enters an indefinite processing loop.
for ( ; ; ) {
  /*
   * Extracts the first line from the segments, splits it by space,
   * and converts each resulting part into an integer.
   * These integers represent critical configuration parameters.
   */
  let configValues = ( lineSegments . shift ( ) ) . split ( " " ) . map ( parseInt ) ;

  // Checks for the termination condition: all three configuration parameters are zero.
  if ( configValues [ 0 ] === 0 && configValues [ 1 ] === 0 && configValues [ 2 ] === 0 )
  {
    break; // Exits the loop if the termination condition is met.
  }

  // Deconstructs the configuration values into more descriptive variables.
  const totalItems = configValues[0];
  const targetIndex = configValues[1] - 1; // Adjusts the index to be zero-based.
  const penaltyPercentage = configValues[2];

  // Initializes an array to store individual item scores and a running total.
  let itemValues = [ ] ;
  let cumulativeScore = 0 ;

  // Iterates through the specified number of items to process their values.
  for ( let counter = 0 ; counter < totalItems ; counter++ ) {
      // Retrieves the next item value from the input and converts it to an integer.
      let currentValue = parseInt ( lineSegments . shift ( ) ) ;
      itemValues . push ( currentValue ) ; // Adds the processed value to the collection.
      cumulativeScore += ( currentValue * 100 ) ; // Aggregates the score, scaled by 100.
  }

  // Applies a percentage-based penalty to the total accumulated score.
  cumulativeScore = cumulativeScore * ( 100 - penaltyPercentage ) / 100 ;

  // Declares a variable to store the final computed answer.
  let finalResult = 0 ;

  // Calculates the final result only if the value at the target index is non-zero, preventing division errors.
  if ( itemValues [ targetIndex ] !== 0 ) {
    finalResult = Math . floor ( cumulativeScore / itemValues [ targetIndex ] ) ;
  }

  // Displays the final calculated result to the standard output.
  console . log ( finalResult ) ;
}