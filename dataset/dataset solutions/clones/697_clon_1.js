var k = 0; // Global counter for input processing

// Function to perform a 90-degree rotation operation
function route90( x, y, m )
{
    // Iterate through the elements from 1 to m (inclusive)
    for ( var i = 1; i <= m; i++ )
    {
        // Store the original x[i] value
        var a = x[i];

        // Calculate 'b': if y[i] is 0, b is 0; otherwise, it's -y[i]
        var b = y[i] == 0 ? 0 : y[i] * ( -1 );

        // Assign the calculated 'b' to x[i]
        x[i] = b;

        // Assign the original 'a' (x[i]) to y[i]
        y[i] = a;
    }
}


// This function processes a single set of input coordinates
function inline(x, y, n, m, input) {
    // Parse the count of points for the current shape (m[n])
    m[n] = parseInt(input[k++], 10);

    // Initialize arrays for x and y coordinates for the current shape 'n'
    x[n] = [];
    y[n] = [];

    // Loop through each point for the current shape
    for (var i = 1; i <= m[0]; i++) {
        // Split the input line into individual coordinate strings
        input[k] = input[k].split(" ");

        // Parse the x-coordinate
        x[n][i] = parseInt(input[k][0], 10);

        // Parse the y-coordinate and increment global counter 'k'
        y[n][i] = parseInt(input[k++][1], 10);

        // If not the first point, normalize coordinates relative to the first point
        if (i > 1) {
            x[n][i] -= x[n][1];
            y[n][i] -= y[n][1];
        }
    }

    // Set the first point's coordinates to (0,0) after normalization
    x[n][1] = y[n][1] = 0;

    // Apply rotation based on conditions
    // Condition 1: if y-coordinate of the second point is positive
    if (y[n][2] > 0)
        route90(x[n], y[n], m[n]);

    // Condition 2: if x-coordinate of the second point is negative
    if (x[n][2] < 0)
        route90(x[n], y[n], m[n]);

    // Condition 3: if y-coordinate of the second point is negative
    if (y[n][2] < 0)
        route90(x[n], y[n], m[n]);
}

/**
 * Function to invert or transform coordinates.
 * It creates a temporary copy, then re-calculates coordinates
 * based on a mirrored/inverted pattern relative to the last point,
 * and finally applies rotations based on specific conditions.
 * @param {Array<number>} x - Array of x-coordinates.
 * @param {Array<number>} y - Array of y-coordinates.
 * @param {number} m - The count of points.
 */
function inv(x, y, m)
{
    // Declare temporary arrays to hold original coordinates
    var x1 = [], y1 = [];

    // Copy original coordinates to temporary arrays
    for ( var i = 1; i <= m; i++ )
    {
        x1[i] = x[i];
        y1[i] = y[i];
    }

    // Recalculate coordinates based on inverted order and relative to the last point
    for ( var i = 1; i <= m; i++ )
    {
        x[i] = x1[m - i + 1] - x1[m];
        y[i] = y1[m - i + 1] - y1[m];
    }

    // Apply rotation if y-coordinate of the second point is positive
    if ( y[2] > 0 )
    {
        route90(x, y, m);
    }
    // Apply rotation if x-coordinate of the second point is negative
    if ( x[2] < 0 )
    {
        route90(x, y, m);
    }
    // Apply rotation if y-coordinate of the second point is negative
    if ( y[2] < 0 )
    {
        route90(x, y, m);
    }
}

// Main entry point for the program
function Main( input )
{
    // Split the entire input string by newlines into an array of lines
    input = input.split( "\n" );

    // Start an infinite loop to process multiple test cases
    while ( 1 )
    {
        // Read the number of shapes (n) for the current test case
        var n = parseInt( input[k++], 10 );

        // If n is 0, it signifies the end of input, so break the loop
        if ( n == 0 )
        {
            break;
        }

        // Initialize arrays to store metadata (m) and coordinates (x, y) for shapes
        var m = [];
        var x = [], y = [];

        // Process each shape's data using the 'inline' function
        // Note: The loop runs from 0 to n, implying (n+1) shapes are processed.
        // m[0] likely holds the reference shape's point count.
        for ( var i = 0; i <= n; i++ )
        {
            inline(x, y, i, m, input);
        }


        // Compare the first shape (index 0) with all other shapes
        for ( var i = 1; i <= n; i++ )
        {
            // Check if the number of points in the current shape matches the reference shape
            if ( m[0] == m[i] )
            {
                var flag = true; // Assume shapes match initially

                // Compare point by point
                for ( var j = 1; j <= m[0]; j++ )
                {
                    // If any coordinate pair doesn't match, set flag to false and break
                    if ( x[0][j] != x[i][j] || y[0][j] != y[i][j] )
                    {
                        flag = false;
                        break;
                    }
                }

                // If shapes matched directly, print the index
                if ( flag )
                {
                    console.log(i);
                }
                else // If shapes didn't match directly, try 'inv' transformation
                {
                    // Apply the 'inv' transformation to the current shape
                    inv(x[i], y[i], m[i]);

                    var flag = true; // Reset flag for re-comparison

                    // Compare again after transformation
                    for ( var j = 1; j <= m[0]; j++ )
                    {
                        if ( x[0][j] != x[i][j] || y[0][j] != y[i][j] )
                        {
                            flag = false;
                            break;
                        }
                    }

                    // If shapes match after 'inv' transformation, print the index
                    if ( flag )
                    {
                        console.log(i);
                    }
                } // End of else block for direct match
            } // End of if (m[0] == m[i])
        } // End of outer for loop (comparing shapes)

        // Print a separator after each test case
        console.log( "+++++" );
    } // End of while(1) loop
}

// Read input from standard input and pass it to the Main function
Main(require("fs").readFileSync("/dev/stdin", "utf8"));