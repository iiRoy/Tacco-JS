const obtainModule = require;

const ioOperations = obtainModule('fs');
const readInputFileContents = ioOperations.readFileSync;

const terminalOutput = {
  displayInfo: console.log
};

(
  function ( processingSource ) {
    // This function processes each line of the input text data.

    const lineSegments = processingSource.replace( /\n\s*$/ , '' ) . split( '\n' );
    const totalLines = lineSegments.length; // Determine the total number of lines to process.

    for ( let currentLineIdx = 0 ; currentLineIdx < totalLines ; currentLineIdx++ ) {
      const numericalParts = lineSegments.shift() . split( ',' ) . map( Number ); // Parse line into numbers.
      let secondFactor = numericalParts.pop(); // Extract the second comparison factor.
      let firstFactor = numericalParts.pop(); // Extract the first comparison factor.

      // Compute the result using a dedicated helper function and display it.
      terminalOutput.displayInfo( computeSegmentPosition( numericalParts , firstFactor , secondFactor ) );
    }
  }
) ( readInputFileContents( '/dev/stdin' , 'utf-8' ) ); // Execute the processing routine with file system input.


/*
 * Helper function to calculate a specific segment position based on an array of numbers and two factors.
 * The logic involves cumulative sums and a proportional threshold.
 *
 * @param {Array<number>} dataArray - An array of numerical values for cumulative sum calculation.
 * @param {number} ratioPartA - The numerator for the target ratio.
 * @param {number} ratioPartB - The denominator component for the target ratio.
 * @returns {number} The calculated segment index (1-based).
 */
function computeSegmentPosition ( dataArray , ratioPartA , ratioPartB ) {
  const cumulativeData = [ ]; // Initialize an array to store cumulative sums.

  // Populate the cumulative sum array based on the input data.
  for ( let dataIdx = 0 ; dataIdx < dataArray.length ; dataIdx++ ) {
    cumulativeData[ dataIdx ] = dataArray[ dataIdx ];
    if ( dataIdx > 0 ) {
      cumulativeData[ dataIdx ] += cumulativeData[ dataIdx - 1 ]; // Add previous cumulative sum.
    }
  }

  // Calculate the target threshold value using the total sum and provided factors.
  const targetThreshold = ( cumulativeData[ cumulativeData.length - 1 ] * ratioPartA ) / ( ratioPartA + ratioPartB );

  // Debugging line, typically commented out in production:
  // terminalOutput.displayInfo( cumulativeData , targetThreshold );

  let finalIndex = 1; // Initialize the result index.

  // Iterate through the cumulative data to find the appropriate segment.
  for ( let dataIdx = 0 ; dataIdx < cumulativeData.length ; dataIdx++ ) {
    if ( targetThreshold > cumulativeData[ dataIdx ] ) {
      finalIndex = dataIdx + 2; // Update index and continue if threshold is still greater.
      continue;
    }
    return finalIndex; // Return the determined index if the threshold is met or exceeded.
  }
}