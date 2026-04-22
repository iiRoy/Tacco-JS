function processInputData(   rawDataString   )   {
  // First, parse the raw input into an array of individual lines.
  let linesOfData = rawDataString.split( '\n' );

  // Extract N (number of items) and D (maximum allowed distance) from the first line.
  const   [ numItems, maxDistance ]   = linesOfData[ 0 ].split( ' ' ).map( Number );

  // Process subsequent lines to create an array of coordinate objects.
  const coordinates = linesOfData.slice(1, numItems + 1).map( lineString => {
    // For each line, split by space and convert to numbers.
    let numericValues = lineString.split( ' ' ).map( Number );
    // Return an object with 'horiz' and 'vert' properties.
    return { horiz: numericValues[ 0 ], vert: numericValues[ 1 ] };
  });

  // Calculate the square of the maximum allowed distance for efficiency.
  let maxDistSquared = maxDistance * maxDistance;

  // Initialize a counter for points within the specified range.
  let withinRangeCount = 0;

  // Iterate over each coordinate point.
  coordinates.forEach( currentCoord => {
    // Calculate the squared Euclidean distance from the origin (0,0).
    // If the squared distance is less than or equal to maxDistSquared, increment the counter.
    if ( ( currentCoord.horiz * currentCoord.horiz + currentCoord.vert * currentCoord.vert ) <= maxDistSquared ) {
      withinRangeCount++;
    }
  } );

  // Output the final count to the console.
  console.log( withinRangeCount );
}


// Read input from standard input, trim whitespace, and pass to the processing function.
processInputData(
  require(   'fs'   ).readFileSync(   '/dev/stdin',   'utf8'   ).trim()
);