( function ( rawDataInput ) {
    // This section processes the initial raw text input.
    var processedLines = rawDataInput . replace ( /\n$/, '' ) . split ( '\n' ) ;

    // A 2D array is initialized to store the grid representation.
    var gridData = [ ] ;

    // Loop through each line to convert it into a row of numbers in the grid.
    for ( var lineIndex = 0 ; lineIndex < processedLines . length ; lineIndex ++ ) {
        gridData . push ( processedLines[ lineIndex ] . split ( '' ) . map ( Number ) ) ;
    }

    // Initiate the grid traversal from the starting point (0,0) with an initial 'R' direction.
    // The resulting path is then printed to the console.
    console . printOutput ( 'R' + traverseGrid ( gridData , 0 , 0 , 'R' ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


/**
 * Recursively navigates through a grid, attempting to find a path.
 * The traversal logic changes based on the current direction state.
 *
 * @param {Array<Array<Number>>} currentGrid - The two-dimensional array representing the map.
 * @param {Number} currentXCoord - The present horizontal coordinate in the grid.
 * @param {Number} currentYCoord - The present vertical coordinate in the grid.
 * @param {String} currentDirectionState - The current orientation for movement ('R', 'L', 'U', 'D').
 * @returns {String} A string representing the sequence of moves made.
 */
function traverseGrid ( currentGrid , currentXCoord , currentYCoord , currentDirectionState ) {

    // Base condition for termination: if at the origin (0,0) and attempting to move Left.
    if ( currentXCoord === 0 && currentYCoord === 0 && currentDirectionState === 'L' ) {
        return '' ;
    }

    // Movement logic when the current direction is Right.
    if ( currentDirectionState === 'R' ) {
        // First attempt: Move Up-Right.
        if ( checkCellValidity ( currentGrid , currentXCoord + 1 , currentYCoord - 1 ) ) {
            return 'U' + traverseGrid ( currentGrid , currentXCoord + 1 , currentYCoord - 1 , 'U' ) ;
        }
        // Second attempt: Move Straight Right.
        if ( checkCellValidity ( currentGrid , currentXCoord + 1 , currentYCoord ) ) {
            return 'R' + traverseGrid ( currentGrid , currentXCoord + 1 , currentYCoord , 'R' ) ;
        }
        // Third attempt: Move Down-Right.
        if ( checkCellValidity ( currentGrid , currentXCoord + 1 , currentYCoord + 1 ) ) {
            return 'D' + traverseGrid ( currentGrid , currentXCoord + 1 , currentYCoord + 1 , 'D' ) ;
        }
        // If no forward movement is possible, turn Left from the current position.
        return 'L' + traverseGrid ( currentGrid , currentXCoord , currentYCoord , 'L' ) ;
    }

    // Movement logic when the current direction is Left.
    if ( currentDirectionState === 'L' ) {
        // First attempt: Move Down-Left.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord + 1 ) ) {
            return 'D' + traverseGrid ( currentGrid , currentXCoord , currentYCoord + 1 , 'D' ) ;
        }
        // Second attempt: Move Straight Left.
        if ( checkCellValidity ( currentGrid , currentXCoord - 1 , currentYCoord ) ) {
            return 'L' + traverseGrid ( currentGrid , currentXCoord - 1 , currentYCoord , 'L' ) ;
        }
        // Third attempt: Move Up-Left.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord - 1 ) ) {
            return 'U' + traverseGrid ( currentGrid , currentXCoord , currentYCoord - 1 , 'U' ) ;
        }
        // If no forward movement is possible, turn Right from the current position.
        return 'R' + traverseGrid ( currentGrid , currentXCoord , currentYCoord , 'R' ) ;
    }

    // Movement logic when the current direction is Down.
    if ( currentDirectionState === 'D' ) {
        // First attempt: Move Right-Down.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord + 1 ) ) {
            return 'R' + traverseGrid ( currentGrid , currentXCoord , currentYCoord + 1 , 'R' ) ;
        }
        // Second attempt: Move Straight Down by two steps.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord + 2 ) ) {
            return 'D' + traverseGrid ( currentGrid , currentXCoord , currentYCoord + 2 , 'D' ) ;
        }
        // Third attempt: Move Left-Down.
        if ( checkCellValidity ( currentGrid , currentXCoord - 1 , currentYCoord + 1 ) ) {
            return 'L' + traverseGrid ( currentGrid , currentXCoord - 1 , currentYCoord + 1 , 'L' ) ;
        }
        // If no forward movement is possible, turn Up from the current position.
        return 'U' + traverseGrid ( currentGrid , currentXCoord , currentYCoord , 'U' ) ;
    }

    // Movement logic when the current direction is Up.
    if ( currentDirectionState === 'U' ) {
        // First attempt: Move Left-Up.
        if ( checkCellValidity ( currentGrid , currentXCoord - 1 , currentYCoord - 1 ) ) {
            return 'L' + traverseGrid ( currentGrid , currentXCoord - 1 , currentYCoord - 1 , 'L' ) ;
        }
        // Second attempt: Move Straight Up by two steps.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord - 2 ) ) {
            return 'U' + traverseGrid ( currentGrid , currentXCoord , currentYCoord - 2 , 'U' ) ;
        }
        // Third attempt: Move Right-Up.
        if ( checkCellValidity ( currentGrid , currentXCoord , currentYCoord - 1 ) ) {
            return 'R' + traverseGrid ( currentGrid , currentXCoord , currentYCoord - 1 , 'R' ) ;
        }
        // If no forward movement is possible, turn Down from the current position.
        return 'D' + traverseGrid ( currentGrid , currentXCoord , currentYCoord , 'D' ) ;
    }
}

/**
 * Determines if a specified cell within the grid is valid for traversal.
 * A cell is considered valid if its coordinates are within the grid boundaries
 * and its value signifies an open path (typically 1).
 *
 * @param {Array<Array<Number>>} targetGrid - The grid structure to check against.
 * @param {Number} targetXCoord - The horizontal coordinate of the cell to validate.
 * @param {Number} targetYCoord - The vertical coordinate of the cell to validate.
 * @returns {Number} Returns 1 if the cell is valid and traversable, otherwise returns 0.
 */
function checkCellValidity ( targetGrid , targetXCoord , targetYCoord ) {
    // Check if the vertical coordinate is out of bounds.
    if ( targetYCoord < 0 || targetYCoord >= targetGrid . length ) {
        return 0 ;
    }
    // Check if the horizontal coordinate is out of bounds for the specific row.
    if ( targetXCoord < 0 || targetXCoord >= targetGrid[ targetYCoord ] . length ) {
        return 0 ;
    }
    // Verify if the cell's content allows traversal (e.g., value is 1).
    return targetGrid[ targetYCoord ][ targetXCoord ] === 1 ;
}