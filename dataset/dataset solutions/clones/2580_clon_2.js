const executeProgram = ( rawData ) => {

  // Process the raw input string into a structured numeric array.
  const processedData = rawData
    .split( '\n' ) // First, split the entire input by newline characters
    .map( lineStr => lineStr.split( ' ' ) ) // Then, for each line, split by space characters
    .map( valStr => valStr.map( Number ) ); // Finally, convert all resulting string tokens into numbers

  // The first line of the processed data is stored separately.
  const firstLineValue = processedData[ 0 ];

  // The second line is the primary array for subsequent operations.
  let numericArray = processedData[ 1 ];

  // Modify the numeric array by prepending its first element and appending its last element.
  numericArray = [ numericArray[ 0 ] ]
    .concat( numericArray )
    .concat( numericArray.slice( -1 ) );

  // Initialize a variable to accumulate the sum of minimums.
  let totalSum = 0;

  // Use the reduce method to iterate through the modified numeric array.
  // For each pair of adjacent elements, add the smaller one to the total sum.
  numericArray.reduce( ( currentElement, followingElement ) => {

    totalSum += Math.min( currentElement, followingElement ); // Accumulate the minimum of the two elements

    return followingElement; // Return the following element to be the 'currentElement' in the next iteration

  } );

  // Output the final calculated sum to standard output.
  process.stdout.write( totalSum.toString() );

};

// Read input from standard input using Node.js file system module and execute the program.
executeProgram( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );