/*
 * This JavaScript function, named 'Main', serves as the primary entry point
 * for processing a given input string. It is designed to parse numerical data
 * from the input and perform calculations based on specific conditions.
 *
 * Parameters:
 *   input: A string which is expected to contain numerical data, typically
 *          read from a standard input stream or a file. The format is assumed
 *          to be two space-separated integers on the first line.
 */
function    Main    (    input    )
{
    // First, the input string is split into an array of strings,
    // where each element corresponds to a line from the original input.
    input    =    input.split(    "\n"    )    ;

    // The first line of the input (input[0]) contains two numbers.
    // We split this line by space to get an array of two number-strings.
    // The first element of this array is assigned to 'N'.
    // The '- 0' operation is a concise way to convert the string to a number.
    var    N    =    input[0].split(    " "    )[0]    -    0    ;

    // Similarly, the second element from the first line is assigned to 'M'.
    // This also undergoes string-to-number conversion.
    var    M    =    input[0].split(    " "    )[1]    -    0    ;

    // --- Conditional Logic Block ---
    // This 'if' statement checks a primary condition: if twice the value of N
    // is greater than or equal to the value of M.
    if    (    N    *    2    >=    M    )
    {
        // If the condition N * 2 >= M is true, the program calculates M / 2,
        // floors the result (rounds down to the nearest integer), and prints it to the console.
        console.log(    Math.floor(    M    /    2    )    )    ;
        // After printing, the function immediately terminates using 'return'.
        return    ;
    }

    // --- Alternative Calculation ---
    // If the 'if' condition (N * 2 >= M) evaluates to false,
    // this block of code is executed. It performs a different calculation:
    // N plus the floored result of (M minus twice N), all divided by 4.
    // This result is then printed to the console.
    console.log(    N    +    Math.floor(    (    M    -    N    *    2    )    /    4    )    )    ;

} // End of the 'Main' function definition.


/*
 *  ATTENTION: The following lines of code are crucial for standard input/output handling.
 *  Please DO NOT modify this section in any way.
 *  It reads the entire content of standard input synchronously and then
 *  invokes the 'Main' function with the read content as its argument.
 */
Main(    require( "fs" ).readFileSync( "/dev/stdin",    "utf8" )    )    ;