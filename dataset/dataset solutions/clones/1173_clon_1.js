process . stdin . resume ( ) ; // Initializes the standard input stream.


process . stdin . setEncoding ( 'utf8' ) ; // Configures the input stream to use UTF-8 encoding.


/*
 * This block defines the event handler for incoming data chunks from stdin.
 * It processes the input to calculate various properties of a triangle.
 */
process . stdin . on ( 'data' , function ( chunk )
{

    // Declare a variable to store the parsed input values.
    var x = chunk . split ( " " ) ;

    // Parse the three input values (a, b, c) as floating-point numbers.
    a = parseFloat ( x [ 0 ] ) ; // First side length.
    b = parseFloat ( x [ 1 ] ) ; // Second side length.
    c = parseFloat ( x [ 2 ] ) ; // Angle between sides a and b, in degrees.


    // Convert the angle 'c' from degrees to radians for trigonometric functions.
    c_rad = c / 180 * Math . PI ;

    // Calculate the area 's' of the triangle using the formula: 0.5 * a * b * sin(c).
    s = 0.5 * a * b * Math . sin ( c_rad ) ;

    // Calculate the perimeter 'l' of the triangle using the Law of Cosines to find the third side.
    l = a + b + Math . sqrt ( a * a + b * b - 2 * a * b * Math . cos ( c_rad ) ) ;

    // Calculate the height 'h' of the triangle with respect to base 'a' using the area formula: h = 2 * Area / base.
    h = s / a * 2 ;


    // Output the calculated area to the console.
    console . log ( s ) ;

    // Output the calculated perimeter to the console.
    console . log ( l ) ;

    // Output the calculated height to the console.
    console . log ( h ) ;

} ) ; // End of the 'data' event listener function.