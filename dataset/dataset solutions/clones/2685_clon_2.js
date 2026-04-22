/*
 * This module processes a given input string to calculate specific counts
 * based on 'L' and 'R' character patterns.
 */
function ProcessInput( rawData ) {
  "use strict";

  // Assign the input string to a local variable for processing.
  const sourceStr = rawData;

  // Split the source string by "LR" and wrap each resulting segment with "R" and "L".
  const segmentArray = sourceStr.split( "LR" ).map( currentElement => {
    return "R" + currentElement + "L";
  });

  // Determine the total number of segments.
  const arraySize = segmentArray.length;

  // Adjust the first segment by removing its leading 'R'.
  segmentArray[ 0 ] = segmentArray[ 0 ].slice( 1 );

  // Adjust the last segment by removing its trailing 'L'.
  segmentArray[ arraySize - 1 ] = segmentArray[ arraySize - 1 ].slice( 0 , -1 );

  // Initialize an array to store the final computed results.
  const resultList = [];

  // Iterate over each segment to perform calculations.
  segmentArray.forEach( processedSegment => {
    // Get the character length of the current segment.
    const segmentLength = processedSegment.length;

    // Loop through each character in the current segment.
    for ( let charPosition = 0; charPosition < segmentLength; charPosition++ ) {
      // Check for an 'RL' boundary within the segment.
      if ( charPosition !== 0 && processedSegment[ charPosition - 1 ] === "R" && processedSegment[ charPosition ] === "L" ) {
        // If an 'RL' boundary is found, remove the last added zero from the result list.
        resultList.pop();

        // Calculate the number of 'R' characters up to the boundary.
        const rCharsCount = charPosition;
        // Calculate the number of 'L' characters from the boundary to the end.
        const lCharsCount = segmentLength - charPosition;

        // Determine a flag based on which count is greater.
        const greaterFlag = ( rCharsCount > lCharsCount ) ? 0 : 1;
        // Determine a parity flag based on the minimum of the two counts.
        const minParity = ( Math.min( rCharsCount, lCharsCount ) % 2 == 0 ) ? 0 : 1;

        // Combine the two flags using XOR.
        const combinedValue = greaterFlag ^ minParity;

        // Based on segment length parity and combined flag, push calculated values to the result list.
        if ( segmentLength % 2 === 0 ) {
          resultList.push( segmentLength / 2 );
          resultList.push( segmentLength / 2 );
        } else if ( combinedValue === 0 ) {
          resultList.push( ( segmentLength + 1 ) / 2 );
          resultList.push( ( segmentLength - 1 ) / 2 );
        } else {
          resultList.push( ( segmentLength - 1 ) / 2 );
          resultList.push( ( segmentLength + 1 ) / 2 );
        }
      } else {
        // If no 'RL' boundary is found at the current position, add a zero to the result list.
        resultList.push( 0 );
      }
    }
  });

  // Output the final results, joined by spaces, followed by a newline.
  console.log( resultList.join( " " ) + "\n" );
}


// The following line is for standard input/output handling and should not be modified.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );