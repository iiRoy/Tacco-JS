// This script processes data from standard input to solve a variation of the Josephus problem.
// It reads multiple lines, each containing two numbers, and calculates the survivor.

/*
 * Acquire raw text content from the system's standard input stream.
 * The content is expected to be UTF-8 encoded.
 * Any leading or trailing whitespace is removed to ensure clean processing.
 */
var sourceData = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim (  ) ;

// Separate the entire input data into an array of individual lines.
// Each line represents a distinct test case for the problem.
var textualLines = sourceData . split ( '\n' ) ;

// Declare a variable to hold the current line being processed from the input.
var currentSegment;

// Begin processing each line sequentially until no more lines are available.
// The `shift()` method extracts the first element and removes it from the array.
while (  currentSegment  =  textualLines.shift( )  )
{
    // Break down the current line into its constituent numeric parts,
    // assuming they are space-separated.
    var numericParts = currentSegment . split (  ' '  ) ;

    // Convert the first string part to an integer, representing the total number of people.
    var totalIndividuals =  +numericParts[0] ;
    // Convert the second string part to an integer, representing the elimination step.
    var eliminationCount =  +numericParts[1] ;

    // Check for the termination condition: if both numbers are zero,
    // it signals the end of input or a specific problem scenario.
    if  (  totalIndividuals  +  eliminationCount  ===  0  )
    {
        break ; // Exit the processing loop.
    }

    // Initialize a dynamic array to hold the list of participants.
    // Participants are numbered from 1 up to 'totalIndividuals'.
    var remainingParticipants = [  ] ;
    for  ( var iterationIndex = 0 ;  iterationIndex < totalIndividuals ;  iterationIndex ++  )
    {
        remainingParticipants.push (  iterationIndex  +  1  ) ;
    }

    // Simulate the Josephus problem elimination process.
    // Continue as long as there is more than one participant left.
    while  (  remainingParticipants.length  >  1  )
    {
        // This inner loop moves 'eliminationCount - 1' participants
        // from the front of the list to the end, simulating counting.
        for  (  var iterationIndex = 0 ;  iterationIndex  <  eliminationCount  -  1 ;  iterationIndex ++  )
        {
            remainingParticipants.push (  remainingParticipants.shift (  )  ) ;
        }
        // After counting, the 'eliminationCount'-th participant is removed (eliminated).
        remainingParticipants.shift (  ) ;
    }

    // Output the number of the last remaining participant.
    console . log (  remainingParticipants[0]  ) ;
}

// End of script execution.