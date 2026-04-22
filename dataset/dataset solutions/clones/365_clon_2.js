// Declaration of variables with global scope for tracking overall progress.
let maxReachedDepth = 0;     // Keeps track of the deepest valid level attained.
let targetDepthVal  = 0;     // The specific level count we aim to reach or surpass.


/**
 * Initiates a recursive exploration process on a conceptual grid.
 * This function models movement patterns, potentially like a chess knight,
 * checking for valid paths and updating the maximum depth achieved.
 *
 * @param   {number} currentXCoordinate - The starting or current horizontal position.
 * @param   {number} currentYCoordinate - The starting or current vertical position.
 * @param   {number} currentLevel       - The present depth or step count in the exploration.
 * @returns {void}                      - This function does not return a value directly.
 */
function exploreGrid( currentXCoordinate, currentYCoordinate, currentLevel )
{
    // Update the highest level achieved so far.
    maxReachedDepth = Math.max( maxReachedDepth, currentLevel );

    // If the exploration has already reached the target depth,
    // further recursive calls from this path are unnecessary.
    if ( maxReachedDepth === targetDepthVal )
        return;

    // Define the possible shifts in the X-axis for each move.
    const horizontalShifts = [ -1,  0,  1, -2,  2, -2,  2, -2,  2, -1,  0,  1 ];
    // Define the possible shifts in the Y-axis for each move.
    const verticalShifts   = [ -2, -2, -2, -1, -1,  0,  0,  1,  1,  2,  2,  2 ];

    // A map to store coordinates that are considered 'permissible' for movement.
    // This effectively acts as a temporary whitelist for the current level's hazards.
    const permissiblePositions = {};

    // Loop to define a 3x3 area around the current 'hazard' point.
    // Positions within this 3x3 area are marked as permissible.
    for ( let rowOffset = -1; rowOffset <= 1; rowOffset++ )
    {
        for ( let colOffset = -1; colOffset <= 1; colOffset++ )
        {
            // Calculate the specific hazard coordinates for the current depth.
            const hazardPointX = hazardCoords[currentLevel * 2];
            const hazardPointY = hazardCoords[currentLevel * 2 + 1];

            // Mark the relative position around the hazard as permissible.
            permissiblePositions[ ( hazardPointX + rowOffset ) + " " + ( hazardPointY + colOffset ) ] = true;
        }
    }

    // Iterate through all defined movement shifts.
    for ( let moveOptionIdx = 0; moveOptionIdx < 12; moveOptionIdx++ )
    {
        // Calculate the coordinates of the next potential step.
        const nextXPosition = currentXCoordinate + horizontalShifts[moveOptionIdx];
        const nextYPosition = currentYCoordinate + verticalShifts[moveOptionIdx];

        // Validate if the next position is within the predefined grid boundaries (0-9 for both axes).
        if ( nextXPosition < 0 || nextYPosition < 0 || nextXPosition >= 10 || nextYPosition >= 10 )
        {
            continue; // Skip this move if it falls outside the grid.
        }

        // Check if the calculated next position is marked as permissible.
        // If it is, proceed with a recursive call to explore from this new position,
        // incrementing the exploration level.
        if ( permissiblePositions.hasOwnProperty( nextXPosition + " " + nextYPosition ) )
        {
            exploreGrid( nextXPosition, nextYPosition, currentLevel + 1 );
        }
    }
}


// Utilize Node.js's file system module to read all input data synchronously.
const rawInputData = require('fs').readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input string: remove leading/trailing whitespace and split into individual lines.
let inputLineArray = ( rawInputData.trim() ).split( "\n" );

// Begin the primary processing loop for multiple test cases.
while ( true )
{
    // Extract the initial starting coordinates from the first line of the current test case.
    // Split the string and convert parts into numerical values.
    let startingPositions = ( inputLineArray.shift() ).split( " " ).map( Number );

    // Check for the problem's specified termination condition (0 0 for start coordinates).
    if ( startingPositions[0] === 0 && startingPositions[1] === 0 )
    {
        break; // Exit the processing loop.
    }

    // Retrieve the desired target depth from the next line, converting it to a number.
    targetDepthVal = inputLineArray.shift() - 0;

    // Parse the hazard coordinates for the current test case.
    // These coordinates define areas that influence permissible moves.
    let hazardCoords = ( inputLineArray.shift() ).split( " " ).map( Number );

    // Reset the maximum depth tracker for the new test case to ensure independence.
    maxReachedDepth = 0;

    // Initiate the recursive exploration from the given starting point at level zero.
    exploreGrid( startingPositions[0], startingPositions[1], 0 );

    // Output the result based on whether the target depth was achieved: "OK" or "NA".
    console.log( ( maxReachedDepth === targetDepthVal ) ? "OK" : "NA" );
}