/*
 * This function serves as the primary entry point for processing input data.
 * The 'input' parameter is expected to contain the entire raw input string
 * provided to the program, typically from standard input.
 */
function Main(  input  )
{
    // The input string is first split into an array of individual lines.
    var line = input.split("\n");

    // The first line of input (index 0) is parsed as the integer 'N'.
    var N = Number( line[0] );


    // The second line of input (index 1) is split by spaces.
    // These parts are then parsed as 'days' and 'rest'.
    var tmp = line[1].split(" ");

    var days = Number( tmp[0] ); // Represents a certain number of days.
    var rest = Number( tmp[1] ); // Represents an initial 'rest' value.


    // An empty array 'A' is declared; it will be populated with data from subsequent lines.
    var A = [];

    // This loop iterates through the input lines, starting from the third line (index 2).
    // It continues up to 'N+2' to read 'N' additional data points.
    for ( var i = 2;   i < N + 2;   i++ )
    {
        // Each relevant line is converted to a number and stored in array 'A'.
        // The index is adjusted (i-2) to make 'A' zero-indexed.
        A[i - 2] = Number( line[i] );
    }


    // The variable 'ans' (answer) is initialized with the 'rest' value.
    var ans = rest;

    // A second loop iterates through each element of the array 'A'.
    for ( var j = 0;   j < A.length;   j++ )
    {
        // The 'ans' variable is updated by adding a calculated value.
        // This calculation involves 'days', '1', and the current element A[j].
        ans += 1 + Math.floor( ( days - 1 ) / A[j] );
    }


    // Finally, the calculated 'ans' is printed to the console.
    console.log( ans );

} // End of the Main function definition.


/*
 * The following block of code is crucial for execution within typical
 * competitive programming environments. It reads all data from standard
 * input, converts it to a UTF-8 string, and then passes it to the 'Main'
 * function.
 *
 * PLEASE DO NOT MODIFY THIS PART OF THE CODE. It handles the standard
 * input/output mechanism.
 */
Main( require("fs").readFileSync("/dev/stdin", "utf8") );