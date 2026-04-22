// Immediately invoked asynchronous function to handle input and computation
( async ( ) => {
  // Variable to store all incoming stream data
  let capturedText = '';

  // Asynchronously iterate over chunks from standard input
  for await ( const inputPart of process.stdin ) {
    capturedText += inputPart;
  }

  // Convert the captured text to a numeric value, which will be our modulus operand
  const modulusOperand = +capturedText;

  // Initialize a working variable for calculations
  let temporaryResult = 0;

  // Loop from the first position up to the modulus operand
  for ( let sequencePosition = 1; sequencePosition <= modulusOperand; sequencePosition++ ) {
    // Perform the core calculation: (previous_result * 10 + 7)
    temporaryResult = ( temporaryResult * 10 ) + 7;

    // Apply the modulo operation to keep the result within bounds
    temporaryResult %= modulusOperand;

    // Check if the current remainder is zero
    if ( temporaryResult === 0 ) {
      // If zero, log the current sequence position and terminate execution
      console.log( sequencePosition );
      return;
    }
  }

  // If the loop completes without finding a zero remainder, log -1
  console.log( -1 );
} ) ( );