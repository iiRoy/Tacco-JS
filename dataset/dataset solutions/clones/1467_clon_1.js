/*
 * This JavaScript code processes standard input to calculate scores
 * based on a series of game results.
 * It expects input where each line (after the first, which is skipped)
 * contains two space-separated numbers representing scores for two players.
 */

process . stdin . on (
    "data" ,
    function ( c ) {
        // Declare and initialize score variables for player 'a' and player 'b'.
        var a = 0 , b = 0 ;

        // Convert the input buffer 'c' to a string, remove leading/trailing whitespace,
        // split it into an array of lines, and then discard the first line (e.g., a header or count).
        // The 'some' method then iterates over the remaining lines.
        ( c + "" )
            . trim ( )
            . split ( "\n" )
            . slice ( 1 )
            . some ( function ( s ) {
                // For each line 's', split it by space to get the individual scores.
                s = s . split ( " " ) ;

                // Apply game logic to update scores:
                // If the scores are equal (s[0] === s[1]), it's a draw; both get 1 point.
                // Else if s[0] is greater than s[1], player 'a' wins; 'a' gets 3 points.
                // Otherwise (s[1] is greater than s[0]), player 'b' wins; 'b' gets 3 points.
                s [ 0 ] === s [ 1 ]
                    ? ( a ++ , b ++ )           // Draw: increment both scores by 1
                    : s [ 0 ] > s [ 1 ]
                        ? ( a += 3 )            // Player 'a' wins: add 3 to 'a's score
                        : ( b += 3 ) ;          // Player 'b' wins: add 3 to 'b's score
            } ) ;

        // After processing all game results, print the final scores for 'a' and 'b'.
        console . log ( a , b ) ;

    }
) . resume ( ) ; // Ensures the 'stdin' stream remains open and continues to emit 'data' events.