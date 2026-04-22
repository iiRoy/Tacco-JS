/*
 * This JavaScript script is designed to read tabular numeric data from
 * standard input, perform calculations (row sums and column sums), and
 * then output the modified table. The final output includes each original
 * row with its calculated sum appended, followed by a new row that contains
 * the sums of each column and a grand total.
 *
 * Input format expected:
 * The very first line should contain two space-separated integers:
 * R (representing the number of data rows) and C (representing the number of columns).
 * Following this header line, there should be R lines, each containing C
 * space-separated integers.
 *
 * Example:
 * 2 3
 * 1 2 3
 * 4 5 6
 *
 * Expected Output for the example above:
 * 1 2 3 6
 * 4 5 6 15
 * 5 7 9 21
 */


var input =                                     ''; // This variable will accumulate all received data chunks from stdin.

var readable =                           process.stdin; // 'readable' is a reference to the standard input stream object.


// Initiate the input stream to begin emitting data.
readable.resume();

// Set the encoding for the incoming data to ensure proper string interpretation.
readable.setEncoding( 'utf-8' );


/*
 * This event listener waits for 'data' events. Each time a chunk of data
 * is received from stdin, it is appended to the 'input' string.
 */
readable.on(
    'data',
    function( chunk )
    {

        input += chunk; // Concatenate the new chunk of data to the 'input' string.

    }
);


/*
 * This 'end' event listener is triggered once the standard input stream
 * has finished receiving all data. The main processing logic resides here.
 */
readable.on( 'end', function() {

    // Split the accumulated input string into an array of lines, using the newline character as a delimiter.
    var data = input.split( "\n" );

    // The first line of the input contains the dimensions (R and C).
    // Split this line by spaces and convert the parts to numbers.
    var rc = data[0].split( " " ).map( Number );

    var r = rc[0]; // 'r' stores the number of rows (though not directly used in the loop bounds below, it's parsed).
    var c = rc[1]; // 'c' stores the number of columns, crucial for iteration.


    // Initialize an array 't' which will hold the running sums for each column.
    // It has 'c + 1' elements: 'c' for individual column sums, and the last element
    // will accumulate the grand total of all numbers (sum of all row sums, or sum of all column sums).
    var t = Array( c + 1 );

    // Populate the 't' array with initial zero values.
    for ( var i = 0; i < c + 1; i++ )
    {
        t[i] = 0; // Each column sum starts at zero.
    }


    // 'output' will store each processed data row (as a string) and finally the column sums row.
    var output = [];


    // Loop through each data row, starting from the second line (index 1)
    // because the first line (index 0) contained the R and C dimensions.
    for ( var index = 1; index < data.length; index++ )
    {

        // For the current data row, split it by spaces and convert all elements to numbers.
        var nums = data[index].split( ' ' ).map( Number );

        var sum = 0; // Initialize a variable to calculate the sum for the current row.


        // Iterate through each number in the current 'nums' array (representing a row).
        for ( var j = 0; j < c; j++ )
        {
            sum += nums[j];   // Add the current number to the 'sum' for this row.
            t[j] += nums[j];  // Add the current number to its respective column sum in the 't' array.
        }


        // After processing all numbers in the current row, add the row's total sum
        // to the last element of 't', which acts as a grand total accumulator.
        t[c] += sum;

        // Append the calculated row sum to the 'nums' array for the current row.
        nums.push( sum );

        // Convert the 'nums' array (now including the row sum) back into a space-separated string
        // and add it to the 'output' array.
        output.push( nums.join( " " ) );

    }


    // Once all data rows have been processed, the 't' array contains all column sums
    // and the grand total. Convert this array into a space-separated string and
    // append it as the final row to the 'output' array.
    output.push( t.join( " " ) );


    // Join all the strings in the 'output' array with newline characters to form the final
    // multi-line output, and then print it to the console (standard output).
    console.log( output.join( "\n" ) );

} );