/* Configuration for the data input process */
const   settings   =
{
    inputPath:    '/dev/stdin', // Standard input file path
    lineDelimiter: '\n'         // Character marking the end of a line
};


// Read all incoming data, process it, and convert to numerical arrays.
let   inputData   =
  require('fs')
    .readFileSync( settings.inputPath,
                   'ascii' )  // Read file content as ASCII
    .split( settings.lineDelimiter,
            3 )               // Split into lines, taking only the first 3
    .map( ( currentString ) => {
      // For each line, split by space and convert each part to a number
      return   currentString
               .split( ' ' )
               .map( Number );
    } );


/*
  Immediately invoked function expression to calculate
  the absolute differences between two vectors.
*/
const absoluteDifferences =
(
  function ( vectorA, vectorB )
  {
    // Array to store the computed differences
    let resultsArray = [];

    // Iterate through elements of the first vector
    for ( let indexVal in vectorA )
    {
      // Calculate absolute difference for corresponding elements
      resultsArray.push( Math.abs( vectorA[indexVal] - vectorB[indexVal] ) );
    }

    return resultsArray; // Return the array of differences
  }
)( inputData[1], inputData[2] ); // Pass the second and third lines as vectors


// Output the Manhattan distance (L1 norm)
console.log(
  absoluteDifferences.reduce(
    ( accumulator, currentValue ) => accumulator + currentValue,
    0
  )
);


// Output the Euclidean distance squared (L2 norm squared)
console.log(
  Math.sqrt(
    absoluteDifferences.reduce(
      ( accumulator, currentValue ) => accumulator + currentValue * currentValue,
      0
    )
  )
);


// Output the Minkowski distance (L3 norm, cubic root of sum of cubes)
console.log(
  Math.pow(
    absoluteDifferences.reduce(
      ( accumulator, currentValue ) => accumulator + currentValue * currentValue * currentValue,
      0
    ),
    1 / 3
  )
);


// Output the Chebyshev distance (L-infinity norm, maximum difference)
console.log(
  absoluteDifferences.reduce(
    ( accumulator, currentValue ) => Math.max( accumulator, currentValue ),
    0
  )
);