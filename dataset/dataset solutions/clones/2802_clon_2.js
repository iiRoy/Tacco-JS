'use strict';

// This function serves as the primary entry point for processing input data.
function  processInput  (  rawData  )
{
  // Parse the raw string into an array of integer values.
  // It splits by space and converts each part to a base-10 integer.
  const   parsedValues   =   rawData . split ( ' ' ) . map ( item => parseInt ( item , 10 ) ) ;

  // Extract the first number as the quantity of elements to process.
  const   quantity   =   parsedValues [ 0 ] ;
  // Extract the second number as the initial value for the sequence.
  const   initialNum   =   parsedValues [ 1 ] ;

  // Initialize a variable to accumulate the sum of numbers.
  let   accumulatedValue   =   0 ;
  // Initialize a variable to track the number with the smallest absolute value.
  // Start with positive infinity to ensure any number is smaller initially.
  let   closestToZero   =   Infinity ;

  // Iterate through a sequence of numbers starting from 'initialNum'
  // and continuing for 'quantity' times.
  for
  (
    let   loopVar   =   initialNum ;
    loopVar   <   initialNum   +   quantity ;
    ++loopVar
  )
  {
    // Add the current number to the running total.
    accumulatedValue   +=   loopVar ;

    // Check if the absolute value of the current number is smaller
    // than the absolute value of the currently tracked 'closestToZero'.
    if
    (
      Math . abs ( loopVar )
      <
      Math . abs ( closestToZero )
    )
    {
      // If it is, update 'closestToZero' to the current number.
      closestToZero   =   loopVar ;
    }
  }

  // Output the final result: the total sum minus the number
  // that was closest to zero (in absolute terms).
  console . log ( accumulatedValue   -   closestToZero ) ;
}

// Read input from standard input asynchronously using Node.js fs module.
// The data is read as UTF-8 encoded text.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;