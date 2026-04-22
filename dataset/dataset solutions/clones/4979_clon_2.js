function ExecuteProcessing( dataStream )
{
	// Deconstruct the incoming raw data into an array of individual line segments.
	const lineFragments = dataStream.split( '\n' ) ;

	// From the very first line, extract the dimensions of the conceptual grid.
	const dimensionTokens = lineFragments[0].split( ' ' ) ;
	const gridHeight = Number.parseInt( dimensionTokens[0], 10 ) ;
	const gridWidth  = Number.parseInt( dimensionTokens[1], 10 ) ;

	/*
	 * Prepare a collection to hold the final tally of neighbor counts.
	 * The index of this array directly maps to the quantity of active
	 * neighbors observed within a 3x3 window (ranging from 0 to 9).
	 * For instance, `resultTally[k]` will store how many 3x3 windows
	 * possess exactly 'k' activated cells.
	 */
	var resultTally = new Array( 10 ) ;
	resultTally.fill( 0 ) ; // Initialize all count slots to zero.

	// The initial state: all eligible 3x3 sub-grids have zero active cells.
	// An eligible sub-grid's center must not be on the outermost perimeter.
	resultTally[0] = ( gridHeight - 2 ) * ( gridWidth - 2 ) ;

	// A quick exit condition: if the input contains only the dimension line,
	// no cells were ever marked active. Output the baseline and complete.
	if ( lineFragments.length === 1 )
	{
		console.log( resultTally.join( '\n' ) ) ;
		return ;
	}

	// Forge a two-dimensional boolean matrix to represent the grid's state.
	// Each cell's value indicates whether it is currently 'active' or not.
	let cellActivationMap = new Array( gridHeight ) ;
	for ( let currentR = 0 ; currentR < gridHeight ; ++currentR )
	{
		cellActivationMap[currentR] = new Array( gridWidth ) ;
		cellActivationMap[currentR].fill( Boolean(0) ) ; // Initially, every cell is inactive.
	}

	let currentCoordinates ; // Placeholder for the coordinates of the cell being activated.
	let activeNeighborCount ; // Accumulator for activated cells within a 3x3 window.

	// Process each subsequent line in the input, as each defines a cell to activate.
	for ( let lineIndex = 1 ; lineIndex < lineFragments.length ; lineIndex++ )
	{
		// Parse the coordinate pair for the cell to be marked active.
		currentCoordinates = lineFragments[lineIndex].split( ' ' ) ;

		// Convert string coordinates to numbers and adjust for zero-based indexing.
		[ 0, 1 ].forEach( coordPartIndex => {
			currentCoordinates[coordPartIndex] = Number.parseInt( currentCoordinates[coordPartIndex], 10 ) - 1 ;
		} ) ;

		// Mark the designated cell as active in our grid map.
		cellActivationMap[currentCoordinates[0]][currentCoordinates[1]] = Boolean(1) ;

		// Now, assess the impact of this newly activated cell on surrounding 3x3 sub-grids.
		// An activated cell can influence up to nine distinct 3x3 windows.
		// `rowOffset` and `colOffset` here define the relative position of the
		// activated cell with respect to the center of a potential 3x3 window.
		[ -1, 0, 1 ].forEach( rowOffset => {
			[ -1, 0, 1 ].forEach( colOffset => {
				const windowCoreRow = currentCoordinates[0] + rowOffset ;
				const windowCoreCol = currentCoordinates[1] + colOffset ;

				// Validate if the computed 3x3 window's core (center) falls within
				// the 'inner' bounds of the grid. This means excluding the outermost
				// single-unit border cells.
				const isCorePositionValid = (
					   ( windowCoreRow >= 1 )
					&& ( windowCoreRow < gridHeight - 1 )
					&& ( windowCoreCol >= 1 )
					&& ( windowCoreCol < gridWidth - 1 )
				) ;

				if ( isCorePositionValid )
				{
					activeNeighborCount = 0 ; // Reset for the current 3x3 window evaluation.

					// Traverse the 3x3 area centered at `windowCoreRow, windowCoreCol`.
					// `innerRowDelta` and `innerColDelta` are relative to the window's core.
					[ -1, 0, 1 ].forEach( innerRowDelta => {
						[ -1, 0, 1 ].forEach( innerColDelta => {
							const targetRow = windowCoreRow + innerRowDelta ;
							const targetCol = windowCoreCol + innerColDelta ;

							// If the cell at `(targetRow, targetCol)` is active, increment our counter.
							// Boundary checks are implicitly handled by `isCorePositionValid`
							// ensuring the 3x3 window is entirely within the grid.
							if ( cellActivationMap[targetRow][targetCol] )
							{
								activeNeighborCount++ ;
							}
						} ) ;
					} ) ;

					// Update the global result tallies.
					// Since one cell in this window just became active, its neighbor count
					// increased by one. We decrement the count for the previous state
					// (`activeNeighborCount - 1`) and increment for the new state (`activeNeighborCount`).
					resultTally[activeNeighborCount - 1]-- ;
					resultTally[activeNeighborCount]++ ;
				}
			} ) ;
		} ) ;
	}

	// Emit the final computed counts, each isolated on its own line.
	console.log( resultTally.join( '\n' ) ) ;
}

/*
 * This concluding segment is responsible for orchestrating the standard
 * input and output mechanisms. It fetches all data from the standard
 * input stream in one go and subsequently invokes the primary processing
 * function (`ExecuteProcessing`) with the acquired data.
 * Modifications to this particular block are generally discouraged.
 */
ExecuteProcessing( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;