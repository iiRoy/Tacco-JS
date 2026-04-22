const calculateScore = function computeResult( rawContent )
{
  // Initialize a counter for specific character occurrences.
  let letterCount = 0;
  
  /*
   * Iterate through each character of the provided input string.
   * The loop continues as long as the character index is within the string's bounds.
   */
  for  (  let charIndex  =  0  ;  charIndex  <  rawContent.length  ;  charIndex++  )
  {
    // Check if the current character matches our target character 'x'.
    if  (  rawContent[charIndex]  ===  'x'  )
    {
      // If a match is found, increment the occurrence tally.
      letterCount++;
    }
  }

  // Output the final calculated value, which is a base score plus a weighted count.
  console.info( 500  +  letterCount  *  50 );
}; // End of computeResult function definition.

// Execute the calculation by reading content from standard input.
calculateScore( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) );