/*
 *  This JavaScript code processes some input data.
 *  It's designed to solve a specific problem involving movement on a grid.
 */
function         Main(   raw_input   )
{

	// Split the raw input string into lines.
	// The first line is separated, and the rest go into 'trail'.
	const   [      first,      ...trail      ]    =    raw_input.split("\n")   ;

	// Convert the first line into a number array representing height and width.
	const    [ h,    w ]    =    toNumArray(first)   ;

	// Process the remaining lines to create a 2D array (matrix).
	// Each inner array element is converted to an integer.
	const arr = toMatrix(
		trail,
		' '
	).map(
		a1    =>    a1.map(
			a2    =>    parseInt(a2,    10)
		)
	)   ;


	// Prepend a 'null' element to 'arr'.
	// This is often done to make 1-based indexing easier for problem-solving.
	arr.unshift(null)   ;



	/**
	 *  This array stores the minimum move count to reach a certain y-coordinate.
	 *  Initialized with -1 to indicate unreached states.
	 *  @type {Array<number>}
	 */
	let resultK    =    new    Array(h).fill(-1)   ;

	// An example of a commented-out line that might have been used during development.
	// let minResultK = new Array(h).fill(w * h * 2);


	// The main loop iterates through possible starting positions 'n' along the width 'w'.
	for    (    let    n    =    1    ;    n    <=    w    ;    n++    )
	{

		let x    =    n   ;
		let y    =    1   ;
		let moveCnt    =    0   ;


		// This inner loop simulates movement from a starting point (x, y).
		out:    while    (    true    )
		{
			moveCnt++   ; // Increment move counter for each step.

			// Check if movement downwards is allowed from the current position.
			if    (    canGoDown(x,    y)    )
			{
				y++   ; // Move down.

				// Update resultK if this path is shorter or it's the first time reaching this y-coordinate.
				if    (    resultK[y    -    2]    ===    -1    ||    moveCnt    <    resultK[y    -    2]    )
				{
					resultK[y    -    2]    =    moveCnt   ;
				}
			}
			else
			{
				x++   ; // Move right if cannot go down.
			}


			// If x exceeds the grid width, break out of the simulation loop.
			if    (    x    >    w    )
			{
				break    out   ;
			}
		}

	}

	// Output the final computed result array to the console.
	console.log(resultK)   ;


	/**
	 *  Determines if it's possible to move down from a given (x, y) coordinate.
	 *  This logic depends on the 'arr' matrix which defines forbidden ranges.
	 *  @param {number} x - The current x-coordinate.
	 *  @param {number} y - The current y-coordinate.
	 *  @returns {boolean} - True if movement down is allowed, false otherwise.
	 */
	function    canGoDown(   x,    y   )
	{
		const    [    from,    to    ]    =    arr[y]   ;
		return    !(    from    <=    x    &&    x    <=    to    )   ;
	}

	// Another commented-out line for debugging purposes.
	// console.log(canGoDown(1, 3, arr), canGoDown(2, 3, arr), canGoDown(3, 3, arr), canGoDown(4, 3, arr));

}


// * This section should not be edited (it handles standard input/output and calls Main).
Main(    require("fs").readFileSync("/dev/stdin",    "utf8")    )   ;


////////////////////////////////////////////////////////////////////////////////
//
//               U T I L I T Y    F U N C T I O N S    S E C T I O N
//
////////////////////////////////////////////////////////////////////////////////


/**
 * Converts a string into an array of numbers.
 * @param {String} str - The input string to convert.
 * @param {String} [delimitor=' '] - The delimiter character to split the string by.
 * @returns {Array<number>} An array containing parsed integers.
 */
function    toNumArray(   str,    delimitor    =    ' '   )
{
	return    str.split(delimitor).map(s    =>    parseInt(s,    10))   ;
}


/**
 * Converts a string into an array of BigInts.
 * This is useful for handling very large integer values.
 * @param {String} str - The input string.
 * @param {String} [delimitor=' '] - The delimiter character.
 * @returns {Array<BigInt>} An array of BigInt values.
 */
function    toBitIntArray(   str,    delimitor    =    ' '   )
{
	return    str.split(delimitor).map(s    =>    BigInt(s))   ;
}


/**
 * Transforms an array of strings into a 2-dimensional array (matrix).
 * Each string in the input array represents a row in the matrix.
 * @param {Array<String>} array - A 1D array where each element is a string representing a row.
 * @param {String} [delimitor=' '] - The delimiter used to split each row string.
 * @returns {Array<Array<String>>} A 2D array (matrix) of strings.
 */
function    toMatrix(   array,    delimitor    =    ' '   )
{
	const    result    =    array.map(v    =>    v.split(delimitor))   ;
	return    result   ;
}


/**
 * Calculates the sum of all numbers in a given array.
 * @param {Array<Number>} n - An array of numerical values.
 * @returns {Number} The total sum of the array elements.
 */
function    sum(   n   )
{
	return    n.reduce((a,    b)    =>    a    +    b)   ;
}