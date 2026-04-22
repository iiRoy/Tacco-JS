'use strict'; // Enforce stricter parsing and error handling in the script.

/**
 * The primary processing unit for calculating a modified sum of Euclidean distances.
 * It reads point coordinates, computes distances between all unique pairs,
 * and then outputs a scaled total.
 * @param {string[]} incomingDataLines - An array of strings, where the first element
 *                                       indicates the number of points, and subsequent
 *                                       elements are space-separated X and Y coordinates.
 */
const dataProcessor = ( incomingDataLines ) => {
  // Retrieve the total count of data points from the initial line of the input stream.
  const totalPointCount = Number.parseInt( incomingDataLines[0], 10 );

  // Allocate storage for the horizontal and vertical components of each point.
  let xCoordinates = new Array( totalPointCount );
  let yCoordinates = new Array( totalPointCount );

  // Populate the coordinate arrays by parsing each line of input.
  for ( let currentIdx = 0; currentIdx < totalPointCount; currentIdx++ ) {
    // Split the current input line into its two string components and convert them to integers.
    let parsedCoordPair = incomingDataLines[ currentIdx + 1 ]
      .split( ' ' )
      .map( ( coordString ) => Number.parseInt( coordString, 10 ) );

    // Store the parsed X and Y values into their respective coordinate lists.
    xCoordinates[ currentIdx ] = parsedCoordPair[0];
    yCoordinates[ currentIdx ] = parsedCoordPair[1];
  }

  // Initialize a floating-point variable to accumulate the sum of all pairwise distances.
  let cumulativeDistance = 0.0;

  // Iterate through all distinct pairs of points to compute their Euclidean distances.
  // The outer traversal ensures each point is considered as a starting reference.
  for ( let refPointIdx = 0; refPointIdx < totalPointCount - 1; refPointIdx++ ) {
    // The inner traversal considers all subsequent points to form unique pairs with the reference point.
    for ( let targetPointIdx = refPointIdx; targetPointIdx < totalPointCount; targetPointIdx++ ) {
      // Calculate the difference along the X-axis.
      const deltaHorizontal = xCoordinates[ refPointIdx ] - xCoordinates[ targetPointIdx ];
      // Calculate the difference along the Y-axis.
      const deltaVertical = yCoordinates[ refPointIdx ] - yCoordinates[ targetPointIdx ];

      // Apply the Euclidean distance formula (Pythagorean theorem) and add to the running total.
      cumulativeDistance += Math.sqrt( ( deltaHorizontal * deltaHorizontal ) + ( deltaVertical * deltaVertical ) );
    }
  }

  // Output the final derived metric: the total accumulated distance, normalized by
  // the number of points, and then scaled by a factor of two.
  console.log( cumulativeDistance / totalPointCount * 2 );
};

// Execution entry point: Read input from standard input, parse it, and invoke the data processor.
dataProcessor(
  require( 'node:fs' ) // Utilize the Node.js file system module.
    .readFileSync( '/dev/stdin', 'utf-8' ) // Synchronously read the entire content of stdin using UTF-8 encoding.
    .split( '\n' ) // Divide the raw input string into an array of individual lines.
);