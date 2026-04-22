/* This module processes game board states to determine winners. */
// Function to check for winning sequences in all 26 directions in a 3D grid.
function scanForWin ( playerMark, startCellX, startCellY, startCellZ )
{
  // Define x-axis direction offsets for 26 possible directions (including diagonals in 3D).
  // First 8: xy-plane, z=0
  var xDirectionOffsets = [ -1, 0, 1, -1, 1, -1, 0, 1 ];
  // Define y-axis direction offsets for 26 possible directions.
  // First 8: xy-plane, z=0
  var yDirectionOffsets = [ -1, -1, -1, 0, 0, 1, 1, 1 ];
  // Define z-axis direction offsets for 26 possible directions.
  // First 8: xy-plane, z=0
  var zDirectionOffsets = [ 0, 0, 0, 0, 0, 0, 0, 0 ];

  // Extend for z=-1 plane (below)
  yDirectionOffsets = yDirectionOffsets.concat( [ -1, 0, 1, -1, 1, -1, 0, 1 ] );
  zDirectionOffsets = zDirectionOffsets.concat( [ -1, -1, -1, 0, 0, 1, 1, 1 ] );
  xDirectionOffsets = xDirectionOffsets.concat( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );

  // Extend for z=+1 plane (above)
  zDirectionOffsets = zDirectionOffsets.concat( [ -1, 0, 1, -1, 1, -1, 0, 1 ] );
  xDirectionOffsets = xDirectionOffsets.concat( [ -1, -1, -1, 0, 0, 1, 1, 1 ] );
  yDirectionOffsets = yDirectionOffsets.concat( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );

  // Variable to keep track of the longest sequence found.
  let maximumSequence = 0;

  // Iterate through all 26 possible 3D directions.
  for ( let directionIndex = 0; directionIndex < xDirectionOffsets.length; directionIndex++ )
  {
    // Initialize current coordinates to the starting point for this direction.
    let currentCellX = startCellX;
    let currentCellY = startCellY;
    let currentCellZ = startCellZ;

    // First pass: move backward along the current direction until out of bounds.
    while ( true )
    {
      currentCellX -= xDirectionOffsets[ directionIndex ];
      currentCellY -= yDirectionOffsets[ directionIndex ];
      currentCellZ -= zDirectionOffsets[ directionIndex ];

      // Check if current coordinates are outside the grid boundaries.
      if ( currentCellX < 0 || currentCellY < 0 || currentCellZ < 0 ) break;
      if ( currentCellX >= boardDimension || currentCellY >= boardDimension || currentCellZ >= boardDimension ) break;
    }

    // Initialize counter for consecutive marks in the current direction.
    let currentStreakLength = 0;

    // Second pass: move forward along the current direction, counting consecutive marks.
    while ( true )
    {
      currentCellX += xDirectionOffsets[ directionIndex ];
      currentCellY += yDirectionOffsets[ directionIndex ];
      currentCellZ += zDirectionOffsets[ directionIndex ];

      // Check if current coordinates are outside the grid boundaries.
      if ( currentCellX < 0 || currentCellY < 0 || currentCellZ < 0 ) break;
      if ( currentCellX >= boardDimension || currentCellY >= boardDimension || currentCellZ >= boardDimension ) break;

      // If the cell contains the current player's mark, increment the streak.
      if ( gameMatrix[ currentCellX ][ currentCellY ][ currentCellZ ] === playerMark )
      {
        currentStreakLength++;
      }
      else
      {
        // If not, reset the streak.
        currentStreakLength = 0;
      }
      // Update the maximum sequence found so far.
      maximumSequence = Math.max( maximumSequence, currentStreakLength );
    }
  }
  // Return the longest sequence of the player's marks found.
  return maximumSequence;
}


// Main program execution begins here.
// Read all input data from standard input.
const fileContent = require ( 'node:fs' ). readFileSync ( '/dev/stdin', 'utf8' );

// Split the input into individual lines and clean up whitespace.
let lineData = fileContent.trim().split( "\n" );

// Loop indefinitely until a termination condition is met.
while ( true )
{
  // Extract the first line which contains board dimensions and win condition.
  let dimensionConfig = lineData.shift();

  // If the configuration line is "0 0 0", terminate the program.
  if ( dimensionConfig === "0 0 0" ) break;

  // Parse the dimension configuration string into numbers.
  dimensionConfig = dimensionConfig.split( " " ).map( Number );

  // Assign parsed values to respective variables.
  var boardDimension = dimensionConfig[ 0 ];   // N: size of the N x N x N board.
  var winningLength  = dimensionConfig[ 1 ];   // M: length of sequence needed to win.
  var totalMoves     = dimensionConfig[ 2 ];   // P: total number of moves in the game.

  // Initialize the 3D game board (matrix) with zeros.
  var gameMatrix = [];
  for ( let dimOne = 0; dimOne < boardDimension; dimOne++ )
  {
    gameMatrix[ dimOne ] = [];
    for ( let dimTwo = 0; dimTwo < boardDimension; dimTwo++ )
    {
      gameMatrix[ dimOne ][ dimTwo ] = [];
      for ( let dimThree = 0; dimThree < totalMoves; dimThree++ ) // Note: 'p' here is totalMoves, not boardDimension.
      {
        gameMatrix[ dimOne ][ dimTwo ][ dimThree ] = 0; // 0 represents an empty cell.
      }
    }
  }

  // Set the starting player mark (1 for Black, 2 for White).
  var activePlayerMark = 1; // Player 1 starts (Black).

  // Iterate through each move in the game.
  let moveCounter; // Declare moveCounter outside the loop for post-loop check.
  for ( moveCounter = 0; moveCounter < totalMoves; moveCounter++ )
  {
    // Get the coordinates for the current move.
    let moveCoordinates = lineData.shift().split( " " ).map( Number );
    let placementX = moveCoordinates[ 0 ] - 1; // Adjust to 0-indexed.
    let placementY = moveCoordinates[ 1 ] - 1; // Adjust to 0-indexed.

    // Find the lowest available height (z-coordinate) in the specified column.
    let dropHeight = 0;
    while ( true )
    {
      if ( gameMatrix[ placementX ][ placementY ][ dropHeight ] !== 0 )
      {
        dropHeight++; // Increment if cell is occupied.
      }
      else
      {
        break; // Found an empty cell.
      }
    }

    // Place the current player's mark on the board.
    gameMatrix[ placementX ][ placementY ][ dropHeight ] = activePlayerMark;

    // Check if the current move results in a win.
    if ( scanForWin( activePlayerMark, placementX, placementY, dropHeight ) >= winningLength )
    {
      // Output the winner and the move number.
      console.info( ( activePlayerMark === 2 ) ? "White" : "Black", moveCounter + 1 );
      break; // Game over, a player won.
    }

    // Switch player: 1 becomes 2, 2 becomes 1.
    activePlayerMark = 2 / activePlayerMark;
  }

  // If the loop completed without a break, it means no player won.
  if ( moveCounter === totalMoves )
  {
    console.info( "Draw" );
  }
}