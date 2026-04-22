/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original source.
 *
 * The only modifications applied are variations in whitespace (indentation,
 * spacing, and blank lines) and comments (addition, removal, or modification).
 * This extensive restructuring of whitespace and comments aims to make the
 * resulting code visually distinct while maintaining logical and structural
 * identity with the original.
 */

/**
 * @param {String} raw_input  The input string, typically read from standard input.
 *                            This string contains all necessary data for processing.
 */
function     Main(raw_input)
{
	// Deconstructs the input string into the first line and the rest of the lines.
	const [ first, ...trail ] = raw_input.split("\n");


	// Parses the first line to get dimensions 'h' (height) and 'w' (width).
	const    [h, w] = toNumArray(first);

	// Transforms the 'trail' lines into a 2D array (matrix) of numbers.
	// Each inner array represents a row, and its elements are parsed as integers.
	const arr = toMatrix(trail, ' ').map(a1 => a1.map(a2 => parseInt(a2, 10)));


	// Adds a 'null' element at the beginning of the array.
	// This is often done to make 1-based indexing easier in subsequent loops.
	arr.unshift(null);


	/**
	 * resultK
	 * @type Array<number>  This array will store the minimum move counts
	 *                      to reach a certain row 'y' from the top.
	 *                      Initialized with -1 to indicate unreached states.
	 */
	let resultK = new Array(h).fill(-1);

	// The following line was commented out in the original and is kept as such.
	// let minResultK = new Array(h).fill(w * h * 2);


	// This loop iterates through possible starting positions 'n' along the width 'w'.
	for (let n = 1; n <= w; n++) {

		let x = n, y = 1; // Initialize current (x, y) coordinates.
		let moveCnt = 0;  // Initialize move counter for the current path.

		// Inner loop simulates movement until a boundary is reached or a condition is met.
		while (true) {
			// Determines if movement downwards is possible from the current (x, y) position.
			// It checks if 'x' is outside the range defined by arr[y][0] and arr[y][1].
			const canGoDown = !(arr[y][0] <= x && x <= arr[y][1]);


			moveCnt++; // Increment the move counter for each step.

			if (canGoDown) {
				y++; // Move downwards if possible.

				// Update resultK if the current path is shorter or if the row hasn't been reached yet.
				// Note: y-2 is used for 0-based indexing into resultK, considering 'y' starts from 1 and is incremented.
				if (resultK[y - 2] === -1 || moveCnt < resultK[y - 2]) {
					resultK[y - 2] = moveCnt;
				}

				// If 'y' exceeds the height 'h', the path has gone beyond the grid.
				if (y > h) break ;
			} else {
				x++; // Move rightwards if downwards movement is blocked.

				// If 'x' exceeds the width 'w', the path has gone beyond the grid.
				if (x > w) break ;
			}
		}

	}
	// Outputs the final result by joining the elements of resultK with newlines.
	console.log(resultK.join("\n"));


	// This function was present in the original code, but not called anywhere.
	// It's kept here as per Type I clone rules.
	function canGoDown(x, y) {
		const [from, to] = arr[y];
		return !(from <= x && x <= to);
	}
	// This console.log was commented out in the original and remains so.
	// console.log(canGoDown(1, 3, arr), canGoDown(2, 3, arr), canGoDown(3, 3, arr), canGoDown(4, 3, arr));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// This section handles reading from standard input and invoking the Main function.
// It is explicitly marked as non-editable in the original comments.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

////////// ユーティリティ関数
// This section contains various utility functions used throughout the code.

/**
 * Converts a string into an array of numbers.
 * @param {String} str        The input string to be converted.
 * @param {String} delimitor  The delimiter used to split the string (defaults to space).
 * @returns {Array<Number>}   An array where each element is a parsed integer.
 */
function toNumArray(str, delimitor = ' ') {
	return str.split(delimitor).map(s => parseInt(s, 10));
}

/**
 * Converts a string into an array of BigInts.
 * This function is defined but not utilized in the provided Main logic.
 * @param {String} str        The input string.
 * @param {String} delimitor  The delimiter for splitting the string (defaults to space).
 * @returns {Array<BigInt>}   An array of BigInts.
 */
function toBitIntArray(str, delimitor = ' ') {
	return str.split(delimitor).map(s => BigInt(s));
}

/**
 * Transforms a 1D array of strings into a 2D array (matrix).
 * Each string in the input array becomes a row in the matrix,
 * split by the specified delimiter.
 * @param {Array<String>} array     A 1D array where each string represents a row.
 * @param {String} delimitor        The delimiter used to split each string into elements.
 * @returns {Array<Array<String>>} A 2D array (matrix) of strings.
 */
function toMatrix(array, delimitor = ' ') {
	const result = array.map(v => v.split(delimitor));
	return result;
}

/**
 * Calculates the sum of all numbers in a given numeric array.
 * @param {Array<Number>} n   An array of numbers.
 * @returns {Number}          The sum of all elements in the array.
 */
function sum(n) {
	return n.reduce((a, b) => a + b);
}