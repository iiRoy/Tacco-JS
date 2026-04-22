function Main( input )
{
    // Process the raw input string
    input = input
        .trim() // Remove leading/trailing whitespace
        .split( "\n" ) // Split into lines
        .map( function( x ) { return x.split( " " ) } ) ; // Split each line by space

    // Parse the number of entries, N, from the first line
    let N = parseInt( input[0][0], 10 );

    // Initialize an array to store X, Y, and direction (U/R/D/L)
    let arr_XYU = [];

    // Populate arr_XYU with parsed X, Y coordinates and direction
    for ( let i = 0; i < N; i++ )
    {
        arr_XYU.push( [
            parseInt( input[i + 1][0], 10 ), // X coordinate
            parseInt( input[i + 1][1], 10 ), // Y coordinate
            input[i + 1][2]                   // Direction string
        ] );
    }



    // Sort the array based on (X + Y) sum, then X coordinate
    arr_XYU.sort( function( a, b )
    {
        // Compare sums (X + Y)
        if ( ( a[0] + a[1] ) < ( b[0] + b[1] ) )
            return -1; // a comes before b
        if ( ( a[0] + a[1] ) > ( b[0] + b[1] ) )
            return 1;  // b comes before a

        // If sums are equal, compare X coordinates
        if ( a[0] < b[0] )
            return -1;
        if ( a[0] > b[0] )
            return 1;

        // If both are equal, maintain original order (or consider them equal for sorting purposes)
        return 0;
    } );


    // Initialize temporary variables for the first pass (finding minimum time)
    let tmp1     = -1;           // Stores the current (X + Y) sum being processed
    let tmp2;                    // Stores the X coordinate of the last 'R' direction found for the current sum
    let tmp3     = Infinity;     // Stores the minimum collision time found so far (initialized to infinity)
    let tmpAngle = 'U';          // Stores the last observed direction for the current sum ('U' or 'R')


    // First iteration: check for collisions along y = -x + C lines, for U and R moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        // Check if the current point has the same (X + Y) sum as the previous one
        if ( tmp1 === ( arr_XYU[i][0] + arr_XYU[i][1] ) )
        {
            // If the last observed direction for this sum was 'R'
            if ( tmpAngle === 'R' )
            {
                // If the current object moves 'U'
                if ( arr_XYU[i][2] === 'U' )
                {
                    tmpAngle = 'U'; // Update last observed direction
                    // Calculate collision time and update minimum if smaller
                    tmp3 = Math.min( tmp3, Math.abs( arr_XYU[i][0] - tmp2 ) * 10 );
                }
                // If the current object also moves 'R'
                else if ( arr_XYU[i][2] === 'R' )
                {
                    tmp2 = arr_XYU[i][0]; // Update tmp2 with the X coordinate of this 'R' object
                }
            }
            // If the last observed direction was not 'R' (e.g., 'U' or initial 'U')
            else
            {
                // If the current object moves 'R'
                if ( arr_XYU[i][2] === 'R' )
                {
                    tmpAngle = 'R';       // Update last observed direction to 'R'
                    tmp2     = arr_XYU[i][0]; // Store its X coordinate
                }
            }
        }
        // If the (X + Y) sum changes, it's a new line
        else
        {
            tmp1 = arr_XYU[i][0] + arr_XYU[i][1]; // Update tmp1 with the new sum
            // If the current object moves 'R'
            if ( arr_XYU[i][2] === 'R' )
            {
                tmpAngle = 'R';       // Set last observed direction to 'R'
                tmp2     = arr_XYU[i][0]; // Store its X coordinate
            }
            // If it moves 'U'
            else
            {
                tmpAngle = 'U';       // Set last observed direction to 'U'
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Reset tmp1 and tmpAngle for the second pass
    tmp1     = -1;
    tmpAngle = 'L'; // Now looking for 'D' and 'L' collisions


    // Second iteration: check for collisions along y = -x + C lines, for D and L moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        if ( tmp1 === ( arr_XYU[i][0] + arr_XYU[i][1] ) )
        {
            if ( tmpAngle === 'D' )
            {
                if ( arr_XYU[i][2] === 'L' )
                {
                    tmpAngle = 'L';
                    tmp3     = Math.min( tmp3, Math.abs( arr_XYU[i][0] - tmp2 ) * 10 );
                }
                else if ( arr_XYU[i][2] === 'D' )
                {
                    tmp2 = arr_XYU[i][0];
                }
            }
            else
            {
                if ( arr_XYU[i][2] === 'D' )
                {
                    tmpAngle = 'D';
                    tmp2     = arr_XYU[i][0];
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[i][0] + arr_XYU[i][1];
            if ( arr_XYU[i][2] === 'D' )
            {
                tmpAngle = 'D';
                tmp2     = arr_XYU[i][0];
            }
            else
            {
                tmpAngle = 'L';
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Sort the array based on (Y - X) difference, then X coordinate
    arr_XYU.sort( function( a, b )
    {
        // Compare differences (Y - X)
        if ( ( a[1] - a[0] ) < ( b[1] - b[0] ) )
            return -1;
        if ( ( a[1] - a[0] ) > ( b[1] - b[0] ) )
            return 1;

        // If differences are equal, compare X coordinates
        if ( a[0] < b[0] )
            return -1;
        if ( a[0] > b[0] )
            return 1;

        return 0;
    } );


    // Reset tmp1 and tmpAngle for the third pass
    tmp1     = Infinity; // Use Infinity for (Y-X) comparison to handle potential negative sums
    tmpAngle = 'D';      // Now looking for 'R' and 'D' collisions


    // Third iteration: check for collisions along y = x + C lines, for R and D moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        if ( tmp1 === ( arr_XYU[i][1] - arr_XYU[i][0] ) )
        {
            if ( tmpAngle === 'R' )
            {
                if ( arr_XYU[i][2] === 'D' )
                {
                    tmpAngle = 'D';
                    tmp3     = Math.min( tmp3, Math.abs( arr_XYU[i][0] - tmp2 ) * 10 );
                }
                else if ( arr_XYU[i][2] === 'R' )
                {
                    tmp2 = arr_XYU[i][0];
                }
            }
            else
            {
                if ( arr_XYU[i][2] === 'R' )
                {
                    tmpAngle = 'R';
                    tmp2     = arr_XYU[i][0];
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[i][1] - arr_XYU[i][0];
            if ( arr_XYU[i][2] === 'R' )
            {
                tmpAngle = 'R';
                tmp2     = arr_XYU[i][0];
            }
            else
            {
                tmpAngle = 'D';
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Reset tmp1 and tmpAngle for the fourth pass
    tmp1     = Infinity;
    tmpAngle = 'L'; // Now looking for 'U' and 'L' collisions


    // Fourth iteration: check for collisions along y = x + C lines, for U and L moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        if ( tmp1 === ( arr_XYU[i][1] - arr_XYU[i][0] ) )
        {
            if ( tmpAngle === 'U' )
            {
                if ( arr_XYU[i][2] === 'L' )
                {
                    tmpAngle = 'L';
                    tmp3     = Math.min( tmp3, Math.abs( arr_XYU[i][0] - tmp2 ) * 10 );
                }
                else if ( arr_XYU[i][2] === 'U' )
                {
                    tmp2 = arr_XYU[i][0];
                }
            }
            else
            {
                if ( arr_XYU[i][2] === 'U' )
                {
                    tmpAngle = 'U';
                    tmp2     = arr_XYU[i][0];
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[i][1] - arr_XYU[i][0];
            if ( arr_XYU[i][2] === 'U' )
            {
                tmpAngle = 'U';
                tmp2     = arr_XYU[i][0];
            }
            else
            {
                tmpAngle = 'L';
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Sort the array based on X coordinate, then Y coordinate
    arr_XYU.sort( function( a, b )
    {
        // Compare X coordinates
        if ( a[0] < b[0] )
            return -1;
        if ( a[0] > b[0] )
            return 1;

        // If X coordinates are equal, compare Y coordinates
        if ( a[1] < b[1] )
            return -1;
        if ( a[1] > b[1] )
            return 1;

        return 0;
    } );


    // Reset tmp1 and tmpAngle for the fifth pass
    tmp1     = -1;
    tmpAngle = 'D'; // Now looking for 'U' and 'D' collisions along vertical lines


    // Fifth iteration: check for collisions along x = C lines, for U and D moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        if ( tmp1 === ( arr_XYU[i][0] ) )
        {
            if ( tmpAngle === 'U' )
            {
                if ( arr_XYU[i][2] === 'D' )
                {
                    tmpAngle = 'D';
                    tmp3     = Math.min( tmp3, Math.abs( arr_XYU[i][1] - tmp2 ) * 5 );
                }
                else if ( arr_XYU[i][2] === 'U' )
                {
                    tmp2 = arr_XYU[i][1];
                }
            }
            else
            {
                if ( arr_XYU[i][2] === 'U' )
                {
                    tmpAngle = 'U';
                    tmp2     = arr_XYU[i][1];
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[i][0];
            if ( arr_XYU[i][2] === 'U' )
            {
                tmpAngle = 'U';
                tmp2     = arr_XYU[i][1];
            }
            else
            {
                tmpAngle = 'D';
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Sort the array based on Y coordinate, then X coordinate
    arr_XYU.sort( function( a, b )
    {
        // Compare Y coordinates
        if ( a[1] < b[1] )
            return -1;
        if ( a[1] > b[1] )
            return 1;

        // If Y coordinates are equal, compare X coordinates
        if ( a[0] < b[0] )
            return -1;
        if ( a[0] > b[0] )
            return 1;

        return 0;
    } );


    // Reset tmp1 and tmpAngle for the sixth pass
    tmp1     = -1;
    tmpAngle = 'L'; // Now looking for 'R' and 'L' collisions along horizontal lines


    // Sixth iteration: check for collisions along y = C lines, for R and L moving objects
    for ( let i = 0; i < arr_XYU.length; i++ )
    {
        if ( tmp1 === ( arr_XYU[i][1] ) )
        {
            if ( tmpAngle === 'R' )
            {
                if ( arr_XYU[i][2] === 'L' )
                {
                    tmpAngle = 'L';
                    tmp3     = Math.min( tmp3, Math.abs( arr_XYU[i][0] - tmp2 ) * 5 );
                }
                else if ( arr_XYU[i][2] === 'R' )
                {
                    tmp2 = arr_XYU[i][0];
                }
            }
            else
            {
                if ( arr_XYU[i][2] === 'R' )
                {
                    tmpAngle = 'R';
                    tmp2     = arr_XYU[i][0];
                }
            }
        }
        else
        {
            tmp1 = arr_XYU[i][1];
            if ( arr_XYU[i][2] === 'R' )
            {
                tmpAngle = 'R';
                tmp2     = arr_XYU[i][0];
            }
            else
            {
                tmpAngle = 'L';
            }
        }
    }
    // console.log(arr_XYU, tmp3); // Debugging output, commented out


    // Determine the final answer
    let ans = tmp3 === Infinity ? "SAFE" : tmp3;

    // Output the result to the console
    console.log( ans );
}


// Call the Main function with input read from stdin
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );