// This JavaScript program computes the area, perimeter, and height of a triangle.
// Input is expected from standard input, following a specific format.

    /*
     * First, we need to read the input data.
     * The 'fs' module is used for file system operations, including reading stdin.
     */
    var     input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' )    ;


// After reading the raw input, it needs to be parsed.
// The input is assumed to be space-separated numbers.
    var     vals    =    input . split ( ' ' ) . map ( function ( n ) {
        // The unary plus operator converts the string 'n' to a number.
        return    + n    ;
    } ) ;


// Assigning the parsed numeric values to distinct variables for clarity.
var    a    =    vals [ 0 ]    ;    // Represents the length of the first side.
var    b    =    vals [ 1 ]    ; /* Represents the length of the second side. */
var    C    =    vals [ 2 ]    ;    // Represents the included angle between sides 'a' and 'b', in degrees.


// --- Core Calculation Logic for Triangle Properties ---

// Calculate the height 'h' of the triangle.
// Formula: h = b * sin(C)
// The angle C must be converted from degrees to radians for Math.sin().
var    h    =    b    *    Math . sin ( C    /    180    *    Math . PI )    ;


// Calculate the area 'S' of the triangle.
// Formula: S = (base * height) / 2
// Here, 'a' is considered the base.
var    S    =    a    *    h    /    2    ;


// Apply the Law of Cosines to find the square of the length of the third side 'c'.
// Formula: c^2 = a^2 + b^2 - 2ab * cos(C)
// Again, C needs to be in radians.
var    c2    =    Math . pow ( a ,    2 )    +    Math . pow ( b ,    2 )    -    2    *    a    *    b    *    Math . cos ( C    /    180    *    Math . PI )    ;


// Calculate the length of the third side 'c' by taking the square root of 'c2'.
var    c    =    Math . sqrt ( c2 )    ;


// --- Outputting the Results ---

// Output the calculated area 'S', formatted to five decimal places.
console . log ( S . toFixed ( 5 ) ) ;

// Output the perimeter of the triangle (sum of all three sides), formatted to five decimal places.
console . log ( ( a    +    b    +    c ) . toFixed ( 5 ) ) ;

// Output the calculated height 'h', also formatted to five decimal places.
console . log ( h . toFixed ( 5 ) ) ;

// End of program execution.