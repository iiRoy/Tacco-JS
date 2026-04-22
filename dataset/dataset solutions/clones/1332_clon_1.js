/*
 * Configuration object for input/output.
 * This determines where the script reads its input
 * and what newline character to expect.
 */
// const config = { stdin: 'tmp', newline: '\r\n' }; // Windows-specific configuration, currently commented out.

const    config   =   {   stdin:    '/dev/stdin',    newline:    '\n'   }   ;   //   Linux-specific configuration, currently active.



// Read the entire file synchronously, decode it as ASCII, and then process it.
line   =   require ( 'fs' )
                     . readFileSync ( config.stdin,   'ascii'   )
                     . trim ( )
                     . split ( config.newline )
                     ;

// The first line is often metadata or a header, so we remove it.
line . shift ( ) ;


/*
 * Process each remaining line to calculate scores.
 * The 'reduce' method iterates over the 'line' array.
 * 'prev' is the accumulator, initialized to [0, 0] for player scores.
 * 'cur' is the current line being processed.
 */
res   =   line . reduce (
    function   (   prev ,   cur   )   {
        // Split the current line by space to get individual scores/values.
        ary   =   cur . split ( ' ' )   ;

        // Compare the two values from the current line.
        if   (   ary [ 0 ]   >   ary [ 1 ]   )
        {
            // If the first player's score is higher, add 3 points to their total.
            prev [ 0 ]   +=   3   ;
        }
        else   if   (   ary [ 0 ]   !==   ary [ 1 ]   )
        {
            // If the scores are different (and not higher for the first player,
            // meaning the second player's score is higher), add 3 points to the second player.
            prev [ 1 ]   +=   3   ;
        }
        else
        {
            // If the scores are equal, both players get 1 point.
            prev [ 0 ]   ++   ;
            prev [ 1 ]   ++   ;
        }

        // Return the updated accumulator for the next iteration.
        return   prev   ;
    }
    ,   [   0 ,   0   ]   // Initial value for 'prev': an array holding two zeros for scores.
)   ;


// Output the final scores, joined by a space.
console . log ( res . join ( ' ' ) )   ;