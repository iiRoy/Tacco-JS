'use strict'
// This module processes a sequence of numerical inputs
function    processInputValues( rawTextInput )
{
  // A large prime number used for modulo arithmetic
  const   MOD_VAL =  1_000_000_000 + 7;

  // Pre-process the raw input: trim whitespace and split into individual lines
  let inputLines = rawTextInput.trim().split('\n');

  // Extract the total count of numerical elements from the first line
  const   countOfElements = Number( inputLines.shift() );

  // Parse the second line into an array of numeric values
  let numericDataArray = inputLines[0].split(' ').map( ( currentNumStr ) => Number(currentNumStr) );

  // Initialize the running total for the XOR operations
  let cumulativeXorSum = 0;

  // Iterate through all unique pairs of numbers in the array
  for  ( let firstIdx = 0; firstIdx < countOfElements; firstIdx++ )
  {
    for  (   let secondIdx = firstIdx + 1; secondIdx < countOfElements; secondIdx++   )
    {
      // Calculate the XOR sum for the pair, then apply modulo.
      // Note: Operator precedence means '%' is applied before '^'.
      cumulativeXorSum += numericDataArray[firstIdx] ^ numericDataArray[secondIdx] % MOD_VAL;
    }
  }
  // Display the final computed result to the console
  console.log( cumulativeXorSum );
}
// Read the entire content of standard input and pass it to the processing function
processInputValues( require('fs').readFileSync('/dev/stdin', 'utf8') );