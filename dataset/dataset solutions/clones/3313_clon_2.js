'use strict'; // Enforce strict mode for better code quality
console.log( ( function( inputString ) { // Define an immediately invoked function to process input

  // Parse the raw input string: trim whitespace, split into lines,
  // then split each line by space and convert values to integers.
  const dataMatrix = inputString.trim().split('\n').map( ( rowText ) => {
    return rowText.split(' ').map( ( itemVal ) => parseInt(itemVal, 10) );
  });

  // Extract initial configuration values from the first parsed line.
  // graphSize represents the maximum possible node ID (N in original context).
  const graphSize = dataMatrix[0][0];
  // pairCount represents the number of edges or relationships (M in original context).
  const pairCount = dataMatrix[0][1];

  // Initialize arrays to store the 'from' (source) and 'to' (target) points of each edge.
  const sourcePoints = [];
  const targetPoints = [];

  // Populate the sourcePoints and targetPoints arrays from the subsequent lines of data.
  // The loop starts from the second line (index 1) of dataMatrix.
  for ( let edgeIdx = 0; edgeIdx < pairCount; edgeIdx++ ) {
    sourcePoints.push( dataMatrix[1 + edgeIdx][0] ); // First element of the current edge line
    targetPoints.push( dataMatrix[1 + edgeIdx][1] ); // Second element of the current edge line
  }

  // Create a 2D dynamic programming table (memoization grid).
  // It has (pairCount + 1) rows and (graphSize + 1) columns,
  // with all cells initialized to zero.
  const memoTable = Array( pairCount + 1 ).fill( 0 )
                      .map( ( _placeholder ) => Array( graphSize + 1 ).fill( 0 ) );

  // Fill the DP table using the defined edge relationships.
  // The outer loop iterates through each 'step' or 'level' in the DP process.
  for ( let stepLevel = 1; stepLevel <= pairCount; stepLevel++ ) {
    // The inner loop iterates through each available edge.
    for ( let currentEdge = 0; currentEdge < pairCount; currentEdge++ ) {
      // DP transition: update the maximum path length ending at the current target point.
      // It compares the existing value with the path length from the source point
      // at the previous step level, incremented by one.
      memoTable[stepLevel][targetPoints[currentEdge]] = Math.max(
        memoTable[stepLevel][targetPoints[currentEdge]],
        memoTable[stepLevel - 1][sourcePoints[currentEdge]] + 1
      );
    }
  }

  // After populating the table, find the maximum value in the last row
  // (corresponding to the final 'pairCount' step level).
  // Convert this maximum value to a string before returning.
  return Math.max( ...memoTable[pairCount] ).toString();

// Immediately invoke the function with input read from standard input.
}( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ) );