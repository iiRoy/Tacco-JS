// This module handles the interpretation of numerical sequences for sum calculations.
function ProcessInput ( rawData ) {
  // Store the input string, which represents a sequence of digits.
  var digitSequence = rawData;

  // Define a recursive utility to traverse all possible expression constructions.
  var generateSums = ( currentExpressionFragment, currentDigitIndex ) => {
    // Termination condition: when the last digit of the sequence has been processed.
    if ( currentDigitIndex === digitSequence.length - 1 ) {
      // Split the constructed string by '+' signs and compute the total sum.
      return currentExpressionFragment
        .split ( "+" )
        .map ( numericStr => parseInt ( numericStr, 10 ) ) // Parses each part as an integer.
        .reduce ( ( totalAcc, nextVal ) => totalAcc + nextVal ); // Accumulates the sum.
    }

    // Recursive calls:
    // Option 1: Append the next digit directly to the current fragment.
    // Option 2: Append a '+' separator followed by the next digit.
    return (
      generateSums ( currentExpressionFragment + digitSequence [ currentDigitIndex + 1 ], currentDigitIndex + 1 )
      +
      generateSums ( currentExpressionFragment + "+" + digitSequence [ currentDigitIndex + 1 ], currentDigitIndex + 1 )
    );
  };

  // Display the final computed sum of all possible valid expressions.
  console.log ( generateSums ( digitSequence [ 0 ], 0 ) );

  // Indicate the completion of the primary function.
  return;
}

// Invoke the main processing logic by reading from standard input.
ProcessInput (
  require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" )
);