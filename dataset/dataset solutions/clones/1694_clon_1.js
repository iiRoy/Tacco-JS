function Main( input )
{
    // Begin processing of the input data.
    // The input is initially a single string; it needs to be split into lines.
    input = input.split( "\n" ) ;

    // Parse the problem constraints (H, W, K) from the first line of the input.
    // The first line contains three space-separated integers.
    var H = parseInt( input[0].split( " " )[0] ) ; // H represents the height of the grid.
    var W = parseInt( input[0].split( " " )[1] ) ; // W represents the width of the grid.
    var K = parseInt( input[0].split( " " )[2] ) ; // K is the target number of black cells.

    // Remove the first line from the input array as its data has been parsed.
    input.shift( ) ;

    // The remaining lines represent the grid. Map each line to an array of characters.
    var c = input.map( i => i.split( "" ) ) ;

    // Initialize the answer counter. This will store the total number of valid configurations.
    var ans = 0 ;

    // Ensure the grid 'c' only contains 'H' rows.
    // In case there are more lines in the input than H, trim the excess.
    c.splice( H, c.length ) ;

    // maph will store all possible combinations of selecting/deselecting rows.
    // Each combination is an array of 0s and 1s, where 0 means "keep" and 1 means "discard".
    // Start with the base cases for a single row: either keep it ([0]) or discard it ([1]).
    var maph = new Array( [0], [1] ) ;

    // Loop to generate all 2^H combinations for rows.
    // We start with 2 combinations for the first row, then expand for subsequent rows.
    for ( var i = 0 ; i < H - 1 ; i++ )
    {
        // A temporary array to hold the newly generated combinations for the current iteration.
        var mapsub = new Array( 0 ) ;

        // Iterate through each existing combination in maph.
        for ( var j = 0 ; j < maph.length ; j++ )
        {
            // For each existing combination, create two new ones:
            // one where the next row is kept (0), and one where it's discarded (1).
            var zero = [ ...maph[j] ] ; // Clone the current combination for the 'keep' case.
            var one  = [ ...maph[j] ] ; // Clone for the 'discard' case.

            zero.push( 0 ) ; // Append 0, indicating the current row is kept.
            one.push( 1 ) ; // Append 1, indicating the current row is discarded.

            mapsub.push( zero ) ; // Add the 'keep' combination to the temporary array.
            mapsub.push( one ) ; // Add the 'discard' combination to the temporary array.
        }
        // Update maph with the new, expanded set of combinations.
        maph = mapsub ;
    }

    // mapw will store all possible combinations of selecting/deselecting columns.
    // The logic is identical to maph, but applied to columns (width W).
    var mapw = new Array( [0], [1] ) ;

    // Loop to generate all 2^W combinations for columns.
    for ( var i = 0 ; i < W - 1 ; i++ )
    {
        var mapsub = new Array( 0 ) ; // Temporary array for new column combinations.
        for ( var j = 0 ; j < mapw.length ; j++ )
        {
            var zero = [ ...mapw[j] ] ; // Clone for 'keep' column.
            var one  = [ ...mapw[j] ] ; // Clone for 'discard' column.

            zero.push( 0 ) ; // Append 0 (keep this column).
            one.push( 1 ) ; // Append 1 (discard this column).

            mapsub.push( zero ) ; // Add the 'keep' column combination.
            mapsub.push( one ) ; // Add the 'discard' column combination.
        }
        mapw = mapsub ; // Update mapw.
    }

    // Initialize a counter for black cells for each subgrid configuration.
    var blacks = 0 ;

    // Iterate through all possible row selection combinations.
    for ( var i = 0 ; i < maph.length ; i++ )
    {
        // For each row combination, iterate through all possible column selection combinations.
        for ( var j = 0 ; j < mapw.length ; j++ )
        {
            // Now, with a specific row and column selection, iterate through the original grid.
            for ( var k = 0 ; k < H ; k++ )
            {
                for ( var l = 0 ; l < W ; l++ )
                {
                    // Check if the current cell (c[k][l]) is black ('#').
                    // And if its row (k) is selected (maph[i][k] == 0).
                    // And if its column (l) is selected (mapw[j][l] == 0).
                    if ( maph[i][k] == 0 && mapw[j][l] == 0 && c[k][l] == "#" )
                    {
                        blacks++ ; // If all conditions met, increment the black cell counter.
                    }
                }
            }

            // After checking all cells for the current row/column combination:
            // If the total number of black cells matches the target 'K', increment the overall answer.
            if ( blacks == K )
            {
                ans++ ;
            }
            // Reset the black cell counter for the next combination.
            blacks = 0 ;
        }
    }

    // Output the final count of valid configurations to the console.
    console.log( '%s', ans ) ;

    // Return the calculated answer.
    return ans ;
}

// This 'debug' function is likely for a specific test harness environment (e.g., in a browser).
// It's not part of the core problem logic but rather for testing/validation.
function debug( n )
{
    // Retrieve input from a dynamically generated HTML element.
    var input = document.getElementById( "input" + n ).value ;

    // Execute the main logic with the retrieved input.
    var ans = Main( input ) ;

    // Initialize the result status as "Wrong Answer".
    var result = "WA" ;

    // Compare the computed answer with the expected output from another HTML element.
    if ( ans == document.getElementById( "output" + n ).value.split( "\n" )[0] )
    {
        // If the answers match, set the result to "Accepted".
        result = "AC" ;
    }

    // Display the result status in a designated HTML element.
    document.getElementById( "result" + n ).innerHTML = result ;
}

// This line is for running the script in a Node.js environment,
// reading input from standard input (usually a file or piped data).
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;