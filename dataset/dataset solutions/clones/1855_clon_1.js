/*
 * This JavaScript file defines a main function that processes input.
 * It appears to contain a large block of commented-out code
 * which outlines a geometric calculation involving angles and distances.
 *
 * The currently active part of the code simply outputs a specific floating-point number.
 *
 * This file demonstrates a basic structure for a JavaScript program,
 * including function definition and calling external modules.
 *
 * Original purpose of commented code: Unknown, possibly a coding challenge solution.
 * Current active purpose: Output a constant numerical value.
 */

// Define the primary function that serves as the entry point for the script.
function    main (    input    )    {

    /*
     * This entire multi-line comment block contains code that has been
     * completely commented out in the original source.
     *
     * It describes a sequence of operations:
     *
     * 1.  Input parsing:
     *     -   `input = input.trim();` : Removes leading/trailing whitespace.
     *     -   `var list = input.split(" ");` : Splits the input string into an array of strings.
     *     -   `var jHari = parseInt(list[0]);` : Parses the first element as an integer.
     *     -   `var fHari = parseInt(list[1]);` : Parses the second element as an integer.
     *     -   `var ji = parseInt(list[2]);` : Parses the third element as an integer.
     *     -   `var fun = parseInt(list[3]);` : Parses the fourth element as an integer.
     *     -   `console.log([jHari,fHari,ji,fun]);` : Debugging output for the parsed values.
     *
     * 2.  Helper function for angle conversion:
     *     -   `function deg(deg){ return(deg*Math.PI/180); }` : Converts degrees to radians.
     *
     * 3.  Position calculations:
     *     -   `var posJ = [Math.cos(deg(ji*30))*jHari, Math.sin(deg(ji*30))*jHari];` : Calculates X, Y coordinates for 'J'.
     *     -   `var posF = [Math.cos(deg(fun*6))*fHari, Math.sin(deg(fun*6))*fHari];` : Calculates X, Y coordinates for 'F'.
     *         These calculations likely represent points on a circle, where `jHari` and `fHari` are radii,
     *         and `ji*30` and `fun*6` are angles in degrees (e.g., clock hands).
     *
     * 4.  Helper function for distance calculation:
     *     -   `function kyori(ax,ay,bx,by){ return(Math.sqrt((ax-bx)**2+(ay-by)**2)); }` :
     *         Calculates the Euclidean distance between two points (ax, ay) and (bx, by).
     *         `kyori` is Japanese for distance.
     *
     * 5.  Final result computation and output (still commented):
     *     -   `var answer = kyori(posJ[0],posJ[1],posF[0],posF[1]);` : Computes the distance between the two calculated points.
     *     -   `console.log(answer.toString());` : Prints the calculated distance as a string.
     *
     * This entire block is kept verbatim in terms of its code content,
     * with only comment text and whitespace within this comment block modified.
     */
    // This is the only active line of code within the 'main' function.
    console . log ( 5.000000000000001 ) ;

} // End of the main function definition.


// Execute the main function, providing input read from standard input.
// The `require("fs").readFileSync("/dev/stdin","utf8")` part reads the
// entire content of the standard input stream as a UTF-8 encoded string.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;