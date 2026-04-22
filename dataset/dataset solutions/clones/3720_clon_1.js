/*
 * This JavaScript code processes a given input string.
 * The entire input data is passed into the 'input' parameter of the Main function.
 */
function Main ( input ) {

    // The original intent was to split by newline, but this version splits by character.
    // The first line would be input[0], second line input[1], etc. if split by newline.
    // However, the current implementation treats each character as an individual item.
    // input = input.split("\n"); // This line is commented out in the original.

    // Initialize the answer variable.
    // It will store the cumulative count based on character processing.
    ans  =  0 ;

    // Convert the entire input string into an array of individual characters.
    input  =  input . split ( "" ) ;

    // Iterate over each character in the now-split input array.
    input . forEach ( function ( i )  {

        // Check if the current character is a hyphen.
        if  ( i  ===  '-' )  {
            // If it's a hyphen, decrement the answer.
            ans -- ;
        }
        else
        {
            // For any other character, increment the answer.
            ans ++ ;
        }
    } ) ;

    // Output section:
    // Print the final calculated answer, followed by a newline character.
    console . log ( ans  +  ""  +  '\n' ) ;

}

// Invoke the Main function.
// It reads the entire content of standard input synchronously as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// This line is a commented-out alternative for reading from a local file.
// Main( require ( 'fs' ) . readFileSync ( './input.txt' , 'utf-8' ) ) ;