/*
 * This JavaScript function, named 'Main', processes a given input string.
 * It's designed to read coordinate data, perform calculations, and then
 * output a new set of coordinates based on the input.
 * The typical use case involves reading from standard input in competitive programming environments.
 */
function   Main   (  input  )   {

    // The input string is initially split by newline characters.
    // This assumes that each line of input might represent a separate piece of data,
    // though in this particular problem, only the first line is directly used for parsing coordinates.
    input   =   input . split (  "\n"  )   ;

    // Declare and initialize variables for the first pair of coordinates.
    // These are parsed from the first line of the input array.
    // The 'split(" ")' method breaks the line into parts by spaces, and 'parseInt' converts them to integers.
    var   x1   =   parseInt (  input [ 0 ] . split (  " "  ) [ 0 ]  )   ;
    var   y1   =   parseInt (  input [ 0 ] . split (  " "  ) [ 1 ]  )   ;

    // Declare and initialize variables for the second pair of coordinates.
    // These are also parsed from the same first line of input.
    var   x2   =   parseInt (  input [ 0 ] . split (  " "  ) [ 2 ]  )   ;
    var   y2   =   parseInt (  input [ 0 ] . split (  " "  ) [ 3 ]  )   ;

    // Initialize an answer variable.
    // This variable will hold an intermediate value or serve as a placeholder
    // before the final string construction.
    var   ans   =   0   ;

    // Calculate the coordinates for the third point (x3, y3).
    // These calculations represent a specific geometric transformation or pattern.
    // The exact nature of the transformation depends on the problem context.
    var   x3   =   x2   -   (  y2   -   y1  )   ;
    var   y3   =   y2   +   (  x2   -   x1  )   ;

    // Calculate the coordinates for the fourth point (x4, y4).
    // Similar to x3, y3, these are derived from the initial two points.
    var   x4   =   x1   -   (  y2   -   y1  )   ;
    var   y4   =   y1   +   (  x2   -   x1  )   ;

    // Reassign the 'ans' variable to a string containing all calculated coordinates.
    // The coordinates are concatenated with spaces in between, forming the final output string.
    var   ans   =   x3   +   " "   +   y3   +   " "   +   x4   +   " "   +   y4   ;

    // Output the final answer to the console.
    // The '%s' format specifier ensures that the 'ans' variable is treated as a string.
    console . log (  '%s'  ,   ans  )   ;
}

// This is the entry point for executing the 'Main' function.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
// The `require("fs").readFileSync` method is a Node.js specific way to perform synchronous file reading.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;