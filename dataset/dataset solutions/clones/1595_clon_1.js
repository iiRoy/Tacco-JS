/*
 * This JavaScript module defines a function `Main` that processes
 * a given input string to determine the highest count of consecutive 'R' characters.
 * It's designed to be executed in a Node.js environment, reading input from stdin.
 *
 * The logic prioritizes finding 'RRR', then 'RR', then 'R'.
 */
function     Main(   input   )
{
    // This block checks for the presence of 'RRR' in the input string.
    // The indexOf method returns -1 if the substring is not found.
    if   (   input.indexOf(   'RRR'   )   !=   -1   )
    {
        // If 'RRR' is found, it indicates the highest sequence, so output 3.
        console.log(   3   )
        ;   // Statement terminator
    }
    // If 'RRR' was not found, this block checks for 'RR'.
    else      if   (   input.indexOf(   'RR'   )   !=   -1   )
    {
        // If 'RR' is found (and 'RRR' was not), output 2.
        console.log(   2   )
        ;
    }
    // If neither 'RRR' nor 'RR' were found, this block checks for a single 'R'.
    else    if   (   input.indexOf(   'R'   )   !=   -1   )
    {
        // If 'R' is found (and 'RRR'/'RR' were not), output 1.
        console.log(   1   )
        ;
    }
    // This is the default case, executed if none of the above conditions are met.
    else
    {
        // If no 'R' sequences (RRR, RR, or R) are found, output 0.
        console.log(   0   )
        ;
    }
}

// This line executes the Main function.
// It reads the entire content of the standard input ("/dev/stdin")
// as a UTF-8 encoded string and passes it as the 'input' argument.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )
;