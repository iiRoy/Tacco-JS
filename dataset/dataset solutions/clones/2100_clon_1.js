// This function receives all input data as a single string.
function Main ( input ) {


    // The input string is expected to contain space-separated numbers.
    // Parse the numbers N, A, and B from the input string.
    const N = parseInt( input.split(" ")[0] ); // N is the first value from input
    const A = parseInt( input.split(" ")[1] ); // A is the second value from input
    const B = parseInt( input.split(" ")[2] ); // B is the third value from input


    // Check for a special edge case where A + B is zero.
    // If the sum is zero, the result is always zero, so we can exit early.
    if ( A + B === 0 ) {
        console.log( 0 ); // Output zero to standard output
        return;           // Terminate function execution here
    }


    // Calculate the number of full cycles (r)
    // N is divided by the sum of A and B, and the result is floored to get an integer.
    const r = Math.floor( N / ( A + B ) );


    // Calculate the remaining part (l) after accounting for the full cycles.
    // This is N minus the total amount covered by 'r' full cycles of (A + B).
    const l = N - ( r * ( A + B ) );


    // Declare a variable to store the final answer.
    // Note: 'ans' is implicitly declared as a global variable here, matching the original code's behavior.
    ans;


    // Determine the final answer based on the remainder 'l'.
    if ( l >= A ) {
        // If the remainder 'l' is greater than or equal to 'A',
        // it means we can "take" another full 'A' segment.
        ans = r * A + A;
    } else {
        // Otherwise, if 'l' is less than 'A',
        // we can only add the remainder 'l' itself.
        ans = r * A + l;
    }


    // Output the final calculated answer to the console.
    console.log( ans );

} // End of Main function definition


// ******************************************************************************************
// * DO NOT EDIT THE FOLLOWING SECTION!                                                     *
// * This part is responsible for handling standard input/output operations.                *
// * It reads the entire input from /dev/stdin and then invokes the Main function with it.  *
// * This setup is common in competitive programming environments for JavaScript.           *
// ******************************************************************************************
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );