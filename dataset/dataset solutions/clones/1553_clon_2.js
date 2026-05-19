function ProcessInput(initialData) {
	// Split the input string into lines
	const [ countStr, numListStr ] = initialData.split("\n");
	
	// Convert the second line to an array of BigInts
	const bigIntArr = convertStrToNumArr(numListStr).map(item => BigInt(item));
	
	// Define the modulo constant as a BigInt
	const MODULO_VAL = BigInt(10 ** 9 + 7);

	// Initialize the running total
	let totalSum = 0n;
	
	// Iterate through the array with nested loops to calculate pairwise products
	for (let idx1 = 0; idx1 < bigIntArr.length; idx1++) {
		const val1 = bigIntArr[idx1]; // Get the first number
		
		for (let idx2 = idx1 + 1; idx2 < bigIntArr.length; idx2++) {
			const val2 = bigIntArr[idx2]; // Get the second number
			
			totalSum += val1 * val2; // Add the product to the total
		}
	}
	
	// Apply the modulo operation to the final sum
	totalSum %= MODULO_VAL;
	
	// Output the result as a string
	console.log(totalSum.toString());
}

// This line should not be modified (reads from standard input and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Utility functions section ---

/**
 * Converts a string into an array of numbers.
 * @param {String} inputStr The string to convert.
 * @param {String} separatorChar The character used to split the string (default is space).
 */
function convertStrToNumArr(inputStr, separatorChar = ' ') {
	return inputStr.split(separatorChar).map(sVal => parseInt(sVal, 10));
}

/**
 * Transforms a string into an array of BigInts.
 * @param {String} inputStr The string to process.
 * @param {String} separatorChar The delimiter for splitting the string (default is space).
 */
function parseToBigIntArr(inputStr, separatorChar = ' ') {
	return inputStr.split(separatorChar).map(sVal => BigInt(sVal));
}

/**
 * Creates a 2D array from an array of strings.
 * @param {Array<String>} strArray An array where each element is a string representing a row.
 * @param {String} separatorChar The character used to split each row string.
 */
function create2DArray(strArray, separatorChar = ' ') {
	const resultMatrix = strArray.map(rowStr => rowStr.split(separatorChar));
	return resultMatrix;
}

/**
 * Computes the sum of all numbers in an array.
 * @param {Array<Number>} numericArr An array of numbers.
 */
function calculateArraySum(numericArr) {
	return numericArr.reduce((accumulator, currentVal) => accumulator + currentVal);
}
