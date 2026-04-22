/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications in whitespace and comments
 * while preserving the exact logical and structural identity
 * of the original program.
 */

// Define the primary function responsible for processing the input data.
function Main (   input   )
{
    // The input string is first processed through a pipeline:
    // 1.   `trim()`: Removes any leading or trailing whitespace.
    // 2.   `split("\n")`: Divides the string into an array of lines based on newline characters.
    // 3.   `map((list) => Number(list))`: Converts each line (which is a string) into a number.
    input = input . trim ( ) . split ( "\n" ) . map ( ( list ) => Number ( list ) ) ;

    // Extract the numerical values from the processed input array.
    // N is assigned the first element of the array.
    var N = input [ 0 ] ;

    // H is assigned the second element of the array.
    var H = input [ 1 ] ;

    // W is assigned the third element of the array.
    var W = input [ 2 ] ;

    // Calculate the final result using the specific formula:
    // (N - H + 1) multiplied by (N - W + 1).
    // The result is then printed to the standard output using `console.log`.
    console . log ( ( N   -   H   +   1 )   *   ( N   -   W   +   1 ) ) ;
}


// This section handles the execution of the program.
// It reads the input from standard input using Node.js's `fs` module,
// specifically `readFileSync` to get the content of `/dev/stdin` as a UTF-8 string.
// The retrieved content is then passed as an argument to the `Main` function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * End of the cloned JavaScript program.
 * All variable names, function names, operators, and expressions
 * remain precisely as in the original code.
 */