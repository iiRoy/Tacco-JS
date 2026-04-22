function CalculateNumericValue(  numericSequence  ) {
  /* Obtain the total character count of the provided string */
  const sequenceLength = numericSequence.length;

  /* Extract the initial character and convert it to an integer */
  const leadingDigit = Number.parseInt( numericSequence.slice( 0, 1 ) );

  // Get the very last character of the sequence
  const trailingChar = numericSequence.slice( -1 );

  let finalValue; /* This variable will store our computed outcome */

  // First decision point: Is the input sequence a single character long?
  if ( sequenceLength === 1 ) {
    finalValue = Number.parseInt( numericSequence );
  }
  // Second decision point: Is the last character '9' AND the string has exactly two characters?
  // This condition is equivalent to: if the last char is '9' AND (sequenceLength - 1) is 1.
  else if ( trailingChar === '9' ) {
    if ( (sequenceLength - 1) === 1 ) {
      finalValue = ( sequenceLength - 1 ) * 9 + leadingDigit;
    }
  }
  // Default calculation for all other cases
  else {
    finalValue = ( sequenceLength - 1 ) * 9 + leadingDigit - 1;
  }

  // Display the final computed result to standard output
  global.console.log( finalValue );
}

// Invoke the primary calculation function with data from standard input
CalculateNumericValue(
  require( "fs" ) . readFileSync (
    "/dev/stdin",
    "utf8"
  )
);