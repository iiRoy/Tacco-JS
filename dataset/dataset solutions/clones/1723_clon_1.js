// This JavaScript code calculates the Hamming distance between the first two lines of input.
// It reads input from standard input, processes it, and prints the result to the console.

function   main   (   input   )
{

    // The main function receives the entire input as a single string.
    // First, we split the input string into an array of lines based on the newline character.
    input   =   input.split (   '\n'   ) ;

    // Initialize a variable to store the count of differing characters.
    // This variable will hold our final result.
    var   result   =   0   ;

    // Loop through the characters of the first line (input[0]).
    // We assume that the second line (input[1]) is at least as long as the first,
    // or we only care about differences up to the length of the first line.
    for   (   i   =   0   ;   i   <   input [ 0 ] . length   ;   i ++   )
    {

        // Compare the character at the current index 'i' in the first line
        // with the character at the same index 'i' in the second line.
        // We use slice(i, i+1) to get a single character at index 'i'.
        if   (   input [ 0 ] . slice (   i ,   i + 1   )   !=   input [ 1 ] . slice (   i ,   i + 1   )   )
        {
            // If the characters are not identical, increment our 'result' counter.
            result   =   result   +   1   ;
        }

    } // End of the for loop.


    // After comparing all characters, print the final 'result' to the console.
    console.log   (   result   )   ;

} // End of the main function definition.


// This is the entry point for executing the script.
// It reads the entire content of standard input synchronously,
// using Node.js's 'fs' module, and then passes it to the 'main' function.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8"   )   ) ;