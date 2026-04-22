/*
 * This JavaScript file processes input from standard input.
 * It is designed to solve a specific problem involving sequences of numbers.
 * The input is expected to be several lines, each containing a sequence or
 * metadata for a sequence.
 */
process.stdin.resume(); // Ensure the standard input stream stays open.

process.stdin.setEncoding( 'utf8' ); // Set the character encoding for input to UTF-8.

// Register an event listener for 'data' events on the standard input stream.
// This function will be called whenever new input data is available.

process.stdin.on('data', function ( input ) {
    // Declare a loop counter variable, initialized later.
    var ii;

    // --- Input Processing Section ---

    // Trim leading/trailing whitespace from the entire input and split it into an array of lines.
    var lines = input . trim() . split( "\n" );

    // Iterate through each line of the processed input.
    // The loop variable 'i' will be incremented within the loop body.
    for ( var i = 0 ; i < lines.length ; ++i ) {

        // Declare variables specific to the current dataset being processed.
        var n, end; // 'n' for the count, 'end' for array bounds.
        var dataset; // Stores the numbers of the current sequence.
        var map; // Stores differences between consecutive numbers.

        // Parse the first number from the current line.
        // The 'i++' increments 'i' after using 'lines[i]', preparing for the next line.
        n = parseInt(lines[i++]);

        // If 'n' is 0, it signifies the end of input or a termination condition.
        if ( n === 0 ) {
            break; // Exit the loop if n is zero.
        }

        // Calculate the 'end' index for the 'map' array (n + 1 because map[0] is unused).
        end = n + 1;

        // Initialize the 'map' array with a size of 'end'.
        // This array will store the differences between consecutive elements.
        map = new Array(end);

        // Take the *next* line (as 'i' was incremented above) as the actual dataset.
        // Trim whitespace and split the line by spaces into an array of strings.
        dataset = lines[i] . trim() . split( " " );

        // Populate the 'map' array with the differences.
        // map[k] will store dataset[k] - dataset[k-1].
        for ( ii = 1 ; ii < end ; ++ii ) {
            map[ii] = parseInt(dataset[ii]) - parseInt(dataset[ii-1]);
        }


        // --- Logic to Identify and Output the Missing Element ---

        // Check the first pattern: if the first four differences are all equal.
        if ( map[1] === map[2] && map[2] === map[3] && map[3] === map[4] ) {
            // If they are equal, check if this pattern continues throughout the array.
            for ( ii = 5 ; ii < end ; ++ii ) {
                if ( map[ii] != map[1] ) { // If a difference breaks the pattern,
                    break; // stop checking and identify the position.
                }
            }
            // The element at 'ii' is the one that breaks the sequence.
            console.log(dataset[ii]);
        }
        // Check the second pattern: if differences from index 2 to 4 are equal.
        else if ( map[2] === map[3] && map[3] === map[4] ) {
            // If this pattern holds, the missing element is at index 0.
            console.log(dataset[0]);
        }
        // Check the third pattern: if differences from index 1 to 3 are equal.
        else if ( map[1] === map[2] && map[2] === map[3] ) {
            // If this pattern holds, the missing element is at index 4.
            console.log(dataset[4]);
        }
        // Check the fourth pattern: a specific relation involving dataset elements and map.
        else if ( parseInt(dataset[2]) - parseInt(dataset[0]) === map[3] && map[3] === map[4] ) {
            // If this pattern holds, the missing element is at index 1.
            console.log(dataset[1]);
        }
        // Check the fifth pattern: another specific relation.
        else if ( map[1] === map[2] && map[2] === parseInt(dataset[4]) - parseInt(dataset[2]) ) {
            // If this pattern holds, the missing element is at index 3.
            console.log(dataset[3]);
        }
        // Check the sixth (final) pattern: yet another specific relation.
        else if ( map[1] === parseInt(dataset[3]) - parseInt(dataset[1]) && map[1] === map[4] ) {
            // If this pattern holds, the missing element is at index 2.
            console.log(dataset[2]);
        }
    }
});
/* End of file */