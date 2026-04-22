// This script processes numerical input to perform a specific calculation.
function     performCalculation( rawTextStream )
{
  // Remove leading/trailing whitespace and divide the input into separate lines.
  const lineSegments = rawTextStream.trim() .split(   '\n' );

  // Parse the very first segment as an integer, using base 10.
  const initialOperand = parseInt( lineSegments[0] , 10 );

  // Parse the subsequent segment as another integer, also base 10.
  const subtractedOperand = parseInt( lineSegments[1] , 10  );

  // Display the outcome of subtracting two parsed numbers from a constant.
  console.log(  6 - initialOperand - subtractedOperand );
}

// Activate the primary function, feeding it content from the system's standard input channel.
performCalculation( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) );