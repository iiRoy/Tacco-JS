process . stdin . resume ( ) ; // Resume the standard input stream. This is necessary to keep the Node.js process alive.

/*
 * Set the character encoding for the standard input stream.
 * 'utf8' is a common and robust choice for handling various text inputs.
 */
process . stdin . setEncoding ( "utf8" ) ;

// Initialize the readline interface to handle input line by line.
const reader = require ( "readline" ) . createInterface ( {
    input : process . stdin ,  // Use standard input as the source for reading lines.
    output : process . stdout , // Use standard output for potential prompts (though not used in this specific script).
} ) ;

// An array to store all input lines read from the standard input.
const lines = [ ] ;

// Event listener: This function is called every time a new line of input is received.
reader . on ( "line" , ( line ) => {
    // Push the current line into the 'lines' array for later processing.
    lines . push ( line ) ;
} ) ;


// Event listener: This function is executed when the input stream ends (e.g., user presses Ctrl+D or input pipe closes).
reader . on ( "close" , ( ) => {
    // Parse the first line of input. It's expected to contain six numbers representing the initial dice faces.
    // The numbers are space-separated, converted to actual numbers using map(Number).
    let [ top , back , right , left , front , bottom ] = lines [ 0 ] . split ( " " ) . map ( Number ) ;

    // The second line of input contains the sequence of rotation commands (e.g., "NESW").
    const rs = lines [ 1 ] ;

    // Loop through each character in the rotation sequence.
    for ( let i = 0 ; i < rs . length ; i ++ ) {
        // Use a switch statement to handle different rotation commands.
        switch ( rs [ i ] ) {
            case "N" : // North rotation:
                // The faces rotate as follows: top -> front, front -> bottom, bottom -> back, back -> top.
                // This is achieved by simultaneously reassigning values using array destructuring.
                [ top , front , bottom , back ] = [ back , top , front , bottom ] ;
                break ; // Exit the switch statement after handling 'N'.

            case "S" : // South rotation:
                // The faces rotate as follows: top -> back, back -> bottom, bottom -> front, front -> top.
                [ top , front , bottom , back ] = [ front , bottom , back , top ] ;
                break ; // Exit the switch statement after handling 'S'.

            case "W" : // West rotation:
                // The faces rotate as follows: top -> right, right -> bottom, bottom -> left, left -> top.
                [ top , left , bottom , right ] = [ right , top , left , bottom ] ;
                break ; // Exit the switch statement after handling 'W'.

            case "E" : // East rotation:
                // The faces rotate as follows: top -> left, left -> bottom, bottom -> right, right -> top.
                [ top , left , bottom , right ] = [ left , bottom , right , top ] ;
                break ; // Exit the switch statement after handling 'E'.
        }
    }

    // After all rotations are applied, print the final value of the 'top' face to the console.
    console . log ( top ) ;
} ) ;

// This marks the end of the script's main logic.