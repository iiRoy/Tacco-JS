function Main( input )
{
    // This is the main function that processes the input.
    // It is designed to solve a specific algorithmic problem.

    // First, remove any leading or trailing whitespace from the input string.
    input = input.trim( );

    // Parse the length from the first line of the input.
    // The input is split by newline, and the first part is taken.
    var len = parseInt( input.split( "\n" )[0] );

    // Process the list of numbers from the second line of the input.
    // The second line is split by spaces, and each part is converted to a Number.
    var list = input.split( "\n" )[1].split( " " ).map( ( list ) => Number( list ) );

    // Initialize the output string to "Yes". This will be changed to "No" if conditions are not met.
    var output = "Yes";

    // Initialize counters for numbers divisible by 4 and numbers divisible by 2 but not by 4.
    var four = 0; /* This variable counts numbers that are multiples of 4. */
    var two = 0;  // This variable counts numbers that are multiples of 2 but not multiples of 4.

    // Iterate through the list of numbers to categorize them.
    for ( var i = 0 ; i < list.length ; i++ )
    {
        // Check if the current number is a multiple of 2 but not a multiple of 4.
        if ( list[i] % 2 == 0 && list[i] % 4 != 0 )
        {
            two++; // Increment the counter for 'two'
        }
        // Otherwise, check if the current number is a multiple of 4.
        else if ( list[i] % 4 == 0 )
        {
            four++; // Increment the counter for 'four'
        }
    }

    /*
     * The following commented lines were used for debugging purposes.
     * They print the counts of multiples of 2 and 4.
     */
    // console.log("Count of multiples of 2 (but not 4): " + two);
    // console.log("Count of multiples of 4: " + four);


    /*
     * The core logic to determine the output.
     * We need at least Math.floor(len / 2) numbers that are multiples of 4.
     * If not enough 4's multiples, we can use 2's multiples (where one 2-multiple
     * can substitute for half a 4-multiple, effectively needing two 2-multiples
     * for each missing 4-multiple slot).
     */
    if ( Math.floor( len / 2 ) > four )
    {
        // Calculate the deficit of multiples of 4.
        var husoku = Math.floor( len / 2 ) - four;

        // If the deficit, when doubled, is greater than the available multiples of 2,
        // then we cannot satisfy the condition.
        if ( husoku * 2 > two )
        {
            output = "No"; // Set output to "No".
        }
        else
        {
            // If we have enough 2's multiples to cover the deficit,
            // the condition is still met.
            /* This comment indicates that 2's multiples were used to achieve a "Yes" output. */
            // console.log("Used multiples of 2 to achieve Yes.");
        }
    }
    else
    {
        // If there are enough (or more than enough) multiples of 4, the condition is met.
        // No need to check multiples of 2.
        /* This comment indicates that multiples of 4 alone were sufficient for a "Yes" output. */
        // console.log("Multiples of 4 alone were sufficient for Yes.");
    }

    // Print the final result to the console.
    console.log( output );
}

// Call the Main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );