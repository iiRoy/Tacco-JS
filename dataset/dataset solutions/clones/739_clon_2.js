const   fileData  =  require ( 'fs' )
                     .  readFileSync (
                         '/dev/stdin'
                       , 'utf8'
                     )  ;

// Process the raw input data into an array of lines.
let inputLines = fileData.trim() .split("\n") ;


// Main processing loop for multiple test cases.
while ( true )
{

    // Extract parameters for the current test case:
    // participantCount (n), skipInterval (k), startOffset (m).
    let [ participantCount , skipInterval , startOffset ]
        = inputLines.shift().split(" ").map( Number )
    ;

    // Check for termination condition: all parameters are zero.
    if ( participantCount + skipInterval + startOffset === 0 )
    {
        break ; // Exit the main loop.
    }

    // Initialize an array to track the status of each participant.
    // 'true' means participant is active, 'false' means eliminated.
    let participantStatuses = [] ;
    for ( let itemIndex = 0 ; itemIndex < participantCount ; itemIndex ++ )
    {
        participantStatuses[ itemIndex ] = true ;
    }

    // Determine the initial starting position for elimination.
    let currentPosition = startOffset - 1 ;

    // Keep track of how many participants are still active.
    let remainingParticipants = participantCount ;

    // Inner loop for the elimination process.
    while ( true )
    {
        // If only one participant remains, the process is complete.
        if ( remainingParticipants === 1 )
        {
            break ; // Exit the elimination loop.
        }

        // Mark the participant at the current position as eliminated.
        participantStatuses[ currentPosition ] = false ;
        remainingParticipants -- ; // Decrement the count of active participants.

        // Counter for skipping participants.
        let skippedParticipants = 0 ;
        while ( true )
        {
            // If we have skipped enough active participants, stop.
            if ( skippedParticipants === skipInterval )
            {
                break ; // Exit the skipping loop.
            }

            // Move to the next position in the circle.
            currentPosition ++ ;

            // Wrap around if we go past the end of the participant list.
            if ( currentPosition >= participantCount )
            {
                currentPosition = 0 ;
            }

            // If the participant at the new position is active, count them.
            if ( participantStatuses[ currentPosition ] )
            {
                skippedParticipants ++ ;
            }
        }
    }

    // After elimination, find and print the index of the last remaining participant.
    participantStatuses.forEach (
        ( isStillActive , originalMemberIdx ) => {
            if ( isStillActive )
            {
                console.log ( originalMemberIdx + 1 ) ;
            }
        }
    ) ;
}