/**
 * @param {Text} initialText Incoming text data.
 */
function ProcessInput ( initialText ) {
	const [ primaryLine, ...remainingLines ] = initialText . split ( '\n' ) ;
	const [ heightVal, widthVal ] = convertStringToArrayOfNumbers ( primaryLine ) ;
	const gridData = createTwoDimensionalArray ( remainingLines, ' ' ) . map ( rowStr => rowStr . map ( cellStr => parseInt ( cellStr, 10 ) ) ) ;
	gridData . unshift ( null ) ; /* Prepend null to align indices */

	/**
	 * pathLengths
	 * @type NumericSequence
	 */
	let pathLengths = new Array ( heightVal ) . fill ( -1 ) ;
	// Initialize a tracking array for path lengths.
	for ( let currentColumn = 1 ; currentColumn <= widthVal ; currentColumn++ ) {
		let currentXPos = currentColumn , currentYPos = 1 ;
		let stepCount = 0 ;
		pathTraversalLoop: while ( true ) {
			stepCount++ ;
			if ( canMoveDownward ( currentXPos, currentYPos ) ) {
				currentYPos++ ;
				// Check if this path is shorter or if it's the first path found for this position.
				if ( pathLengths [ currentYPos - 2 ] === -1 || stepCount < pathLengths [ currentYPos - 2 ] ) {
					pathLengths [ currentYPos - 2 ] = stepCount ;
				}
			} else {
				currentXPos++ ;
			}

			if ( currentXPos > widthVal ) break pathTraversalLoop ; // Exit the inner traversal loop.
		}
		
	}
	console . log ( pathLengths ) ;
	
	
	/**
	 * Determines if a downward movement is permitted from the current position.
	 * @param {number} currentXPos The current X-coordinate.
	 * @param {number} currentYPos The current Y-coordinate.
	 * @returns {boolean} True if movement downwards is allowed, false otherwise.
	 */
	function canMoveDownward ( currentXPos, currentYPos ) {
		const [ lowerBound, upperBound ] = gridData [ currentYPos ] ;
		return ! ( lowerBound <= currentXPos && currentXPos <= upperBound ) ;
	}
	/* Example usage of canMoveDownward function:
	console.log(canMoveDownward(1, 3), canMoveDownward(2, 3), canMoveDownward(3, 3), canMoveDownward(4, 3));
	*/
}

/* Do not modify anything below this line (reads from standard input and invokes ProcessInput) */
ProcessInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;

// --- Auxiliary Functions Below ---

/**
 * Transforms a text string into an array of integers.
 * @param {Text} inputString The string to be parsed.
 */
function convertStringToArrayOfNumbers ( inputString, separatorChar = ' ' ) {
	return inputString . split ( separatorChar ) . map ( s => parseInt ( s, 10 ) ) ;
}

/**
 * Converts a text string into an array of BigInt values.
 * @param {Text} inputString The string for conversion.
 */
function transformToBigIntArray ( inputString, separatorChar = ' ' ) {
	return inputString . split ( separatorChar ) . map ( s => BigInt ( s ) ) ;
}

/**
 * Produces a 2D array from an array of strings.
 * @param {StringCollection} stringCollection An array of string representations.
 * @param {Text} separatorChar The character used for splitting.
 */
function createTwoDimensionalArray ( stringCollection, separatorChar = ' ' ) {
	const outputMatrix = stringCollection . map ( lineContent => lineContent . split ( separatorChar ) ) ;
	return outputMatrix ;
}

/**
 * Computes the sum of elements in a numeric array.
 * @param {NumericArray} numberArray An array containing numbers.
 */
function calculateTotal ( numberArray ) {
	return numberArray . reduce ( ( accumulator, currentValue ) => accumulator + currentValue ) ;
}