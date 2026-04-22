/*
 * This JavaScript file calculates the area and circumference of a circle.
 * It reads the radius from standard input and outputs the results.
 *
 * This version includes extensive whitespace and comments
 * to illustrate a Type I code clone.
 */


// --- Start of Main Program Logic ---


// Declare and initialize the variable 'r' which will store the radius.
// The radius is obtained by reading from standard input ('/dev/stdin').
// The 'fs' module is used for file system operations.
// The input content is read as 'ascii' and then converted to a numerical type.
r   =   Number  (
                    require (   'fs'    )
                        .   readFileSync    (
                                                '/dev/stdin'    ,
                                                'ascii'
                                            )
                )   ;


// A blank line for improved readability and visual separation.


/*
 * The following line calculates and outputs two values:
 * 1. The area of the circle (π * r * r).
 * 2. The circumference of the circle (2 * π * r).
 * Both results are formatted to six decimal places using the toFixed(6) method.
 * The 'console.log' function is used to print these values to the console.
 */
console .   log (
                                    (   Math    .   PI  *   r   *   r   )   .   toFixed (   6   )   ,
                                    (   2.0 *   Math    .   PI  *   r   )   .   toFixed (   6   )
            )   ;


// --- End of Main Program Logic ---