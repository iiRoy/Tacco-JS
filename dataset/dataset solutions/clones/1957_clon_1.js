/*
 * This script processes a numerical input.
 * It reads a single integer value from standard input,
 * interprets it as a radius, and then calculates its circumference.
 *
 * The circumference is computed using the formula: 2 * PI * Radius.
 * The result is then printed to the console.
 */

// Declare a variable 'R' to hold the radius value.
// The input is read from '/dev/stdin', parsed as an integer.
var   R     =     parseInt    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;

// Output the calculated circumference to the standard output.
// Math.PI provides the value of Pi.
console    .    log    (    R    *    Math.PI    *    2    )    ;

// --- End of script execution ---