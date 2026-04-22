const   handleProblemSolution    =   (   sourceData  )   =>
{
  // Extracting initial configuration parameters from the first line of input
  let     configLineElements  =   sourceData[0].split(" ")  ;

  let     totalContestants    =   Number( configLineElements[0] )   ; // Represents N
  let     requiredThreshold   =   Number( configLineElements[1] )   ; // Represents K
  let     gameEventsCount     =   Number( configLineElements[2] )   ; // Represents Q

  // Initialize an object to track scores for each participant
  const   participantScores     =   {  }  ;

  // Iterate through each game event to update participant scores
  // The events are listed from index 1 up to gameEventsCount (Q)
  for
    (   let   eventCounter  =   1  ;   eventCounter   <=   gameEventsCount  ;   eventCounter++   )
  {
    let   victoriousParticipantId   =   Number( sourceData[ eventCounter ] )   ; // The ID of the participant who won this round
    // Increment the score for the winning participant.
    // If the participant hasn't scored yet, initialize their score to 0 before incrementing.
    participantScores[ victoriousParticipantId ]   =   (   participantScores[ victoriousParticipantId ]   ||   0   )   +   1   ;
  }

  // Determine eligibility for each contestant based on their final scores
  // Iterate from participant ID 1 up to totalContestants (N)
  for
    (   let   contestantId  =   1  ;   contestantId   <=   totalContestants  ;   contestantId++   )
  {
    // Calculate the number of points lost by this contestant.
    // Each round they didn't win counts as a "lost point" from the total possible rounds.
    let   pointsLostByContestant    =   gameEventsCount   -   (   participantScores[ contestantId ]   ||   0   )   ;

    // Check if the participant's score (represented by points lost) meets the required threshold.
    // A lower number of lost points means a higher actual score.
    if
      (   pointsLostByContestant   <   requiredThreshold   )
    {
      console.log   (   "Yes"   )   ; // Participant is eligible
    }
    else
    {
      console.log   (   "No"   )   ; // Participant is not eligible
    }
  }
}

// Execute the solution with input data read from standard input.
// The input is read as a UTF-8 string, trimmed of whitespace, and split into lines.
handleProblemSolution
  (
    require   (   'fs'   )
      .   readFileSync   (   '/dev/stdin'   ,   'UTF-8'   )
      .   trim   (   )
      .   split   (   "\n"   )
  )   ;