// This script reads input from stdin, processes it, and prints the result to stdout.

var input = ''; // Initialize an empty string to accumulate incoming data.

/*
 * The 'process.stdin' object is a Readable Stream.
 * It represents the standard input for the current Node.js process.
 */
var readable = process.stdin;

// Resume the readable stream to begin receiving data.
readable.resume();

/**
 * Set the encoding for the readable stream.
 * This ensures that data chunks are treated as UTF-8 strings.
 */
readable.setEncoding( 'utf-8' );

// Attach an event listener for the 'data' event.
// This function will be called whenever new data is available from stdin.
readable.on( 'data', function ( chunk ) {
    // Append the received 'chunk' of data to the 'input' string.
    input += chunk;
} );

// Attach an event listener for the 'end' event.
// This function will be called once the entire input stream has ended.
readable.on( 'end', function () {
    // Split the accumulated input string into an array of lines.
    // Each line represents a row of data.
    var data = input.split( "\n" );

    // Get the total number of lines in the input data.
    var len = data.length;

    // Parse the first line to get the dimensions (rows and columns).
    // It's expected to be two space-separated numbers.
    var rc = data[ 0 ] .split ( " " ) .map ( Number );

    // Extract the number of rows (r) from the parsed dimensions.
    var r = rc[ 0 ];

    // Extract the number of columns (c) from the parsed dimensions.
    var c = rc[ 1 ];

    // Initialize an array 't' of size (c + 1) with zeros.
    // This array will store column sums and the total sum of all elements.
    var t = Array ( c + 1 );

    // Populate the 't' array with initial zero values.
    // This loop iterates from 0 up to and including 'c'.
    for ( var i = 0 ; i < c + 1 ; i ++ ) {
        t[ i ] = 0; // Set the current element to zero.
    }

    // Initialize an empty array to store the processed output lines.
    var output = [];

    // Loop through the data lines, starting from the second line (index 1).
    // The first line contains dimensions, subsequent lines contain actual data.
    for ( var index = 1 ; index < len ; index ++ ) {
        // Parse the current line into an array of numbers.
        // Numbers are expected to be space-separated.
        var nums = data[ index ] .split ( ' ' ) .map ( Number );

        // Initialize a variable to calculate the sum of numbers in the current row.
        var sum = 0;

        // Iterate through the numbers in the current row (up to 'c' columns).
        for ( var j = 0 ; j < c ; j ++ ) {
            // Add the current number to the row sum.
            sum += nums[ j ];
            // Add the current number to the corresponding column total in 't'.
            t[ j ] += nums[ j ];
        }

        // After processing the row, add the row's total sum to the last element of 't'.
        // t[c] will accumulate the sum of all elements in the matrix.
        t[ c ] += sum;

        // Append the calculated row sum to the 'nums' array for the current row.
        nums.push( sum );

        // Convert the processed 'nums' array (including its sum) back to a space-separated string.
        // Add this string to the 'output' array.
        output.push( nums.join( " " ) );
    }

    // After processing all data rows, append the 't' array (column sums and total sum)
    // as a space-separated string to the 'output' array.
    output.push( t.join( " " ) );

    // Finally, join all lines in the 'output' array with newline characters
    // and print the entire result to the console (standard output).
    console.log( output.join( "\n" ) );
} );

// End of script.