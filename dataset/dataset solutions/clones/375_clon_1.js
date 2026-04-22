/*
 * This JavaScript code defines a function to rotate a 2D array (matrix)
 * and then uses it to process input, display rotations, and print results.
 *
 * The 'move' function performs a 90-degree clockwise rotation.
 */

function    move
(   /* The input 2D array (matrix) to be rotated */
    yx
)
{
    // Initialize an empty array to store the rotated matrix.
    var     arr = [];

    /*
     * Initialize the rows of the 'arr' matrix.
     * This creates an 8x8 matrix structure.
     */
    for
    (
        var y = 0;
        y < 8;
        y++
    )
        arr[y] = [];


    // Loop through the input matrix 'yx' to perform the rotation.
    for
    (
        var     y = 0; // Row index for the new array
        y       < 8; // Iterate 8 times for rows
        y++          // Increment row index
    )
    {
        for
        (
            var     x = 0; // Column index for the new array
            x       < 8; // Iterate 8 times for columns
            x++          // Increment column index
        )
        {
            /*
             * The core rotation logic:
             * new_arr[y][x] = original_arr[7-x][y]
             * This effectively rotates the matrix 90 degrees clockwise.
             */
            arr[y][x]   =   yx[7 - x][y];
        }
    }

    // Return the newly rotated 2D array.
    return  arr;
}


// Read input from standard input (/dev/stdin) as a UTF-8 string.
var input   =   require('fs').readFileSync
(
    '/dev/stdin',
    'utf8'
);


// Trim leading/trailing whitespace from the input and split it into an array of lines.
var     Arr =   (   input.trim()    )   .   split("\n");


// Initialize an empty array to hold the parsed input matrix.
var     yx  =   [];

/*
 * Populate the 'yx' array. Each line from 'Arr' is split into
 * individual characters, forming an 8x8 character matrix.
 */
for
(
    var     i   =   0;
    i       <   8;
    i++
)
    yx.push
    (
        Arr[i].split("")
    );


// Perform the first 90-degree rotation.
yx  =   move(yx);

/*
 * Print the result for 90 degrees rotation.
 * 'yx.join("\n")' joins rows with newlines.
 * '.replace(/\,/g,"")' removes commas that 'join' might introduce if elements were arrays.
 */
console.log
(
    "90\n"  +
    yx.join("\n").replace(/\,/g, "")
);


// Perform the second 90-degree rotation (total 180 degrees from original).
yx  =   move(yx);

// Print the result for 180 degrees rotation.
console.log
(
    "180\n" +
    yx.join("\n").replace(/\,/g, "")
);


// Perform the third 90-degree rotation (total 270 degrees from original).
yx  =   move(yx);

// Print the result for 270 degrees rotation.
console.log
(
    "270\n" +
    yx.join("\n").replace(/\,/g, "")
);

/* End of script. */