/*
 * This JavaScript code processes a series of grid inputs.
 * For each grid, it identifies the longest continuous sequence of '1's
 * in four specific cardinal and diagonal directions.
 *
 * The main logic involves:
 * 1. Reading grid dimensions and data from standard input.
 * 2. Iterating through each cell of the grid.
 * 3. If a cell contains '1', calling a helper function 'count'
 *    to determine the maximum length of a '1' sequence starting from that cell.
 * 4. Keeping track of the overall maximum sequence length found across the entire grid.
 * 5. Printing the result for each grid.
 *
 * The processing stops when a grid dimension of 0 is encountered.
 */


// The 'count' function is a helper to calculate the maximum length of '1's
// starting from a given coordinate (y, x) in four predefined directions.
function     count  (  y,  x  )    {

    // Define arrays for direction vectors in the y (row) and x (column) axes.
    // These vectors represent:
    // dy:   0 (right), 1 (down-left), 1 (down), 1 (down-right)
    // dx:   1 (right), -1 (down-left), 0 (down), 1 (down-right)
    var   dy   =    [0,   1,   1,   1]  ;
    var   dx   =    [1,  -1,   0,   1]  ;


    // Initialize 'max' to store the maximum count found for the current (y, x) starting point.
    var   max   =   0   ;


    // Loop through each of the four defined directions.
    for  (   var   i   =   0  ;   i   <   4  ;   i++   )    {

        // Initialize 'cnt' for the current direction's sequence length.
        var   cnt   =   0   ;

        // Inner loop: traverse along the current direction starting from (y, x).
        // The loop continues up to 'n' steps, inclusive.
        for   (   var   j   =   0  ;   j   <=   n  ;   j++   )    {

            // Calculate the coordinates of the cell in the current direction and step 'j'.
            var   yy   =   y   +   (   dy[i]   *   j   )   ;
            var   xx   =   x   +   (   dx[i]   *   j   )   ;

            // Boundary check: If the calculated coordinates are outside the grid, break the sequence.
            if   (   yy   <   0    ||    xx   <   0    ||    yy   >=   n    ||    xx   >=   n   )   break   ;

            // Value check: If the cell does not contain '1', the sequence of '1's is broken.
            if   (   yx[yy][xx]   !=   1   )   break   ;

            // If the cell is within bounds and contains '1', increment the counter.
            cnt++   ;
        }

        // After checking one direction, update the 'max' count if 'cnt' is greater.
        max   =   Math.max   (   max,   cnt   )   ;

        // Reset 'cnt' to 0. This line is technically redundant as 'cnt' is re-declared
        // and initialized at the beginning of the outer loop, but it must be preserved
        // as per Type I cloning rules.
        cnt   =   0   ;
    }

    // Return the maximum sequence length found from the starting point (y, x).
    return   max   ;
}


// --- Main Program Execution Starts Here ---

// Read the entire standard input as a string.
var    input    =    require   (   'fs'   )   .   readFileSync   (   '/dev/stdin',   'utf8'   )   ;

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var    Arr    =    (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;


// Loop indefinitely to process multiple test cases.
// The loop will explicitly break when a grid size 'n' of 0 is encountered.
while   (   true   )   {

    // Extract the first line from 'Arr', which represents the grid size 'n'.
    // The '-0' converts the string to a number.
    var    n    =    Arr   .   shift   (   )   -   0   ;

    // Check for the termination condition: if 'n' is 0, exit the loop.
    if   (   n   ==   0   )   break   ;


    // Initialize an empty array 'yx' which will store the 2D grid.
    var    yx    =    [   ]   ;

    // Populate the grid 'yx' based on the 'n' dimension.
    // Each subsequent line from 'Arr' represents a row of the grid.
    // It's split into individual characters and then mapped to numbers.
    for   (   var   i   =   0  ;   i   <   n  ;   i++   )   {
        yx[i]   =   (   Arr   .   shift   (   )   )   .   split   (   ""   )   .   map   (   Number   )   ;
    }


    // Initialize 'max' to track the overall maximum sequence length for the current grid.
    var    max    =    0   ;


    // Iterate through every cell (i, j) of the 'n x n' grid.
    for   (   var   i   =   0  ;   i   <   n  ;   i++   )   {
        for   (   var   j   =   0  ;   j   <   n  ;   j++   )   {
            // If the current cell contains a '1', it's a potential start of a sequence.
            if   (   yx[i][j]   ==   1   )   {
                // Call the 'count' function to find the max sequence from this cell.
                // Update the global 'max' if the returned count is higher.
                max   =   Math   .   max   (   max,   count   (   i,   j   )   )   ;
            }
        }
    }

    // After processing the entire grid, print the maximum sequence length found.
    console   .   log   (   max   )   ;
}