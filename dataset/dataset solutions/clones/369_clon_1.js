/*
 * This JavaScript code defines a function 'NotOne'
 * and then processes several input grids, likely for a Sudoku-like problem,
 * identifying cells that contain duplicate numbers within their
 * row, column, or 3x3 block.
 * The identified cells are marked with an asterisk in the output.
 */


// Function to identify duplicate numbers within an array
// and return the indices of their first occurrences.
function NotOne( arr )
{
    // Initialize a frequency counter for digits 0-9.
    // Assuming digits are 1-9 for Sudoku, index 0 is unused or for error handling.
    var cnt = [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
    ];

    // Iterate through the input array to count occurrences of each number.
    arr.forEach(
        function ( v )
        {
            // Increment the counter for the current number.
            // (v - 0) ensures v is treated as a number for indexing.
            cnt[ ( v - 0 ) ]++;
        }
    );

    // Initialize an array to store numbers that appear two or more times.
    var bad = [
    ];

    // Iterate through the frequency counter.
    cnt.forEach(
        function ( v, i )
        {
            // If a number appears 2 or more times, add its value (index i) to 'bad'.
            if ( v >= 2 )
            {
                bad.push( i );
            }
        }
    );


    // Initialize an array to store the indices of the 'bad' numbers
    // as they appear in the original input array 'arr'.
    var result = [
    ];

    // Iterate through the original array.
    arr.forEach(
        function ( v, i )
        {
            // If the current number 'v' is found in the 'bad' list,
            // it means it's a duplicate. Add its index 'i' to 'result'.
            if ( bad.indexOf( v ) != -1 )
            {
                result.push( i );
            }
        }
    );

    // Return the array of indices where duplicate numbers are found.
    return result;
}


// Read input from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace and split into lines.
var Arr = input . trim() . split( "\n" );

// The first line contains the number of test cases.
var n = Arr . shift() - 0;


// Loop through each test case.
for ( var I = 0; I < n; I++ )
{
    // yx will store the current 9x9 grid.
    var yx = [
    ];

    // YX will store a 9x9 grid to mark cells with errors (duplicates).
    // Initialized with zeros.
    var YX = [
    ];


    // Read the 9x9 grid for the current test case.
    for ( var i = 0; i < 9; i++ )
    {
        // Read a line, split by spaces, and map to numbers.
        var v = Arr . shift() . split( " " ) . map( Number );

        // Add the row to the 'yx' grid.
        yx.push( v );

        // Initialize a corresponding row in 'YX' with zeros.
        YX.push( [
            0, 0, 0, 0, 0,
            0, 0, 0, 0
        ] );
    }


    // Check each row for duplicate numbers.
    for ( var i = 0; i < 9; i++ )
    {
        // Call NotOne for the current row.
        var re = NotOne( yx[ i ] );

        // Mark corresponding cells in YX if a duplicate is found in this row.
        re.forEach(
            function ( v )
            {
                YX[ i ][ v ]++;
            }
        );
    }


    // Check each column for duplicate numbers.
    for ( var i = 0; i < 9; i++ )
    {
        // Create an array representing the current column.
        var yy = [
        ];

        for ( var j = 0; j < 9; j++ )
        {
            yy.push( yx[ j ][ i ] );
        }

        // Call NotOne for the current column.
        var re = NotOne( yy );

        // Mark corresponding cells in YX if a duplicate is found in this column.
        re.forEach(
            function ( v )
            {
                YX[ v ][ i ]++;
            }
        );
    }


    // Check each 3x3 block for duplicate numbers.
    for ( var y = 0; y < 3; y++ )
    {
        for ( var x = 0; x < 3; x++ )
        {
            // Calculate the starting row and column for the current 3x3 block.
            var i = y * 3;
            var j = x * 3;

            // Define the coordinates of cells within this 3x3 block.
            var z = [
                [ 0 + i, 0 + j ], [ 0 + i, 1 + j ], [ 0 + i, 2 + j ],
                [ 1 + i, 0 + j ], [ 1 + i, 1 + j ], [ 1 + i, 2 + j ],
                [ 2 + i, 0 + j ], [ 2 + i, 1 + j ], [ 2 + i, 2 + j ]
            ];

            // Extract the values of cells in the current 3x3 block.
            var zz = [
            ];

            z.forEach(
                function ( v )
                {
                    zz.push( yx[ v[ 0 ] ][ v[ 1 ] ] );
                }
            );

            // Call NotOne for the current 3x3 block's values.
            var re = NotOne( zz );

            // Mark corresponding cells in YX if a duplicate is found in this block.
            re.forEach(
                function ( v )
                {
                    YX[ z[ v ][ 0 ] ][ z[ v ][ 1 ] ]++;
                }
            );
        }
    }


    // Format the output grid: mark cells with duplicates with an asterisk.
    yx.forEach(
        function ( V, i )
        {
            V.forEach(
                function ( v, j )
                {
                    // If a cell has been marked as a duplicate (YX[i][j] >= 1),
                    // prepend a "*" to its value; otherwise, prepend a space.
                    yx[ i ][ j ] = ( YX[ i ][ j ] >= 1 ) ? "*" + v : " " + v;
                }
            );
        }
    );


    // Print the formatted grid.
    // Join rows with newlines, and remove commas introduced by Array.join().
    console.log( yx.join( "\n" ) . replace( /\ ,/g, "" ) );
}