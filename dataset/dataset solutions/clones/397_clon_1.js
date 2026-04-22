// This function calculates the maximum count of consecutive '1's
// starting from a given coordinate (y, x) in four specific directions.
function    count  (   y,  x   ) {
    /* Define the change in y-coordinate for each direction. */
    var     dy  =   [   0,  1,  1,  1   ];
    // Define the change in x-coordinate for each direction.
    var     dx  =   [   1,  -1, 0,  1   ];

    // Initialize the maximum count found so far for any direction.
    var     max =   0;


    /* Loop through each of the four predefined directions.
     * These directions represent right, down-left, down, and down-right. */
    for (  var  i   =   0;  i   <   4;  i++ )
    {
        // Initialize current count for the sequence in the current direction.
        var     cnt =   0;

        // Iterate along the current direction starting from (y,x).
        // The global variable 'n' is used here, representing the grid size.
        for (  var  j   =   0;  j   <=  n;  j++ )
        {
            // Calculate the next coordinates in the current direction.
            var     yy  =   y   +   (   dy[i]   *   j   );
            var     xx  =   x   +   (   dx[i]   *   j   );

            // Check if the calculated coordinates are out of bounds of the grid.
            // If out of bounds, break from this direction's sequence check.
            if  (   yy  <   0   ||  xx  <   0   ||  yy  >=  n   ||  xx  >=  n   )   break;

            // Check if the cell at (yy, xx) contains a '1'.
            if  (   yx[yy][xx]  ==  1   )   cnt++;  // Increment count if '1' is found.
            else    break;                              // If not '1', break as the sequence of '1's is broken.
        }

        // After checking one direction, update the overall maximum count.
        max     =   Math.max(   max,    cnt );

        // Reset the current count for the next direction's check.
        cnt     =   0;
    }

    // Return the final maximum count found across all directions from (y, x).
    return  max;
}


// Read and preprocess the input string.
// 'input' is assumed to be a global variable containing the raw input data.
var     Arr     =   (   input.trim()    ).split(    "\n"    );


// Main loop to process multiple test cases until an 'n' of 0 is encountered.
while   (   true    )
{
    // Read the grid size 'n' from the input array.
    // The '-0' converts the string value to a number.
    var     n   =   Arr.shift() -   0;

    // If 'n' is 0, it signifies the end of input, so break the processing loop.
    if  (   n   ==  0   )   break;

    // Initialize an empty array to store the grid (matrix) for the current test case.
    var     yx  =   [];

    // Populate the grid 'yx' based on the 'n' lines of input.
    for (  var  i   =   0;  i   <   n;  i++ )
    {
        // Each line is split into individual characters and then mapped to numbers.
        yx[i]   =   (   Arr.shift() ).split(    ""  ).map(   Number  );
    }


    // Initialize the overall maximum count for the current test case's grid.
    var     max     =   0;


    /* Iterate through each cell of the grid (from top-left to bottom-right). */
    for (  var  i   =   0;  i   <   n;  i++ )
    {
        for (  var  j   =   0;  j   <   n;  j++ )
        {
            // If the current cell contains a '1',
            // calculate the maximum sequence starting from it using the 'count' function
            // and update the overall maximum if the new count is greater.
            if  (   yx[i][j]    ==  1   )
            {
                max     =   Math.max(   max,    count(  i,  j   )   );
            }
        }
    }

    // Output the maximum count found for the current grid to the console.
    console.log(    max );
}