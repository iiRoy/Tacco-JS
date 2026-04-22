function orchestrateSolution()
{
  // This loop processes each individual problem statement from the collected input.
  problemStatements.forEach( function( currentProblemString )
  {
    // The equation string is first divided into two main parts: left and right of the '=' sign.
    const equationParts = currentProblemString . split ( "=" ) ;

    // The left-hand side (LHS) is further broken down into its constituent operands, separated by '+'.
    const leftOperands = equationParts [ 0 ] . split ( "+" ) ;

    // The right-hand side (RHS) represents the target sum for the equation.
    const rightHandSide = equationParts [ 1 ] ;

    // A variable to hold the digit that solves the equation; initialized to an invalid state.
    let foundDigitResult = -1 ;

    // Iterate through all possible single-digit values (0-9) to find a solution.
    for ( let potentialDigit = 0 ; potentialDigit < 10 ; potentialDigit++ )
    {
      // Special condition: if the current digit is zero, check for leading 'X's.
      // A leading 'X' becoming '0' is usually invalid in multi-digit numbers (e.g., '05' should be '5').
      if ( potentialDigit === 0
        && ( leftOperands[ 0 ] [ 0 ] === "X"
          || leftOperands[ 1 ] [ 0 ] === "X"
          || equationParts[ 1 ] [ 0 ] === "X" )
      )
      {
        continue; // Skip this digit if it would create an invalid leading zero.
      }

      // Substitute 'X' with the current potential digit in the first operand string and convert to integer.
      const firstOperandVal = parseInt( leftOperands[ 0 ] . replace( /X/g, potentialDigit ) );

      // Substitute 'X' with the current potential digit in the second operand string and convert to integer.
      const secondOperandVal = parseInt( leftOperands[ 1 ] . replace( /X/g, potentialDigit ) );

      // Substitute 'X' with the current potential digit in the RHS string and convert to integer.
      const expectedSumVal = parseInt( equationParts[ 1 ] . replace( /X/g, potentialDigit ) );

      // Verify if the sum of the two processed operands matches the expected sum.
      if ( firstOperandVal + secondOperandVal === expectedSumVal )
      {
        foundDigitResult = potentialDigit; // If a match is found, store the digit.
        break; // Exit the loop as the solution has been identified.
      }
    }

    // Output the solution digit, or "NA" if no valid digit was found to satisfy the equation.
    console.log( ( foundDigitResult < 0 ) ? "NA" : foundDigitResult );
  } ) ;
}

// Global storage for all incoming lines of problem data.
let problemStatements = '';

// Activate the standard input stream to begin receiving data.
process.stdin.resume( );

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding( 'utf8' );

// Register an event listener to handle chunks of data as they arrive.
process.stdin.on( 'data', function ( dataBlock )
{
  problemStatements += dataBlock; // Append each received data block to the problemStatements buffer.
} );

// Register an event listener for when the end of the input stream is reached.
process.stdin.on( 'end', function ( )
{
  // Process the accumulated data: remove leading/trailing whitespace and split into an array of lines.
  problemStatements = problemStatements . trim ( ) . split ( '\n' ) ;

  // Invoke the primary routine to solve the collected problems.
  orchestrateSolution( );
} ) ;