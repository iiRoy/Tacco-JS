/*
 * This function evaluates the game board for a winning sequence starting from a given point.
 * It checks in all 24 predefined 3D directions.
 */
function checkWinningCondition( activePlayerPiece, startCoordX, startCoordY, startCoordZ )
{
    // Define initial sets of directional offsets for X, Y, and Z axes
    let   xOffsets = [ -1, 0, 1, -1, 1, -1, 0, 1 ];
    const yOffsets = [ -1, -1, -1, 0, 0, 1, 1, 1 ];
    let   zOffsets = [ 0, 0, 0, 0, 0, 0, 0, 0 ];

    // Expand the Y-axis offsets
    yOffsets = yOffsets.concat( [ -1, 0, 1, -1, 1, -1, 0, 1 ] );
    // Expand the Z-axis offsets
    zOffsets = zOffsets.concat( [ -1, -1, -1, 0, 0, 1, 1, 1 ] );
    // Expand the X-axis offsets
    xOffsets = xOffsets.concat( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );

    // Further expand the Z-axis offsets
    zOffsets = zOffsets.concat( [ -1, 0, 1, -1, 1, -1, 0, 1 ] );
    // Further expand the X-axis offsets
    xOffsets = xOffsets.concat( [ -1, -1, -1, 0, 0, 1, 1, 1 ] );
    // Further expand the Y-axis offsets
    yOffsets = yOffsets.concat( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );

    // Variable to store the maximum sequence length found across all directions
    let   longestSequence = 0;

    // Iterate through each of the 24 defined directions
    for ( let directionIndex = 0; directionIndex < xOffsets.length; directionIndex++ )
    {
        // Initialize temporary coordinates for traversal in the current direction
        let currentX = startCoordX;
        let currentY = startCoordY;
        let currentZ = startCoordZ;

        // Step backwards from the starting point until an out-of-bounds position is reached
        while ( true )
        {
            currentX -= xOffsets[ directionIndex ];
            currentY -= yOffsets[ directionIndex ];
            currentZ -= zOffsets[ directionIndex ];

            // Break if any coordinate falls below zero
            if ( currentX < 0 || currentY < 0 || currentZ < 0 ) break;
            // Break if any coordinate is at or beyond the board's dimension limit
            if ( currentX >= gridDimension || currentY >= gridDimension || currentZ >= gridDimension ) break;
        }

        // Initialize a counter for the current sequence length
        let currentSequenceCount = 0;

        // Step forwards from the adjusted starting point (or just outside the board)
        while ( true )
        {
            currentX += xOffsets[ directionIndex ];
            currentY += yOffsets[ directionIndex ];
            currentZ += zOffsets[ directionIndex ];

            // Break if any coordinate falls below zero
            if ( currentX < 0 || currentY < 0 || currentZ < 0 ) break;
            // Break if any coordinate is at or beyond the board's dimension limit
            if ( currentX >= gridDimension || currentY >= gridDimension || currentZ >= gridDimension ) break;

            // Check if the piece at the current position matches the active player's piece
            if ( gameBoardState[ currentX ][ currentY ][ currentZ ] === activePlayerPiece )
            {
                currentSequenceCount++; // Increment count if it's a match
            }
            else
            {
                currentSequenceCount = 0; // Reset count if it's not a match
            }
            // Update the overall maximum sequence length found
            longestSequence = Math.max( longestSequence, currentSequenceCount );
        }
    }
    return longestSequence; // Return the longest sequence found for the active player
}

// Global declarations for board dimensions and game state.
let gridDimension;
let gameBoardState;

// Read the entire input content from standard input.
const rawDataInput = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input: trim whitespace and split into an array of lines.
const inputLines = rawDataInput.trim().split( "\n" );

// Main game simulation loop.
while ( true )
{
    // Retrieve the first line of configuration for the current game.
    let   configLine = inputLines.shift();

    // If the configuration line indicates termination, exit the loop.
    if ( configLine === "0 0 0" ) break;

    // Parse the configuration values (board size, winning length, total moves).
    configLine = configLine.split( " " ) . map( Number );
    gridDimension = configLine[ 0 ];      // N: The size of the N x N x P board.
    const requiredLength = configLine[ 1 ]; // M: The length of the sequence required to win.
    const totalMoves = configLine[ 2 ];     // P: The total number of moves in this game scenario.

    // Initialize the 3D game board array with all cells set to zero (empty).
    gameBoardState = [];
    for ( let rowIter = 0; rowIter < gridDimension; rowIter++ )
    {
        gameBoardState[ rowIter ] = [];
        for ( let colIter = 0; colIter < gridDimension; colIter++ )
        {
            gameBoardState[ rowIter ][ colIter ] = [];
            for ( let depthIter = 0; depthIter < totalMoves; depthIter++ )
            {
                gameBoardState[ rowIter ][ colIter ][ depthIter ] = 0;
            }
        }
    }

    // Initialize the current player's piece (1 for Black, 2 for White).
    let   currentPlayerPiece = 1;
    // Flag to track if the game ends in a draw.
    let   isGameDraw = true;

    // Loop through each of the specified moves.
    for ( let moveIndex = 0; moveIndex < totalMoves; moveIndex++ )
    {
        // Get the coordinates for the current move from the input.
        const moveCoordinates = inputLines.shift().split( " " ).map( Number );
        let   colPos = moveCoordinates[ 0 ] - 1; // Convert to 0-indexed column.
        let   rowPos = moveCoordinates[ 1 ] - 1; // Convert to 0-indexed row.

        // Determine the lowest available Z-coordinate (depth) in the stack.
        let currentDepth = 0;
        while ( true )
        {
            if ( gameBoardState[ colPos ][ rowPos ][ currentDepth ] !== 0 )
            {
                currentDepth++; // If occupied, move to the next depth level.
            }
            else
            {
                break; // Found an empty slot.
            }
        }

        // Place the current player's piece onto the board.
        gameBoardState[ colPos ][ rowPos ][ currentDepth ] = currentPlayerPiece;

        // Check if the current move results in a winning condition.
        if ( checkWinningCondition( currentPlayerPiece, colPos, rowPos, currentDepth ) >= requiredLength )
        {
            // Announce the winner and the move number.
            console.log( ( currentPlayerPiece === 2 ) ? "White" : "Black", moveIndex + 1 );
            isGameDraw = false; // A winner has been determined.
            break; // Terminate the game loop as a winner is found.
        }

        // Switch to the other player for the next turn.
        currentPlayerPiece = ( currentPlayerPiece === 1 ) ? 2 : 1;
    }

    // If no winner was found after all moves, declare a draw.
    if ( isGameDraw ) console.log( "Draw" );
}