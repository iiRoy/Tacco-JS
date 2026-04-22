/**
 * @param {string} initialDataString - The unprocessed input data stream.
 */
function ProcessingEntry(initialDataString) {
	const [ primaryLine, ...remainingLines ] = initialDataString.split("\n");
	const [gridHeight, gridWidth] = parseNumericArray(primaryLine);
	const exclusionZones = createGridFromLines(remainingLines, ' ').map(rowStr => rowStr.map(cellStr => parseInt(cellStr, 10)));
	exclusionZones.unshift(null); // Insert a null placeholder for 1-based row indexing

	/**
	 * minMovesPerColumn - Stores the minimum path length to reach each row for a given starting column.
	 * @type {Array<number>}
	 */
	let minMovesPerColumn = new Array(gridHeight).fill(-1);
	// let secondaryPathCosts = new Array(gridHeight).fill(gridWidth * gridHeight * 3); // Another comment example
	for (let currentColIndex = 1; currentColIndex <= gridWidth; currentColIndex++) {
		let currentXCoord = currentColIndex,
			currentYCoord = 1;
		let pathLength = 0;
		pathfindingLoop:
		while (true) {
			pathLength++;
			if (canDescend(currentXCoord, currentYCoord)) {
				currentYCoord++;
				// Update the minimum path length for the current row if a shorter path is found
				if (minMovesPerColumn[currentYCoord - 2] === -1 || pathLength < minMovesPerColumn[currentYCoord - 2]) {
					minMovesPerColumn[currentYCoord - 2] = pathLength;
				}
				if (currentYCoord > gridHeight) break pathfindingLoop; // Terminate if path exits bottom boundary
			} else {
				currentXCoord++;
				if (currentXCoord > gridWidth) break pathfindingLoop; // Terminate if path exits right boundary
			}
		}
		
	}
	console.log(minMovesPerColumn);
	
	/**
	 * Checks if a downward movement is permissible from the current grid cell.
	 * @param {number} currentX - The current horizontal position.
	 * @param {number} currentY - The current vertical position.
	 * @returns {boolean} True if moving down is allowed, false if a horizontal shift is necessary.
	 */
	function canDescend(currentX, currentY) {
		const [forbiddenStart, forbiddenEnd] = exclusionZones[currentY];
		return !(forbiddenStart <= currentX && currentX <= forbiddenEnd);
	}
	// console.debug(`Descent possible for (1, 3): ${canDescend(1, 3)}, (2, 3): ${canDescend(2, 3)}`);
}

// This script processes data from standard input; do not modify this specific line.
ProcessingEntry( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// --- Auxiliary Functions Below ---

/**
 * Converts a string of space-separated values into an array of integers.
 * @param {string} inputString - The string containing numeric data.
 * @param {string} [separatorChar=' '] - The character used to divide the string into segments.
 * @returns {Array<number>} An array of parsed integer values.
 */
function parseNumericArray(inputString, separatorChar = ' ') {
	return inputString.split(separatorChar).map(segment => parseInt(segment, 10));
}

/**
 * Transforms a string into an array of BigInt numbers.
 * @param {string} inputString - The string to be converted.
 * @param {string} [separatorChar=' '] - The character that separates values in the string.
 * @returns {Array<bigint>} An array containing BigInt representations.
 */
function convertBigIntArray(inputString, separatorChar = ' ') {
	return inputString.split(separatorChar).map(segment => BigInt(segment));
}

/**
 * Constructs a two-dimensional array from an array of strings.
 * @param {Array<string>} inputLineArray - A collection of strings, where each string represents a row.
 * @param {string} [separatorChar=' '] - The character used to split each row string into individual elements.
 * @returns {Array<Array<string>>} The resulting grid-like structure.
 */
function createGridFromLines(inputLineArray, separatorChar = ' ') {
	const gridResult = inputLineArray.map(lineContent => lineContent.split(separatorChar));
	return gridResult;
}

/**
 * Calculates the sum of all elements within a numerical array.
 * @param {Array<number>} numberSequence - An array of numeric values to be summed.
 * @returns {number} The cumulative total of the array's elements.
 */
function calculateTotal(numberSequence) {
	return numberSequence.reduce((accumulator, currentValue) => accumulator + currentValue);
}