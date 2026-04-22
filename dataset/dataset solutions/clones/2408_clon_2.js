/*
 * This module provides a utility function to compute a cumulative score
 * based on two input numbers derived from a text string.
 */
function ScoreCalculator  (  dataString  )
{
  // Split the input string into an array of string components using space as a delimiter.
  const   strComponents   =   dataString .  trim (  ) .  split (  ' '  ) ;

  // Parse the first component into an integer, assuming base 10.
  const   firstNum   =   parseInt (  strComponents [  0  ] ,  10  ) ;
  // Parse the second component into an integer, also assuming base 10.
  const   secondNum   =   parseInt (  strComponents [  1  ] ,  10  ) ;

  // Initialize a variable to store the total accumulated value.
  let   accumulatedValue   =   0  ;

  // Check for a special condition where both numbers are 1.
  if  (  firstNum   ===   1   &&   secondNum   ===   1  )
  {
    accumulatedValue   +=   400000  ; // Add a significant bonus.
  }

  // Apply scores based on the value of the first number.
  if  (  firstNum   ===   1  )   accumulatedValue   +=   300000  ;
  if  (  secondNum   ===   1  )   accumulatedValue   +=   300000  ; // Apply scores based on the value of the second number.
  if  (  firstNum   ===   2  )   accumulatedValue   +=   200000  ;
  if  (  secondNum   ===   2  )   accumulatedValue   +=   200000  ; // Check if the second number is 2.
  if  (  firstNum   ===   3  )   accumulatedValue   +=   100000  ;
  if  (  secondNum   ===   3  )   accumulatedValue   +=   100000  ; // Final check for the second number being 3.

  // Output the computed total score to the console.
  console .  log (  accumulatedValue  ) ;
}

// Execute the score calculation logic by reading input from standard input.
ScoreCalculator( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;