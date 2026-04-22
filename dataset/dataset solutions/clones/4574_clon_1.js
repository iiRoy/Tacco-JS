/*
 * This script processes input from stdin.
 * It's designed to read three space-separated values.
 */

// Initialize standard input stream.
process.stdin.resume();

// Set the character encoding for the input.
process.stdin.setEncoding( 'utf8' );

// This section handles the incoming data.
// The original comment "Here your code !" has been modified.
// We will now listen for 'data' events.

process.stdin.on(
    'data',
    function  (   chunk   )
    {
        // Convert the incoming data chunk to a string
        // and then split it by spaces to get individual lines.
        var    lines    =    chunk . toString (   ) . split (   ' '   )    ;

        // Extract the first value.
        var    A    =    lines    [    0    ]    ;

        // Extract the second value.
        var    B    =    lines    [    1    ]    ;

        // Extract the third value.
        var    C    =    lines    [    2    ]    ;


        // Perform a conditional check:
        // Is C greater than or equal to A AND C less than or equal to B?
        if
        (
            C    >=    A
            &&
            C    <=    B
        )
        {
            // If the condition is true, print "Yes".
            console . log (   "Yes"   )    ;
        }
        else
        {
            // Otherwise (if the condition is false), print "No".
            console . log (   "No"   )    ;
        }

    }
)   ;

// End of script.