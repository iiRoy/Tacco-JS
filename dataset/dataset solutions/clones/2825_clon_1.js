/*
 * This JavaScript file processes input from standard input.
 * It's designed to solve a specific problem involving geometric calculations.
 * The primary goal is to determine if a point (x, y) lies at the center
 * of a rectangle defined by its width (W) and height (H).
 */

// Define the main function that encapsulates the core logic of the program.
// This function takes a single string 'input' as its argument,
// which is expected to contain all necessary data.
function Main ( input )
{

    // The raw input string is typically multiline.
    // We split it by newline characters to get an array of lines.
    // For this problem, we are interested in the first line.
    input = input . split ( "\n" ) ;


    // The first line of input contains several values separated by spaces.
    // These values represent W, H, x, and y.
    // We split this first line by spaces to obtain an array of string tokens.
    inputStr = input [ 0 ] . split ( " " ) ;


    // Parse the width (W) of the rectangle from the first token.
    var W = Number . parseInt ( inputStr [ 0 ] ) ;

    // Parse the height (H) of the rectangle from the second token.
    var H = Number . parseInt ( inputStr [ 1 ] ) ;

    // Parse the x-coordinate of the point from the third token.
    var x = Number . parseInt ( inputStr [ 2 ] ) ;

    // Parse the y-coordinate of the point from the fourth token.
    var y = Number . parseInt ( inputStr [ 3 ] ) ;


    // Calculate a value 'S'. In many geometry problems, this could represent
    // an area or some other significant metric.
    // Here, it appears to be (W/2) * (H/2), which is one-fourth of the total area.
    var S = ( W / 2 ) * ( H / 2 ) ;


    // Determine if the given point (x, y) is precisely at the center of the rectangle.
    // The center of a rectangle with width W and height H is located at (W/2, H/2).
    // The original comment was: x,yが中心か否か
    if ( x === W / 2 && y === H / 2 )
    {
        // If the point (x, y) is indeed the center,
        // output the calculated value S followed by the flag '1'.
        console . log ( S , 1 ) ;
    }
    else
    {
        // If the point (x, y) is not the center,
        // output the calculated value S followed by the flag '0'.
        console . log ( S , 0 ) ;
    }

} // End of the Main function definition.


// This line is responsible for initiating the program.
// It reads the entire content of standard input (usually from a file like /dev/stdin)
// as a UTF-8 string, and then passes this string to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;