function ProcessInputData ( rawTextContent )
{
  // Split the raw input string into individual lines for processing.
  let parsedLines = rawTextContent.split( '\n' ) ;

  // Extract initial configuration parameters from the first line.
  let configParameters = parsedLines[0].split( ' ' );
  let totalParticipantCount = parseInt( configParameters[0] );
  let minimumScoreThreshold = parseInt( configParameters[1] );
  let totalEventQueries = parseInt( configParameters[2] );

  // Initialize an array to hold scores for each participant.
  // The size of the array is determined by the total number of participants.
  let participantScores = new Array( totalParticipantCount );

  // Outer loop: Iterate through each event query.
  // Note: Queries are 1-indexed in the problem, so start from 1.
  for ( let currentQueryNumber = 1 ; currentQueryNumber <= totalEventQueries ; currentQueryQueryNumber++ )
  {
    // Inner loop: Iterate through each participant.
    for ( let participantIndex = 0 ; participantIndex < totalParticipantCount ; participantIndex++ )
    {
      // On the very first query, initialize all participant scores to zero.
      if ( currentQueryNumber === 1 ) {
        participantScores[participantIndex] = 0 ;
      }

      // Check if the participant mentioned in the current query line
      // is different from the current participant being evaluated (participantIndex + 1).
      // If they are different, it means this participant did NOT win this round.
      if ( parseInt( parsedLines[currentQueryNumber] ) !== ( participantIndex + 1 ) )
      {
        // Increment the score for the current participant.
        participantScores[participantIndex] ++ ;
      }
    }
  }

  // After all queries are processed, evaluate each participant's final score.
  participantScores.forEach( function ( currentParticipantScore )
  {
    // If a participant's score is greater than or equal to the minimum threshold,
    // they are not eligible ('No'). Otherwise, they are eligible ('Yes').
    ( currentParticipantScore >= minimumScoreThreshold )
      ? console.log( 'No' )
      : console.log( 'Yes' )
    ;
  } ) ;
}

// Read input from standard input and pass it to the processing function.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );