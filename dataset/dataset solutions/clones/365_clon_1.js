// This function simulates a "bomb" explosion or spread,
// potentially related to a grid-based problem or a recursive search.
function bomb( x, y, z )
{
    // Update the maximum depth or level reached during the recursive calls.
    max = Math.max( max, z );

    // Base case for recursion: if the maximum depth achieved equals 'n',
    // it means a certain condition is met, so we stop further exploration.
    if ( max == n )
        return; // Terminate the current recursive branch.

    // Define x-coordinate offsets for 12 possible movement directions.
    // These define a specific pattern of movement (e.g., knight-like moves).
    var dx = [ -1, 0, 1, -2, 2, -2, 2, -2, 2, -1, 0, 1 ];
    // Define corresponding y-coordinate offsets for the 12 movement directions.
    var dy = [ -2, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 2 ];

    // Initialize an empty object to serve as a hash map (or set)
    // to quickly check if a cell is "safe" or "affected" by the water source.
    var Safe = {};

    // Loop through a 3x3 grid centered around the current water source's coordinates.
    // The water source's coordinates are stored in the 'water' array,
    // where water[z*2] is x and water[z*2+1] is y for the current depth 'z'.
    for ( var i = -1; i <= 1; i++ )
    {
        for ( var j = -1; j <= 1; j++ )
        {
            // Construct a string key for the cell (e.g., "x y") and mark it as true.
            // This indicates that any cell within this 3x3 area around the water source
            // at depth 'z' is considered 'safe' or 'affected'.
            Safe[ ( water[ z * 2 ] + i ) + " " + ( water[ z * 2 + 1 ] + j ) ] = true;
        }
    }

    // Iterate through all 12 predefined movement directions.
    for ( var i = 0; i < 12; i++ )
    {
        // Calculate the potential new x-coordinate.
        var xx = x + dx[ i ];
        // Calculate the potential new y-coordinate.
        var yy = y + dy[ i ];

        // Check boundary conditions: if the new coordinates are outside the 10x10 grid,
        // this move is invalid, so skip to the next direction.
        if ( xx < 0 || yy < 0 || xx >= 10 || yy >= 10 )
            continue; // Skip this iteration and try the next direction.

        // If the calculated new cell (xx, yy) is found in the 'Safe' object,
        // meaning it's within the 3x3 vicinity of a water source at the current depth,
        // then recursively call the 'bomb' function for this new cell,
        // incrementing the depth (z + 1).
        if ( Safe.hasOwnProperty( xx + " " + yy ) )
            bomb( xx, yy, z + 1 ); // Continue the simulation from the new safe cell.
    }
}


// --- Main program execution begins here ---

// Read all input from standard input as a single string, using UTF-8 encoding.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Trim any leading or trailing whitespace from the input string,
// then split it into an array of strings, where each element is a line.
var Arr = ( input.trim() ).split( "\n" );


// Start an infinite loop to process multiple test cases provided in the input.
while ( true )
{
    // Extract the first line from the 'Arr' array (which contains x, y coordinates).
    // Split the line by spaces and convert the resulting strings to numbers.
    var xy = ( Arr.shift() ).split( " " ).map( Number );

    // Check for the termination condition of the input:
    // If both x (xy[0]) and y (xy[1]) are 0, it signifies the end of input.
    if ( xy[ 0 ] == 0 && xy[ 1 ] == 0 )
        break; // Exit the 'while' loop.

    // Extract the next line, convert it to a number. This represents 'n'.
    // The '- 0' is a common JavaScript idiom to explicitly cast to a number.
    var n = Arr.shift() - 0;

    // Extract the subsequent line, split by spaces, and convert to numbers.
    // This array 'water' contains coordinate pairs for water sources at different depths.
    var water = ( Arr.shift() ).split( " " ).map( Number );


    // Initialize the 'max' variable to 0 for the current test case.
    // This variable will track the maximum depth reached by the 'bomb' function.
    var max = 0;

    // Initiate the recursive 'bomb' function with the starting coordinates (xy[0], xy[1])
    // and an initial depth of 0.
    bomb( xy[ 0 ], xy[ 1 ], 0 );

    // After the 'bomb' simulation completes for the current test case,
    // compare the maximum depth reached ('max') with the target value 'n'.
    // Print "OK" if they are equal, otherwise print "NA".
    console.log( ( max == n ) ? "OK" : "NA" );
}

// --- End of program execution ---