// This line reads input from standard input using Node.js filesystem module.
var input    =    require('fs').readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;

/*
 * The input string is trimmed to remove leading/trailing whitespace,
 * then split into an array of strings based on newline characters.
 */
var arr    =    input.trim    (    )    .split    (    "\n"    )    ;

// Start an infinite loop to process multiple test cases.
while    (    true    )
{
    // Extract the first line of the current test case, which contains N and H.
    var nh    =    arr.shift    (    )    ;

    // If the line is "0 0", it signifies the end of input, so break the loop.
    if    (    nh    ==    "0 0"    )
    break    ;

    // Parse the current line (e.g., "N H") into an array of two numbers.
    nh    =    nh.split    (    " "    )    .map    (    Number    )    ;

    // N represents the dimension of the 3D grid (N x N x N).
    var n    =    nh    [    0    ]    ;

    // H represents the number of "hit" operations to perform.
    var h    =    nh    [    1    ]    ;

    // Initialize a 3D array (cube) to store the state of each cell.
    // Each cell will be 0 (unhit) or 1 (hit).
    var xyz    =    [    ]    ;

    // Outer loop for the first dimension (x-axis).
    for    (    var i    =    0    ;    i    <    n    ;    i    ++    )
    {
        // Initialize the current 2D slice (y-z plane).
        xyz    [    i    ]    =    [    ]    ;

        // Middle loop for the second dimension (y-axis).
        for    (    var j    =    0    ;    j    <    n    ;    j    ++    )
        {
            // Initialize the current 1D row (z-axis).
            xyz    [    i    ]    [    j    ]    =    [    ]    ;

            // Inner loop for the third dimension (z-axis).
            for    (    var k    =    0    ;    k    <    n    ;    k    ++    )
            {
                // Set initial value of each cell to 0, meaning it's unhit.
                xyz    [    i    ]    [    j    ]    [    k    ]    =    0    ;
            }
        }
    }

    // Loop H times to process each "hit" operation specified in the input.
    for    (    var I    =    0    ;    I    <    h    ;    I    ++    )
    {
        // Read the next line describing a hit operation.
        // It will be in the format "type coord1 coord2".
        var ary    =    arr.shift    (    )    .split    (    " "    )    ;

        // The first element is the command type (e.g., "xy", "xz", "yz").
        var c    =    ary.shift    (    )    ;

        // Convert the remaining coordinates in 'ary' to 0-indexed values.
        ary    =    ary.map    (    function    (    v    )
        {
            // Subtract 1 because input coordinates are 1-indexed.
            return    v    -    1    ;
        }    )    ;

        // Check the type of hit operation and mark the corresponding cells.

        // If 'xy' command, mark all cells along the z-axis for the given x and y coordinates.
        if    (    c    ==    "xy"    )
        {
            for    (    var i    =    0    ;    i    <    n    ;    i    ++    )
            xyz    [    ary    [    0    ]    ]    [    ary    [    1    ]    ]    [    i    ]    =    1    ;
        }
        // If 'xz' command, mark all cells along the y-axis for the given x and z coordinates.
        else    if    (    c    ==    "xz"    )
        {
            for    (    var i    =    0    ;    i    <    n    ;    i    ++    )
            xyz    [    ary    [    0    ]    ]    [    i    ]    [    ary    [    1    ]    ]    =    1    ;
        }
        // If 'yz' command, mark all cells along the x-axis for the given y and z coordinates.
        else    if    (    c    ==    "yz"    )
        {
            for    (    var i    =    0    ;    i    <    n    ;    i    ++    )
            xyz    [    i    ]    [    ary    [    0    ]    ]    [    ary    [    1    ]    ]    =    1    ;
        }
    }

    // Initialize a counter for unhit cells (cells with value 0).
    var cnt    =    0    ;

    // Iterate through the entire 3D grid to count cells that are still 0.
    // Outer loop for x-dimension.
    for    (    var i    =    0    ;    i    <    n    ;    i    ++    )
    {
        // Middle loop for y-dimension.
        for    (    var j    =    0    ;    j    <    n    ;    j    ++    )
        {
            // Inner loop for z-dimension.
            for    (    var k    =    0    ;    k    <    n    ;    k    ++    )
            {
                // If a cell's value is 0, it means it was not "hit" by any operation.
                if    (    xyz    [    i    ]    [    j    ]    [    k    ]    ==    0    )
                cnt    ++    ;    ;    // Increment the counter. (Note the double semicolon from original code)
            }
        }
    }

    // Print the total count of unhit cells for the current test case.
    console.log    (    cnt    )    ;
}