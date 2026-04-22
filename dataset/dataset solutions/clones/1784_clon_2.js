function* inputDataIterator ( ) {
    const rawInputContent = require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf-8" ) .trim ( ) .split ( /\n|\s/ ) ;
    yield* rawInputContent ;
}
function fetchMultipleTokens ( countToFetch , inputSourceIterator ) {
    const activeIterator = inputSourceIterator || this.sharedIterator || ( this.sharedIterator = inputDataIterator ( ) ) ;
    const collectedTokens = [ ] ;
    for ( let indexVar = 0 ; indexVar < countToFetch ; indexVar += 1 ) {
        collectedTokens.push ( activeIterator.next ( ) .value ) ;
    }
    return collectedTokens ;
}

( ( ) => {
    // Read grid dimensions and maximum step length.
    const [ gridHeight , gridWidth , maxJumpLength ] = fetchMultipleTokens ( 3 ) .map ( itemString => parseInt ( itemString ) ) ;
    // Read start and target coordinates, adjusting to zero-based indexing.
    const [ startCoordX , startCoordY , targetCoordX , targetCoordY ] = fetchMultipleTokens ( 4 ) .map ( itemString => parseInt ( itemString ) - 1 ) ;

    // Initialize the character grid from input.
    const characterGrid = [ ] ;
    for ( let rowIndex = 0 ; rowIndex < gridHeight ; rowIndex += 1 ) {
        const currentLineChars = fetchMultipleTokens ( 1 ) [ 0 ] .split ( '' ) ;
        characterGrid.push ( [ ...currentLineChars ] ) ;
    }

    // Initialize the distance matrix for BFS.
    const distanceMatrix = [ ] ;
    for ( let rowIter = 0 ; rowIter < gridHeight ; rowIter += 1 ) {
        distanceMatrix.push ( [ ] ) ;
        for ( let colIter = 0 ; colIter < gridWidth ; colIter += 1 ) {
            if ( characterGrid [ rowIter ] [ colIter ] === '#' ) { // Obstacle character
                distanceMatrix [ rowIter ] .push ( -99 ) ; // Mark obstacles with a distinct negative value.
            } else {
                distanceMatrix [ rowIter ] .push ( undefined ) ; // Mark unvisited cells as undefined.
            }
        }
    }

    // Set starting position distance to 0 and add to the queue.
    distanceMatrix [ startCoordX ] [ startCoordY ] = 0 ;
    let searchFrontier = [ [ startCoordX , startCoordY ] ] ;

    // Helper to safely update a cell's value in the distance matrix.
    const updateGridCell = ( gridX , gridY , newValue ) => {
        if ( gridX >= 0 && gridY >= 0 && gridX < gridHeight && gridY < gridWidth ) {
            distanceMatrix [ gridX ] [ gridY ] = newValue ;
        }
    } ;
    // Helper to safely retrieve a cell's value from the distance matrix.
    const retrieveGridCell = ( queryX , queryY ) => {
        const rowReference = distanceMatrix [ queryX ] ;
        if ( rowReference !== undefined ) { // Ensure row exists.
            return rowReference [ queryY ] ;
        }
        return undefined; // Return undefined for out-of-bounds access.
    } ;

    // Debugging utility to print the matrix.
    const printCurrentMatrix = ( ) => {
        console.log ( ) ;
        for ( const matrixRow of distanceMatrix ) {
            console.log ( matrixRow ) ;
        }
    } ;

    // Main BFS loop.
    while ( true ) {
        const currentPosition = searchFrontier.shift ( ) ; // Dequeue the next position.
        if ( !currentPosition ) {
            break ; // If queue is empty, no more reachable cells.
        }

        const [ currX , currY ] = currentPosition ;
        const nextDistanceValue = retrieveGridCell ( currX , currY ) + 1 ;

        // Check if the target is reached.
        if ( currX === targetCoordX && currY === targetCoordY ) {
            break ;
        }

        // Explore moves in positive X direction (down).
        for ( let stepCount = 1 ; stepCount <= maxJumpLength ; stepCount += 1 ) {
            const nextXPos = currX + stepCount ;
            const nextYPos = currY ;
            // Stop if obstacle or out-of-bounds.
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined || retrieveGridCell ( nextXPos , nextYPos ) === -99 ) {
                break ;
            }
            // If cell is unvisited, update its distance and enqueue.
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined ) {
                updateGridCell ( nextXPos , nextYPos , nextDistanceValue ) ;
                searchFrontier.push ( [ nextXPos , nextYPos ] ) ;
            }
        }
        // Explore moves in negative X direction (up).
        for ( let stepCount = 1 ; stepCount <= maxJumpLength ; stepCount += 1 ) {
            const nextXPos = currX - stepCount ;
            const nextYPos = currY ;
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined || retrieveGridCell ( nextXPos , nextYPos ) === -99 ) {
                break ;
            }
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined ) {
                updateGridCell ( nextXPos , nextYPos , nextDistanceValue ) ;
                searchFrontier.push ( [ nextXPos , nextYPos ] ) ;
            }
        }
        // Explore moves in positive Y direction (right).
        for ( let stepCount = 1 ; stepCount <= maxJumpLength ; stepCount += 1 ) {
            const nextXPos = currX ;
            const nextYPos = currY + stepCount ;
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined || retrieveGridCell ( nextXPos , nextYPos ) === -99 ) {
                break ;
            }
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined ) {
                updateGridCell ( nextXPos , nextYPos , nextDistanceValue ) ;
                searchFrontier.push ( [ nextXPos , nextYPos ] ) ;
            }
        }
        // Explore moves in negative Y direction (left).
        for ( let stepCount = 1 ; stepCount <= maxJumpLength ; stepCount += 1 ) {
            const nextXPos = currX ;
            const nextYPos = currY - stepCount ;
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined || retrieveGridCell ( nextXPos , nextYPos ) === -99 ) {
                break ;
            }
            if ( retrieveGridCell ( nextXPos , nextYPos ) === undefined ) {
                updateGridCell ( nextXPos , nextYPos , nextDistanceValue ) ;
                searchFrontier.push ( [ nextXPos , nextYPos ] ) ;
            }
        }
    }

    // Output the result.
    if ( retrieveGridCell ( targetCoordX , targetCoordY ) === undefined ) {
        console.log ( -1 ) ; // Target unreachable.
    } else {
        console.log ( retrieveGridCell ( targetCoordX , targetCoordY ) ) ; // Output minimum steps.
    }
} ) ( ) ;