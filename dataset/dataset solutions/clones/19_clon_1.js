/*
 * This is a Type I clone generated from the original JavaScript code.
 *
 * According to the definition, only whitespace and comments are allowed to change.
 * All identifiers, keywords, operators, and expressions are preserved exactly as they were.
 * The goal is to make the code look visually different while maintaining
 * identical functionality and structure.
 */

var    sample_input    =    require (   'fs'   ) . readFileSync (    '/dev/stdin'   ,   'utf8'   )   ; // Reads the entire content of standard input as a UTF-8 string.

// Trims leading/trailing whitespace from the input and splits it into an array of strings,
// where each string represents a set of coefficients for a linear equation.
var coefficient_sets = (  sample_input . trim (  )  ) . split (  "\n"  )  ;


// Iterates over each individual set of coefficients obtained from the input.
coefficient_sets
  . forEach (   function (   coefficient_set   )   { // Start of the processing function for each coefficient set.

    // Splits the current coefficient set string by spaces and converts each part to a number.
    var   coefficients   =   coefficient_set . split (  " "  ) . map (  Number  )   ;

    // Assigns the numeric coefficients to individual variables for clarity.
    // These correspond to a system of two linear equations:
    // ax + by = c
    // dx + ey = f
    var a = coefficients[0]; // Coefficient 'a' from the input.
    var b = coefficients[1]; // Coefficient 'b' from the input.

    var c = coefficients[2]; // Constant 'c' from the input.

    var d = coefficients[3]; // Coefficient 'd' from the input.

    var e = coefficients[4]; // Coefficient 'e' from the input.
    var f = coefficients[5]; // Constant 'f' from the input.

    // Declare variables to hold the solutions for x and y.
    var x;
    var y;

    // The original comment indicated the form of the equation being solved.
    // This is the formula for 'x' derived from Cramer's Rule or substitution
    // for the system: ax + by = c, dx + ey = f.
    // Specifically, x = (c*e - f*b) / (a*e - d*b)
    var    x    =    (   c * e    -    f * b   )    /    (   e * a    -    d * b   )   ;   // Calculation of the x-coordinate.

    // Calculates the value of 'y' using the first equation (ax + by = c),
    // rearranged as y = (c - a*x) / b.
    var y = (  c - a * x  ) / b; // Calculation of the y-coordinate.

    // Outputs the calculated x and y values to the console, separated by a single space.
    console . log (   [   x   ,   y   ] . join (   " "   )   )   ; // Displays the solution pair.
  }   )   ; // End of the forEach loop for processing coefficient sets.