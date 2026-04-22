/*
 * This program processes geographical direction strings
 * from standard input, calculating a final angular value.
 * It reads each line until a specific termination character is encountered.
 */
var   sourceData   = require  ( 'fs' ) . readFileSync (   '/dev/stdin'  , 'utf8'   ) ;

var   dataSegments   = (   sourceData . trim ( )   ) . split  (  "\n"  )   ;

// Main processing loop: continues until a specific break condition is met.
while   (   true   )
{
    var   currentLine   =   dataSegments . shift ( )   ; // Extract the next segment.

    // Check for the termination signal.
    if   (   currentLine   ==   "#"   )
        break   ;

    // Clean up the string by removing certain directional prefixes/suffixes.
    currentLine   =   currentLine . replace   (   /orth|est/g   ,   ""   )   ;

    var   totalAngle   =   0   ; // Initialize the angular accumulator.

    // Determine the initial angle based on the first character.
    if   (   currentLine [ 0 ]   ==   "n"   )
        totalAngle   =   0   ;

    if   (   currentLine [ 0 ]   ==   "w"   )
        totalAngle   =   90   ;

    var   directionTracker   =   currentLine [ 0 ]   ; // Keep track of the last significant direction.
    var   exponentCounter   =   1   ; // Counter for the power of 2 in division.

    // Iterate through the rest of the characters in the line.
    for   (   var   charPosition   =   1   ;   charPosition   <   currentLine . length   ;   charPosition++   )
    {
        // Adjust angle for 'n' (north) if different from previous direction.
        if   (   currentLine [ charPosition ]   ==   "n"   &&   directionTracker   !=   "n"   )
            totalAngle   -=   90   /   Math . pow   (   2   ,   exponentCounter   )   ;

        // Adjust angle for 'w' (west) if different from previous direction.
        if   (   currentLine [ charPosition ]   ==   "w"   &&   directionTracker   !=   "w"   )
            totalAngle   +=   90   /   Math . pow   (   2   ,   exponentCounter   )   ;

        // Reset or increment the exponent counter based on direction consistency.
        exponentCounter   =   (   directionTracker   ==   currentLine [ charPosition ]   )   ?   (   exponentCounter   +   1   )   :   1   ;

        // Update the direction tracker for the next iteration.
        directionTracker   =   currentLine [ charPosition ]   ;
    }

    // Convert the angle to a fraction if it's not an integer.
    var   denominatorCandidate   =   1   ;
    while   (   true   )
    {
        // Check if the current angle multiplied by the candidate is an integer.
        if   (   (   totalAngle   *   denominatorCandidate   )   %   1   ==   0   )
        {
            // If the candidate is 1, it's already an integer, no fraction needed.
            if   (   denominatorCandidate   ==   1   )
                break   ;

            // Format as a fraction string.
            totalAngle   =   ""   +   (   totalAngle   *   denominatorCandidate   )   +   "/"   +   denominatorCandidate   ;
            break   ;
        }
        denominatorCandidate++   ; // Try the next denominator.
    }

    // Output the calculated angle or fraction.
    console . log   (   totalAngle   )   ;
}