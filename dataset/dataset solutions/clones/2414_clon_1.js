// This script processes a grid input to assign region numbers based on '#' characters.

// Read input from standard input.
// The entire content of '/dev/stdin' is read, decoded as UTF-8,
// and then split into an array of strings based on newline characters.
inp   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' )



// Extract the first line which contains the grid dimensions and K.
l     =   inp . shift ( ) . split ( ' ' )



// Parse H (height) as an integer. The '* 1' is a common JavaScript trick for type coercion.
H     =   l [ 0 ]   *   1

// Parse W (width) as an integer.
W     =   l [ 1 ]   *   1

// Parse K (an unused variable in this specific logic, but part of input) as an integer.
K     =   l [ 2 ]   *   1



// Initialize the main output array 'o'. This will store the region assignments for each cell.
o     =   [ ]

// Initialize 'idx' which represents the current region number to be assigned.
// Region numbering starts from 1.
idx   =   1

// 'r' will hold the region assignments of the last row that contained '#' characters.
// It's used to propagate region assignments to empty rows above or below.
r     =   0



// Iterate through each row of the grid.
for ( i = 0 ;   i < H ;   i ++ )

{

    // 'a' is a temporary array to store the column indices of '#' characters in the current row.
    a       =   [ ]

    // Initialize the current row 'i' in the output array 'o' as an empty array.
    o [ i ]   =   [ ]



    // Iterate through each column in the current row to find '#' characters.
    for ( j = 0 ;   j < W ;   j ++ )
    {
        // If a '#' character is found at (i, j), add its column index to 'a'.
        if ( inp [ i ] [ j ]   ==   '#' )
        {
            a . push ( j )
        }
    }



    // Check if the current row 'i' contains any '#' characters.
    if ( a . length   ==   0 )
    {
        // If no '#' characters were found in this row:
        if ( r )
        {
            // If 'r' (the region assignments from the last non-empty row) is not empty (truthy),
            // then copy those assignments to the current row. This propagates regions downwards.
            o [ i ]   =   r
        }
        else
        {
            // If 'r' is empty (meaning this is an empty row and no prior row had regions),
            // mark this row as 'e' (empty) to be filled later.
            o [ i ]   =   'e'
        }
    }
    else
    {
        // If '#' characters were found in this row, we need to assign new regions.
        j = 0

        // This loop processes each '#' character in the current row.
        while ( true )
        {
            // Get the next column index of a '#' character from array 'a'.
            k = a . shift ( )

            // If 'k' is undefined, it means there are no more '#' characters in 'a', so break the loop.
            if ( k   ===   undefined )   break ;

            // Fill the cells from the current column 'j' up to the column 'k' (where '#' was found)
            // with the current region index 'idx'.
            while ( j   <=   k )
            {
                o [ i ] [ j ]   =   idx
                j ++
            }

            // Increment the region index for the next distinct region.
            idx ++
        }


        // After processing all '#' characters, fill the remaining cells in the row
        // (from the last processed column 'j' to the end of the row 'W')
        // with the last assigned region index (idx - 1).
        while ( j < W )
        {
            o [ i ] [ j ]   =   idx - 1
            j ++
        }

        // Store the region assignments of this current row 'i' into 'r'.
        // This 'r' will be used for propagation to subsequent empty rows.
        r = o [ i ]
    }
}



// After the initial pass, check if the first row (o[0]) was marked as 'e'.
// This handles cases where the grid starts with empty rows that need to be filled from below.
if ( o [ 0 ]   ==   'e' )
{
    // Initialize 'j' to 1 to start searching from the second row.
    j = 1

    // Find the first row that is NOT 'e' (i.e., it has actual region assignments).
    while ( o [ j ]   ==   'e' )   j ++

    // Store the region assignments of this first non-'e' row into 'r'.
    r = o [ j ]

    // Decrement 'j' to point back to the last 'e' row before the first non-'e' row.
    j --

    // Iterate backwards from 'j' down to 0, filling all 'e' rows with the 'r' assignments.
    while ( j   >=   0 )
    {
        o [ j -- ]   =   r
    }
}



// Finally, format and print the output.
// - For each row 'a' in 'o', join its elements (region numbers) with a space.
// - Then, join these resulting row strings with a newline character.
console . log ( o . map ( a   =>   a . join ( " " ) ) . join ( '\n' ) )