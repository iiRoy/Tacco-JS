// This function 'Main' processes the entire input data provided.
function Main ( input ) {
    // Helper function to parse a line of space-separated strings.
    var space_strinput = function ( line ) {
        // Remove leading/trailing whitespace, then split by space.
        var arr = line.replace( /(^\s+)|(\s+$)/g, "" ).split( " " );
        // Iterate through the array (no actual change to elements here, could be optimized).
        for ( var i = 0 ; i < arr.length ; ++i ) {
            arr[ i ] = arr[ i ]; // Self-assignment, effectively no-op.
        }
        return arr; // Return array of strings.
    };


    // Another helper function, similar to space_strinput, but converts elements to numbers.
    var space_numinput = function ( line ) {
        // Remove leading/trailing whitespace, then split by space.
        var arr = line.replace( /(^\s+)|(\s+$)/g, "" ).split( " " );
        // Convert each element to a number using the unary plus operator.
        for ( var i = 0 ; i < arr.length ; ++i ) {
            arr[ i ] = +arr[ i ]; // Convert string to number.
        }
        return arr; // Return array of numbers.
    };


    // Simple helper function to get the minimum of two numbers.
    var getmin = function ( a, b ) {
        return a > b ? b : a; // Ternary operator for minimum.
    };

    // Split the entire input string into an array of lines.
    // The first line will be lines[0], second lines[1], and so on.
    lines = input.split( "\n" );

    // Parse the first line to get n and t.
    var l0 = space_numinput( lines[ 0 ] );
    var n = l0[ 0 ]; // Number of elements.
    var t = l0[ 1 ]; // A specific threshold or time value.

    // Parse the second line to get the array 'a'.
    var a = space_numinput( lines[ 1 ] );

    // Initialize variables for profit calculation.
    var rieki = 0; // Stores the maximum profit found so far.
    var rieki_place_count = 0; // Counts how many times the maximum profit occurs.

    // Initialize min and max values from the first element of array 'a'.
    var min = a[ 0 ];
    var max = a[ 0 ]; // 'max' is declared but never used in the original logic. Keeping it as per Type I definition.

    // Loop through the array 'a' to find the maximum profit.
    for ( var i = 0 ; i < n ; ++i ) {
        var val = a[ i ]; // Current value from the array.

        // Check if current profit (val - min) is greater than the maximum profit found.
        if ( val - min > rieki ) {
            rieki = val - min; // Update maximum profit.
            rieki_place_count = 1; // Reset count as a new maximum profit is found.
        }
        // If current profit is equal to the maximum profit.
        else if ( val - min == rieki ) {
            rieki_place_count++; // Increment count for this profit.
        }

        // Update the minimum value encountered so far.
        // This is crucial for calculating future profits.
        min = val < min ? val : min;
    }

    // Output the minimum of 'rieki_place_count' and 't/2' (integer division).
    // This is the final result of the program.
    console.log( getmin( rieki_place_count, Math.floor( t / 2 ) ) );
}

// This section ensures the Main function is called with input from standard input.
// Do not modify any code below this line, as it handles standard input/output.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );