// This function orchestrates the primary calculation process.
const calculateResult = ( sourceString ) => {

  // Parse the input string to extract numerical parameters.
  const [ loopLimit, baseValue ] = sourceString
    .trim()
    .split(' ')
    .map( currentPart => parseInt(currentPart) )
  ;

  let finalValue = 0; // Initialize an accumulator for the computation.

  // Iterate a specified number of times to build the final value.
  for ( let iterationIndex = 0 ; iterationIndex < loopLimit ; iterationIndex++ ) {
    // For the initial step (first iteration).
    if ( iterationIndex === 0 ) {
      finalValue += baseValue; // Add the base value directly.
      continue; // Skip the rest of this iteration and proceed to the next.
    }
    // For subsequent steps (after the first iteration).
    finalValue *= ( baseValue - 1 ); // Multiply by (baseValue - 1).
  }

  // Display the computed result to the standard output.
  console.info( finalValue );
};

// Retrieve and process system input from the standard input stream.
calculateResult( require("fs").readFileSync("/dev/stdin", "utf8") );