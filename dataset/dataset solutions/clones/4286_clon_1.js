/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, performs calculations, and prints a result.
 * The main logic is encapsulated within the 'Main' function.
 */
function Main(  input   )
{

    // Split the input string by newline characters to get an array of lines.
    input =   input . split (   "\n"   )   ;

    /*
     * Calculate 'n' based on the first line of input.
     * It uses Math.pow to raise 3 to the power of the first input value.
     */
    var   n   =   Math . pow (   3   ,   input [   0   ]   )   ;

    // Initialize 'sum' variable to 1. This will be used in a later calculation.
    var sum =   1   ;

    // Process the second line of input:
    // 1. Split it by spaces.
    // 2. Convert each resulting string part to a Number.
    var   arr   =   input   [   1   ]   .   split   (   " "   )   .   map   (   Number   )   ;

    // Iterate over the 'arr' array.
    // For each value, if it's even, multiply 'sum' by 2.
    arr . forEach (
        function (   val   )
        {
            if   (   val   %   2   ==   0   )
            {
                sum   *=   2   ;   // Multiply sum by 2 if 'val' is even.
            }
        }
    )   ;

    // Finally, print the result of 'n' minus 'sum' to the console.
    console . log (   n   -   sum   )   ;

}

// This section handles reading input from standard input and calling the Main function.
// It uses Node.js 'fs' module to read the file, converts it to UTF-8, and trims whitespace.
Main   (
    require   (   "fs"   )   .   readFileSync   (
        "/dev/stdin"   ,
        "utf8"
    )   .   trim   (   )
)   ;