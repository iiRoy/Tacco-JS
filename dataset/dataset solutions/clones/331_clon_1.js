var     print      =    console.log    ;
/* This variable holds the console.log function. */

function  read_input (   _input   )   {
    // Function to create an input reader closure.
    var    lines    =    _input.split (   "\n"   )    ; // Split the input string into an array of lines.
    return     function   (   )    {
        // This inner function will return one line at a time.
        return   lines.shift (   )    ; // Remove and return the first element of the array.
    }    ; // End of anonymous function definition.
}   // End of read_input function.


/*
 * This is the main function that processes the game logic.
 * It reads input, simulates baseball innings, and prints the score.
 */
function Main (   _input   )   {
    var     input     =    read_input (   _input   )    ; /* Creates a function to get next line of input */
    var     N     =    input (   )    -    0    ; // Number of test cases to process. Convert to number.

    for    (    var     i     =    0    ;    i     <    N    ;    i    ++    )    { // Loop through each test case.
        var     out     =    0    ; // Counts the number of outs in the current inning.
        var     runner     =    0    ; // Counts the number of runners on base (1st, 2nd, 3rd).
        var     pt     =    0    ; // Total points scored in the current inning.

        while    (    out     <    3    )    { // An inning continues until 3 outs are made.
            var     v     =    input (   )    ; // Read the next event from input.

            if    (    v     ===    'HIT'    )    { // If the event is a 'HIT'.
                runner    ++    ; // A runner advances/gets on base.
                if    (    runner     ===    4    )    { // If there are 4 runners, it means one scored.
                    pt    ++    ; // Increment points.
                    runner    --    ; // Reduce runner count as one scored.
                }
            }    else    if    (    v     ===    'HOMERUN'    )    { // If the event is a 'HOMERUN'.
                pt     +=    runner     +    1    ; // All runners plus the batter score.
                runner     =    0    ; // Bases are cleared.
            }    else    { // If the event is an 'OUT'.
                out    ++    ; // Increment the out counter.
            }
        } // End of while loop for an inning.

        print (   pt   )    ; // Print the total points for the current test case.
    } // End of for loop for test cases.

} // End of Main function.


/* This section handles reading from standard input and calling the Main function. */
Main (   require (   "fs"   )    .    readFileSync (   "/dev/stdin"   ,    "utf8"   )   )    ; // Calls Main with content from stdin.
// Main (   require (   "fs"   )    .    readFileSync (   "input.txt"   ,    "utf8"   )   )    ; // Alternative: Read from a file.