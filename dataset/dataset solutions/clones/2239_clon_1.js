/* This is a JavaScript program designed to solve a specific problem.
 * It primarily consists of two functions: 'Main' for core logic,
 * and 'debug' for testing purposes within a browser environment.
 */

function Main( input ) {

    // Process the raw input string by splitting it into lines.
    input = input.split( "\n" );

    // Parse the first line of input to get the number of elements, N.
    var N = parseInt( input[0] );

    // Remove the first line (N) from the input array as it's already processed.
    input.shift();

    /* The problem statement implies that we only need N lines following the
     * initial N value. This line effectively truncates the input array
     * to only contain the relevant N data lines.
     */
    input.splice( N, input.length );

    // Map the remaining input lines into a 2D array of integers.
    // Each line is split by space, and then each part is parsed as an integer.
    var X = input.map( i => i.split( " " ).map( i => parseInt( i ) ) );


    // Sort the array X based on the first element of each inner array (X[i][0]).
    // This is a standard ascending sort.
    X.sort( function ( a, b ) {
        return a[0] - b[0];
    } );

    // Initialize the answer variable. It typically starts at 1 for counting segments.
    var ans = 1;

    // Initialize 'xx' with the sum of the first element's components.
    // This represents the current 'rightmost' boundary or maximum reach.
    var xx = X[0][0] + X[0][1];

    /* Iterate through the sorted array X, starting from the second element.
     * The loop runs N-1 times.
     */
    for ( var i = 1; i < N; i++ ) {

        // Check if the current segment overlaps or can be merged with the previous one.
        // The condition `xx > X[i][0] - X[i][1]` determines if there's an overlap.
        if ( xx > X[i][0] - X[i][1] ) {
            // If there's an overlap, update 'xx' to be the minimum of its current value
            // and the potential new 'rightmost' boundary of the current segment.
            xx = Math.min( xx, X[i][0] + X[i][1] );
        } else {
            // If there's no overlap, it means a new segment must be counted.
            // Increment the answer count.
            ans++;
            // Set 'xx' to the new 'rightmost' boundary of this new segment.
            xx = X[i][0] + X[i][1];
        }

    } // End of the main processing loop.

    // Output the final answer to the console.
    console.log( '%s', ans );

    // The function also returns the calculated answer.
    return ans;

} // End of Main function definition.


/*
 * This 'debug' function is provided for local testing, typically in a browser environment.
 * It retrieves input from HTML elements, runs the Main function, and displays results.
 */
function debug( n ) {

    // Get the input string from a textarea or input field identified by "input"+n.
    var input = document.getElementById( "input" + n ).value;

    // Call the Main function with the retrieved input.
    var ans = Main( input );

    // Initialize the result status. Assume "Wrong Answer" initially.
    var result = "WA";

    // Compare the calculated answer with the expected output from "output"+n element.
    if ( ans == document.getElementById( "output" + n ).value.split( "\n" )[0] ) {
        // If they match, set the result to "Accepted".
        result = "AC";
    }

    // Display the result status in an HTML element identified by "result"+n.
    document.getElementById( "result" + n ).innerHTML = result;

} // End of debug function.

// This is the entry point for execution when run in an environment like Node.js.
// It reads input from standard input and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );