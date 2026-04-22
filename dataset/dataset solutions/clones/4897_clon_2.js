// Function to analyze a given character sequence for a specific pattern.
function ProcessString( textSequence )
{
  // Convert the incoming string into an array of individual characters.
  textSequence = textSequence.split( "" ) ;

  // Initialize a state tracking variable.
  let stateIndicator = 0 ;

  // Iterate over each character in the sequence.
  for ( let charIndex = 0 ; charIndex < textSequence.length ; charIndex++ )
  {
    // Evaluate the current state to determine the next action.
    switch ( stateIndicator )
    {
      case 0 : // Initial state: looking for the first character.
        if ( textSequence[ charIndex ] === "C" )
        {
          stateIndicator++ ; // Transition to the next state.
        }
        break ;

      case 1 : // Intermediate state: first character found, now looking for the second.
        if ( textSequence[ charIndex ] === "F" )
        {
          stateIndicator = 2 ; // Transition to the final success state.
        }
        break ;
    }
  }

  // After processing the entire sequence, check the final state.
  if ( stateIndicator === 2 )
  {
    console.log( "Yes" ) ; // Pattern successfully detected.
  }
  else
  {
    console.log( "No" ) ; // Pattern not found.
  }
}

// Execute the string processing function with input from standard input.
ProcessString( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim() ) ;