// This function calculates combinations of digits that sum up to a target value.
// It uses a recursive backtracking approach.
function calc( prev, _i, n, s, depth ) {
    // prev: The sum accumulated so far in the current path.
    // _i: The starting digit for the current level of recursion (to ensure digits are increasing).
    // n: The total number of digits required in the combination.
    // s: The target sum to achieve.
    // depth: The current number of digits chosen so far (recursion depth).

    // Base case: If we have selected 'n' digits (depth equals n - 1 for 0-indexed depth).
    if ( n - 1 === depth ) {
        // Check if the last digit (_i) can complete the sum 's'.
        // The remaining value needed is 's - prev'.
        // Also, ensure this remaining value is a single digit (0-9) and is greater than or equal to '_i'.
        if ( _i <= s - prev && s - prev <= 9 ) {
            return ( 1 ); // Found a valid combination.
        }

        return ( 0 ); // No valid combination found for this path.
    }

    // Initialize a variable to store the total number of combinations found.
    var ans = 0;

    // Iterate through possible digits for the current position, starting from '_i' up to 9.
    for ( var i = _i; i <= 9; i++ ) {
        // Pruning step: If adding the current digit 'i' would exceed the target sum 's',
        // then any subsequent digits (which would be larger) will also exceed 's'.
        // So, we can break out of the loop early.
        if ( prev + i > s )
            break;

        // Recursive call:
        // - Add 'i' to the 'prev' sum.
        // - Increment the starting digit for the next level to 'i + 1' (for strictly increasing digits).
        // - Increment the recursion depth.
        ans += calc( prev + i, i + 1, n, s, depth + 1 );
    }

    // Return the accumulated count of combinations.
    return ( ans );
}


// This block handles the main program logic, including input processing and output.
Main( function( input ) {
    // The 'input' parameter contains the entire content read from standard input.

    // Split the input string into individual lines, after trimming any leading/trailing whitespace.
    input.trim().split( '\n' ).forEach( function( line ) {
        // For each line, split it by space to get the two numbers 'n' and 's'.
        var tmp = line.split( ' ' );

        // Extract 'n' (number of digits) and 's' (target sum) from the split array.
        var n = tmp[0];
        var s = tmp[1];

        // Check for the termination condition: '0 0'.
        if ( n === '0' && s === '0' ) {
            return; // If found, stop processing further lines and exit the forEach loop.
        }

        // Convert 'n' and 's' from strings to numbers using the unary plus operator.
        // Call the 'calc' function with initial parameters:
        //   - prev: 0 (initial sum)
        //   - _i: 0 (starting digit for the first position)
        //   - n: +n (converted number of digits)
        //   - s: +s (converted target sum)
        //   - depth: 0 (initial recursion depth)
        // Then, print the result of the calculation to the console.
        console.log( calc( 0, 0, +n, +s, 0 ) );
    } );
} );


// Utility function to manage standard input for Node.js environments.
// This function wraps the main logic, providing it with the complete input string.
function Main( main ) {
    // Initialize an empty string to accumulate all incoming data chunks.
    var input = '';

    // Resume the standard input stream to start listening for data.
    process.stdin.resume();

    // Set the character encoding for the input stream to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Attach an event listener for 'data' events on the standard input stream.
    // Each time a chunk of data is received, append it to the 'input' string.
    process.stdin.on( 'data', function( chunk ) {
        input += chunk;
    } );

    // Attach an event listener for the 'end' event on the standard input stream.
    // This event fires when all input has been received.
    // At this point, call the 'main' callback function, passing the complete accumulated 'input' string.
    process.stdin.on( 'end', function() {
        main( input );
    } );
};