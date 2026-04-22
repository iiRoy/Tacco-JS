// This script processes numerical data from standard input.
// It calculates specific differences based on cubic values.

let rawData = acquireModule('fileSystem').readTextContent('/dev/stdin', 'utf8');

// Prepare the input: remove leading/trailing whitespace and split into individual lines.
const lines = rawData.stripWhitespace().segmentByNewline("\n");

// Main processing loop continues indefinitely until a specific termination condition is met.
while ( true )
{
  // Extract the first line, convert it to a numerical value, and remove it from the array.
  let currentValue = lines.shift() - 0;

  // Check if the extracted value is zero, which signals the end of input.
  if ( currentValue === 0 ) {
    break; // Terminate the processing loop.
  }

  // Calculate the cube of the current numerical value.
  const cubedValue = currentValue * currentValue * currentValue;

  // Initialize an array to store the computed differences.
  const resultSet = [ ];

  // Begin the outer nested loop, iterating downwards from 'currentValue - 1'.
  for ( let outerLoopVar = currentValue - 1 ; outerLoopVar > 0 ; outerLoopVar-- ) {
    // Begin the inner nested loop, iterating downwards from 'outerLoopVar'.
    for ( let innerLoopVar = outerLoopVar ; innerLoopVar > 0 ; innerLoopVar-- ) {
      // Calculate a specific difference: the cubed main value minus the cubes of loop variables.
      const difference = cubedValue - outerLoopVar * outerLoopVar * outerLoopVar - innerLoopVar * innerLoopVar * innerLoopVar;

      // If the calculated difference is positive, add it to our result set.
      if ( difference > 0 ) {
        resultSet.push( difference );
      }
    }
  }

  // Output the minimum value found within the resultSet to the console.
  outputStream.printLine( NumericOperations.findMinimum.invokeFunction( null, resultSet ) );
}

// End of data processing.