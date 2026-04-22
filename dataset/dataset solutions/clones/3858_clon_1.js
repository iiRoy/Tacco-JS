/*
 * This JavaScript file defines a primary function, 'Main',
 * which processes a numerical input to generate a formatted
 * string output. The output consists of selected elements
 * from a predefined integer array, separated by spaces.
 *
 * This code demonstrates basic array manipulation, loop structures,
 * and input/output operations in Node.js environment.
 */

// The main function that takes a single argument 'input'.
// The 'input' is expected to be a string that can be converted to an integer.
function Main( input )
{

    // Convert the input parameter to an integer.
    // The bitwise OR 0 is a common and concise way to coerce a value to a 32-bit integer.
    input |= 0;


    // Declare and initialize an array named 'arr' with a fixed set of integer values.
    // This array serves as the data source for the output generation.
    var arr = [
        11,   31,   41,   61,   71,
        101,  131,  151,  181,  191,
        211,  241,  251,  271,  281,
        311,  331,  401,  421,  431,
        461,  491,  521,  541,  571,
        601,  631,  641,  661,  691,
        701,  751,  761,  811,  821,
        881,  911,  941,  971,  991,
        1021, 1031, 1051, 1061, 1091,
        1151, 1171, 1181, 1201, 1231,
        1291, 1301, 1321, 1361, 1381
    ];


    // Initialize an empty string variable 'ans' which will accumulate the result.
    var ans = "";


    // Loop through the 'arr' array. The loop runs 'input - 1' times.
    // For each iteration, an element from 'arr' is appended to 'ans', followed by a space.
    // The loop counter 'i' is also explicitly cast to an integer in each increment step.
    for ( var i = 0; i < input - 1; i = ( i + 1 ) | 0 )
    {
        ans += arr[i] + " "; // Concatenate the array element and a space.
    }


    // After the loop, append the very last element to 'ans'.
    // This element corresponds to the index 'i' which is now equal to 'input - 1'.
    // No trailing space is added after this final element.
    ans += arr[i];


    // Output the final constructed string to the standard console.
    console.log( ans );

}


// This line is responsible for invoking the 'Main' function.
// It reads data from standard input (typically /dev/stdin in a Unix-like environment).
// The 'fs' module is used for file system operations, and 'readFileSync' reads the entire file synchronously.
// The input is read as a UTF-8 encoded string.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );