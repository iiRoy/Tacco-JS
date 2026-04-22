/*
 * This is a JavaScript function designed to process some input data.
 * It calculates a specific answer based on numerical values extracted from the input.
 *
 * This particular implementation demonstrates a Type I code clone,
 * where only whitespace and comments have been altered from the original source.
 */
function     Main   (   input   )
{
    // Declare a variable 'list' to store processed input.
    // The input string is first split by newline characters,
    // and then each resulting string segment is parsed into an integer (base 10).
    var   list    =    input.split   (   "\n"   )   .map   (   s   =>   parseInt   (   s   ,   10   )   )   ;

    // Initialize the 'min' variable.
    // It is assigned the value of the second element in the 'list' array (at index 1).
    var   min    =    list   [   1   ]   ;


    // Declare and initialize 'ans', which will hold the final computed answer.
    var   ans    =    0   ;


    // 'last' is a variable declared and initialized, but not utilized in the core logic.
    // It remains for structural fidelity as per Type I cloning rules.
    var   last    =    10   ;

    // Begin a 'for' loop construct.
    // This loop iterates through a specific range of indices for the 'list' array.
    // The loop counter 'i' starts at 1 and continues as long as 'i' is less than 6.
    for   (   i   =   1   ;   i   <   6   ;   i++   )
    {
        // Inside the loop, a conditional check is performed.
        // It compares the current element of 'list' with the current value of 'min'.
        if   (   list   [   i   ]   <   min   )
        {
            // If the current list element is indeed smaller than 'min',
            // 'min' is updated to this new, smaller value.
            min    =    list   [   i   ]   ;
        }
    }


    // After the loop, the final calculation for 'ans' is performed.
    // This involves arithmetic operations (subtraction, division),
    // a mathematical function (Math.floor for integer division), and addition.
    ans    =    Math.floor   (   (   list   [   0   ]   -   1   )   /   min   )   +   5   ;

    // Finally, the calculated 'ans' is printed to the console.
    console.log   (   ans   )   ;
}


// This segment is responsible for handling the input mechanism.
// It uses Node.js's 'fs' module to synchronously read data from standard input ('/dev/stdin').
// The read data is then passed as the 'input' argument to the 'Main' function for processing.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;