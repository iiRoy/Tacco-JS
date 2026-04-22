// This function processes raw string data to calculate a final score.
function   processInputData (  rawDataString  ) {
  /*
   * First, clean the input string by removing leading/trailing whitespace,
   * then split it into an array of individual character elements.
   */
  const   symbolSequence   =   rawDataString . trim() . split( '' );

  // Initialize the accumulator for the total score with a predefined base value.
  let   totalScore   =   700;

  // Iterate over each character element present in the generated sequence.
  symbolSequence . forEach (
    function ( charElement ) {
      // Evaluate if the current character matches our specific target character 'o'.
      if ( charElement  ==  'o' ) {
        // If a match is found, augment the total score by a fixed increment.
        totalScore  +=  100;
      }
    }
  );

  /*
   * Finally, output the sum of the initial base value and the
   * dynamically calculated total score to the standard console.
   */
  console . log ( 700  +  totalScore );
}

// Invoke the primary data processing function, feeding it content
// asynchronously read from the system's standard input stream,
// interpreted as UTF-8 encoded text.
processInputData (
  require ( 'fs' ) . readFileSync (
    '/dev/stdin',
    'utf8'
  )
);