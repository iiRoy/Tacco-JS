// This JavaScript program implements a simple Caesar cipher.
// The main function processes the input provided to it.
function   main ( input ) {

    // The first element of the input array is expected to be a number.
    // It determines the shift value for the Caesar cipher.
    // Subtracting 0 ensures it's treated as a number.
    var   n   =   input [ 0 ] - 0   ;


    // The second element of the input is the string to be encrypted.
    // This string is first split into individual characters.
    // Then, each character is transformed using the map function.
    var   line   =   input [ 1 ] . split ( "" ) . map (   v   =>   {

            // Get the ASCII value of the character.
            // Subtract 65 (ASCII for 'A') to get a 0-25 index.
            // Add the shift 'n'.
            // Use modulo 26 to wrap around the alphabet (A-Z).
            // Add 65 back to convert the 0-25 index back to an ASCII character code.
            return   String . fromCharCode ( ( ( v . charCodeAt ( ) - 65 ) + n ) % 26 + 65 )   ;

        }
    ) ; // The 'line' array now contains the encrypted characters.


    // Finally, join all the encrypted characters back into a single string
    // and print it to the standard output.
    console . log ( line . join ( "" ) ) ;

} // End of the main function definition.


// This section handles reading input and initiating the program.
// It reads the entire content from '/dev/stdin' as a UTF-8 string.
// Any leading/trailing whitespace is removed using 'trim()'.
// The content is then split into an array of strings by newline characters.
// This processed input array is passed to the 'main' function for execution.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" )   ) ;