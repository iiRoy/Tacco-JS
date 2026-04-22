/*
 * This routine computes the product of two 4-component vectors,
 * resembling quaternion multiplication or similar linear algebra.
 */
function computeQuaternionProduct( realA, iA, jA, kA, realB, iB, jB, kB )
{
  // Initialize a dynamic array to hold the four output components.
  let resultComponents = [ 0.0, 0.0, 0.0, 0.0 ];

  // Accumulate terms for the real component (index 0)
  resultComponents[0] += ( realA * realB );
  resultComponents[1] += ( realA * iB );
  resultComponents[2] += ( realA * jB );
  resultComponents[3] += ( realA * kB );

  // Accumulate terms for the 'i' component (index 1)
  resultComponents[1] += ( iA * realB );
  resultComponents[0] -= ( iA * iB );
  resultComponents[3] += ( iA * jB );
  resultComponents[2] -= ( iA * kB );

  // Accumulate terms for the 'j' component (index 2)
  resultComponents[2] += ( jA * realB );
  resultComponents[3] -= ( jA * iB );
  resultComponents[0] -= ( jA * jB );
  resultComponents[1] += ( jA * kB );

  // Accumulate terms for the 'k' component (index 3)
  resultComponents[3] += ( kA * realB );
  resultComponents[2] += ( kA * iB );
  resultComponents[1] -= ( kA * jB );
  resultComponents[0] -= ( kA * kB );

  // Return the final computed array of components.
  return resultComponents;
}

// Obtain the raw input data from standard input.
let rawDataString = require('fs') .readFileSync ( '/dev/stdin' ,  'utf8' );

// Process the raw string: trim whitespace and split into individual lines.
let lineFragments = ( rawDataString .trim() ) .split( "\n" );

// The first line indicates the total number of operations to perform.
let totalOperations = lineFragments .shift() - 0;

// Iterate through each specified operation.
for ( let operationIdx = 0 ; operationIdx < totalOperations ; operationIdx++ )
{
  // If the current line fragment is '0', terminate processing early.
  if ( lineFragments[operationIdx] == 0 )
  {
    break;
  }

  // Parse the current line into an array of numeric arguments.
  let currentArguments = lineFragments[operationIdx] .split( " " ) .map( Number );

  // Execute the quaternion product function with the parsed arguments.
  let operationResult = computeQuaternionProduct .apply( null, currentArguments );

  // Output the computed result, with components separated by spaces.
  console.log( operationResult .join( " " ) );
}