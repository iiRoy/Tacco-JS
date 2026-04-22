// This script processes input data to calculate paths on a grid.
// It reads grid dimensions and cell types, then uses dynamic programming.

// Import the file system module for input operations
const fileSystemApi = require('fs');

// Read the entire standard input as a string, then clean and split into lines
let rawDataSource = fileSystemApi.readFileSync('/dev/stdin', 'utf8');
let dataLines = rawDataSource . trim ( ) . split ( '\n' ) ;

// Main processing loop: continues until a specific termination condition is met
while ( true )
{
    // Extract grid dimensions from the current line and parse them as integers
    let sizePair = dataLines . shift ( ) . split ( ' ' ) . map ( val => parseInt ( val , 10 ) ) ;
    let boardCols = sizePair [ 0 ] ; // Assign the first value as width (columns)
    let boardRows = sizePair [ 1 ] ; // Assign the second value as height (rows)

    // Check for the termination condition: both dimensions are zero
    if ( boardCols === 0 && boardRows === 0 )
    {
        break ; // Exit the loop if dimensions are 0x0
    }

    // Initialize a 2D array to store the terrain or obstacle grid
    let obstacleGrid = [ ] ;
    // Populate the obstacle grid row by row
    for ( let currentRowIdx = 0 ; currentRowIdx < boardRows ; currentRowIdx ++ )
    {
        obstacleGrid . push ( dataLines . shift ( ) . split ( ' ' ) . map ( ( stringVal ) => parseInt ( stringVal , 10 ) ) ) ;
    }

    // Initialize the dynamic programming table (memoization table) with zeros
    let memoTable = [ ] ;
    for ( let rIdx = 0 ; rIdx < boardRows ; rIdx ++ )
    {
        memoTable [ rIdx ] = [ ] ; // Create a new row
        for ( let cIdx = 0 ; cIdx < boardCols ; cIdx ++ )
        {
            memoTable [ rIdx ] [ cIdx ] = 0 ; // Initialize each cell to zero
        }
    }

    // Fill the dynamic programming table based on grid rules
    for ( let r = 0 ; r < boardRows ; r ++ )
    {
        for ( let c = 0 ; c < boardCols ; c ++ )
        {
            // Base case: If it's the first row and the cell is traversable (type 0)
            if ( r === 0 && obstacleGrid [ r ] [ c ] === 0 )
            {
                memoTable [ r ] [ c ] = 1 ; // One way to reach this cell
            }
            // For subsequent rows, calculate paths based on previous cells
            else if ( r >= 1 )
            {
                // Calculate paths from diagonally top-left
                let prevLeftDiagonal = ( c === 0 || obstacleGrid [ r - 1 ] [ c - 1 ] === 2 )
                                       ? 0
                                       : memoTable [ r - 1 ] [ c - 1 ] ;

                // Calculate paths from straight top
                let prevUpward = ( obstacleGrid [ r - 1 ] [ c ] === 2 )
                                 ? 0
                                 : memoTable [ r - 1 ] [ c ] ;

                // Calculate paths from diagonally top-right
                let prevRightDiagonal = ( c === boardCols - 1 || obstacleGrid [ r - 1 ] [ c + 1 ] === 2 )
                                        ? 0
                                        : memoTable [ r - 1 ] [ c + 1 ] ;

                // Calculate paths from two rows up (only if specific condition met)
                let prevTwoRowsUp = ( r >= 2 && obstacleGrid [ r - 2 ] [ c ] === 2 )
                                    ? memoTable [ r - 2 ] [ c ]
                                    : 0 ;

                // Update the current cell's path count based on its type
                if ( obstacleGrid [ r ] [ c ] === 0 )
                {
                    // If cell is type 0 (normal path), sum all valid previous paths
                    memoTable [ r ] [ c ] += prevLeftDiagonal + prevUpward + prevRightDiagonal + prevTwoRowsUp ;
                }
                else if ( obstacleGrid [ r ] [ c ] === 1 )
                {
                    // If cell is type 1 (blocked), no paths can go through it
                    memoTable [ r ] [ c ] = 0 ;
                }
                else if ( obstacleGrid [ r ] [ c ] === 2 )
                {
                    // If cell is type 2 (special path), sum only upward and two-up paths
                    memoTable [ r ] [ c ] += prevUpward + prevTwoRowsUp ;
                }
            }
        }
    }

    // Calculate the final aggregate count from the last two rows
    let finalPathCount = 0 ;
    for ( let finalRowIdx = boardRows - 2 ; finalRowIdx < boardRows ; finalRowIdx ++ )
    {
        for ( let finalColIdx = 0 ; finalColIdx < boardCols ; finalColIdx ++ )
        {
            // Condition for the second-to-last row and specific cell type
            if ( boardRows >= 2 && finalRowIdx === boardRows - 2 && obstacleGrid [ finalRowIdx ] [ finalColIdx ] === 2 )
            {
                finalPathCount += memoTable [ finalRowIdx ] [ finalColIdx ] ;
            }
            // Condition for the last row and specific cell types
            if ( boardRows >= 1 && finalRowIdx === boardRows - 1 && ( obstacleGrid [ finalRowIdx ] [ finalColIdx ] === 0 || obstacleGrid [ finalRowIdx ] [ finalColIdx ] === 2 ) )
            {
                finalPathCount += memoTable [ finalRowIdx ] [ finalColIdx ] ;
            }
        }
    }
    // Output the computed total path count for the current grid
    console . log ( finalPathCount ) ;
}