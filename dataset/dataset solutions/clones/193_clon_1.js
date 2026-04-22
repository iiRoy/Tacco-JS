/*
 * This JavaScript file processes input from /dev/stdin.
 * It reads a list of numbers, determines a boxing weight class for each,
 * and then prints the corresponding weight class.
 */

// Import the 'fs' module for file system operations.
var    input     =  require('fs')   .   readFileSync   (   '/dev/stdin'   ,    'utf8'   )    ;

// Process the input string:
// 1. Trim leading/trailing whitespace.
// 2. Split into an array of strings by newline.
// 3. Convert each string to a Number.
var Arr = (  input.trim()  )  .  split("\n")  .  map(Number)  ;


/*
 * Iterate over each numerical value 'v' in the 'Arr' array.
 * For each value, determine its boxing weight class.
 */
Arr.forEach( function (v) {

    // Initialize an empty string to hold the determined weight class.
    var     str      =  ""  ;

    // Define an array 'k' containing the names of boxing weight classes.
    var k = "light fly,fly,bantam,feather,light,light welter,welter,light middle,middle,light heavy,heavy".split(",");

    // Series of conditional statements to assign the correct weight class based on 'v'.
    // Note: This uses a series of 'if' statements, not 'if-else if',
    // which means the last true condition will set 'str'.
    // This logic implicitly assumes the conditions are ordered correctly
    // from lowest to highest threshold to achieve the desired outcome.

    if (   v   <=   48   )
        str   =   k   [   0   ]   ; // Light Flyweight

    if (   v   >   48   )
        str   =   k   [   1   ]   ; // Flyweight

    if (   v   >   51   )
        str   =   k   [   2   ]   ; // Bantamweight

    if (   v   >   54   )
        str   =   k   [   3   ]   ; // Featherweight

    if (   v   >   57   )
        str   =   k   [   4   ]   ; // Lightweight

    if (   v   >   60   )
        str   =   k   [   5   ]   ; // Light Welterweight

    if (   v   >   64   )
        str   =   k   [   6   ]   ; // Welterweight

    if (   v   >   69   )
        str   =   k   [   7   ]   ; // Light Middleweight

    if (   v   >   75   )
        str   =   k   [   8   ]   ; // Middleweight

    if (   v   >   81   )
        str   =   k   [   9   ]   ; // Light Heavyweight

    if (   v   >   91   )
        str   =   k   [   10   ]   ; // Heavyweight

    // Output the determined weight class to the console.
    console.log(   str   )   ;

} ) ; // End of forEach loop.

// Script execution complete.