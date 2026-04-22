var   lines   =   [ ]   ; // This array will store all lines read from standard input.


/*
 *  The 'readline' module provides an interface for reading data from a Readable stream
 *  (such as process.stdin) one line at a time.
 */
var   readline   =   require   (   'readline'   )   ;


// Create a readline interface instance.
var   rl   =   readline.createInterface   (   {
    // Input stream: standard input (keyboard)
    input   :   process.stdin   ,

    // Output stream: standard output (console)
    output   :   process.stdout   ,
}   )   ;


// Event listener for each line of input received.
rl.on   (   'line'   ,   function   (   x   )
{
    // Add the received line to the 'lines' array.
    lines.push   (   x   )   ;
}   )   ;


// Event listener for when the input stream is closed.
rl.on   (   'close'   ,   function   (   )
{
    // Parse the first line of input to extract several numerical values.
    // The line is expected to contain space-separated numbers.

    var   N   =   Number   (   lines   [   0   ]   .   split   (   " "   )   [   0   ]   )   ;
    var   A   =   Number   (   lines   [   0   ]   .   split   (   " "   )   [   1   ]   )   ;
    var   B   =   Number   (   lines   [   0   ]   .   split   (   " "   )   [   2   ]   )   ;
    var   C   =   Number   (   lines   [   0   ]   .   split   (   " "   )   [   3   ]   )   ;
    var   D   =   Number   (   lines   [   0   ]   .   split   (   " "   )   [   4   ]   )   ;

    // The second line of input is treated as a string of characters.
    var   S   =   lines   [   1   ]   .   split   (   ""   )   ;

    // Initialize a flag variable.
    var   flag   =   false   ;

    // Iterate through the string S to check for specific patterns and conditions.
    for   (   var   i   =   0   ;   i   <   S   .   length   ;   i   ++   )
    {
        // Condition 1: Check for two consecutive '#' characters.
        // If found, and within certain bounds related to A, C, and D, output "No" and exit.
        if   (   (   S   [   i   ]   ===   "#"   &&   S   [   i   +   1   ]   ===   "#"   )   &&   A   <=   i   &&   i   +   1   <=   Math.max   (   C   ,   D   )   )
        {
            console.log   (   "No"   )   ;
            return   (   0   )   ;
        }

        // Condition 2: Check for three consecutive '.' characters.
        // If found, and within certain bounds related to B and D, set the flag to true.
        if   (   (   S   [   i   ]   ===   "."   &&   S   [   i   +   1   ]   ===   "."   &&   S   [   i   +   2   ]   ===   "."   )   &&   B   <=   i   +   1   &&   i   +   1   <=   D   )
        {
            flag   =   true   ;
        }
    }

    // Final decision logic based on D, C, specific characters in S, and the 'flag' variable.
    // This part handles a special case where D < C.
    if   (   D   <   C   &&   (   S   [   B   -   2   ]   ===   "#"   ||   S   [   B   ]   ===   "#"   ||   S   [   D   -   2   ]   ===   "#"   ||   S   [   D   ]   ===   "#"   )   &&   flag   ===   false   )
    {
        // If the complex condition is met, output "No".
        console.log   (   "No"   )   ;
    }
    else
    {
        // Otherwise, output "Yes".
        console.log   (   "Yes"   )   ;
    }
}   )   ;