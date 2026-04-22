/*
 * This JavaScript program processes numerical input.
 * It's a Type I clone, preserving all logic and identifiers
 * while varying whitespace and comments significantly.
 */

// Definition of the primary function, named 'Main'.
// This function accepts a single argument, 'input', which is expected to be a string.
function  Main ( input )
{
    // The input string is first split into an array of strings based on newline characters.
    // Subsequently, each string element in the resulting array is converted to an integer.
    // The original 'input' variable is then reassigned with this new array of integers.
    input  =  input . split ( "\n" ) . map ( x  =>  parseInt ( x ) ) ;


    // A calculation is performed: 6 minus the first element of the 'input' array,
    // and then minus the second element of the 'input' array.
    // The final result of this calculation is then printed to the console.
    console . log ( 6  -  input [ 0 ]  -  input [ 1 ] ) ;
}


// This section is responsible for invoking the 'Main' function.
// It reads the content of '/dev/stdin' (standard input) using Node.js's 'fs' module.
// The file content is read synchronously and encoded as 'utf8' before being passed
// as an argument to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;