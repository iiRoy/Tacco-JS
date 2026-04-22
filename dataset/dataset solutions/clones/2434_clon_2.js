/*
 * This JavaScript program solves a combinatorial problem that involves
 * calculating binomial coefficients modulo a large prime number.
 * It processes input data to determine parameters for these calculations.
 */
function ExecuteProgram(programInput) {
	// The input string is first cleaned, then split into lines,
	// and each line is further split into space-separated values.
	programInput = programInput.trim().split("\n").map(function(lineString) {
		return lineString.split(" ");
	});

	// Define important mathematical constants for the calculation.
	var MODULUS_CONST = 1000000007; // A large prime modulus.
	var CHUNK_CONST = 100000;       // A chunk size used in modular multiplication.

	// Extract numerical values from the first line of the processed input.
	var valueA = stringToInteger(programInput[0][0], 10);
	var valueB = stringToInteger(programInput[0][1], 10);

	var finalResult = 0; // Initialize the variable to store the ultimate answer.

	// Compute intermediate problem-specific quantities.
	var sumDividedByThree = (valueA + valueB) / 3;
	var firstCandidate = (4 * valueA - 2 * valueB) / 6;
	var secondCandidate = (4 * valueB - 2 * valueA) / 6;

	// Check if the derived candidates are valid for combinatorial computation.
	// Both candidates must be non-negative, and the first must be an integer.
	if (firstCandidate >= 0 && secondCandidate >= 0 && isAnInteger(firstCandidate)) {
		// If conditions are met, proceed to calculate combinations.
		// The function returns an array, and we are interested in the first element.
		var combinationArray = calculateCombinationsModulo(sumDividedByThree, firstCandidate, 1, MODULUS_CONST, CHUNK_CONST);
		finalResult = combinationArray[0]; // Assign the relevant combination value.
	}

	// Display the computed final result to the console.
	printToConsole(finalResult);
}

/**
 * Performs modular multiplication (operandOne * operandTwo) % currentModulus.
 * This function is optimized for cases where operandTwo might be a very large number
 * by breaking it down into chunks to prevent overflow issues before the modulo operation.
 *
 * @param {number} operandOne The first number in the multiplication.
 * @param {number} operandTwo The second number in the multiplication.
 * @param {number} currentModulus The modulus value to apply.
 * @param {number} chunkDivider The size of chunks to divide operandTwo by.
 * @returns {number} The result of (operandOne * operandTwo) modulo currentModulus.
 */
function modularProduct(operandOne, operandTwo, currentModulus, chunkDivider) {
	var tempQuotient, tempRemainder, productOutput;

	// Divide operandTwo by chunkDivider to get a quotient and a remainder.
	tempQuotient = (operandTwo / chunkDivider | 0); // Integer division.
	tempRemainder = operandTwo - (tempQuotient * chunkDivider);

	// Apply modular arithmetic using the broken-down parts.
	// This ensures intermediate products don't exceed JavaScript's safe integer limit
	// before the final modulo operation.
	productOutput = (operandOne * tempQuotient % currentModulus) * chunkDivider % currentModulus + (operandOne * tempRemainder);
	productOutput %= currentModulus; // Ensure the final result is strictly within [0, currentModulus - 1].

	return productOutput;
}


/**
 * Calculates nCr (n choose r) modulo a given prime number,
 * and optionally other related binomial coefficients like (n+1 C r+1), etc.
 * It precomputes factorials, inverse factorials, and modular inverses up to a necessary limit.
 *
 * @param {number} totalItems The 'n' value for nCr.
 * @param {number} selectedItems The 'r' value for nCr.
 * @param {number} maxIterationsCount The number of consecutive nCr values to compute, starting from nCr.
 *                                    For example, if 1, only nCr is computed. If 2, nCr and n+1 C r+1.
 * @param {number} currentModulus The modulus value for all arithmetic operations.
 * @param {number} chunkDivider The chunk size used in the modularProduct function.
 * @returns {Array<number>|number} An array of computed binomial coefficients modulo currentModulus,
 *                                  or 0 if totalItems < selectedItems or either is negative.
 */
function calculateCombinationsModulo(totalItems, selectedItems, maxIterationsCount, currentModulus, chunkDivider) {
	// Initialize an array to hold the results of the binomial coefficient calculations.
	var resultsCollection = [];

	// Declare arrays for precomputed factorial values, inverse factorial values,
	// and modular inverse values.
	var factorialValues, inverseFactorialValues, modularInverseValues;

	// Initialize the first two elements for precomputation arrays.
	factorialValues = [1, 1];
	inverseFactorialValues = [1, 1];
	modularInverseValues = [0, 1];

	// Precompute factorial, inverse factorial, and modular inverse values
	// up to (totalItems + maxIterationsCount - 1).
	for (var index = 2; index < maxIterationsCount + totalItems; index++) {
		// Calculate factorial: fact[i] = fact[i-1] * i % MOD.
		factorialValues.push(factorialValues[index - 1] * index % currentModulus);

		// Calculate modular inverse using Fermat's Little Theorem or extended Euclidean algorithm.
		// inv[i] = MOD - (inv[MOD % i] * (MOD / i)) % MOD.
		modularInverseValues.push(currentModulus - modularProduct(modularInverseValues[currentModulus % index], (currentModulus / index | 0), currentModulus, chunkDivider) % currentModulus);

		// Calculate inverse factorial: invFact[i] = invFact[i-1] * inv[i] % MOD.
		inverseFactorialValues.push(modularProduct(inverseFactorialValues[index - 1], modularInverseValues[index], currentModulus, chunkDivider));
	}

	// Handle invalid inputs for combinations: n < k or any negative value.
	if (totalItems < selectedItems) return 0;
	if (totalItems < 0 || selectedItems < 0) return 0;

	// Calculate the binomial coefficients for the specified range (nCr, n+1Cr+1, etc.).
	for (var index = 0; index < maxIterationsCount; index++) {
		// The formula for nCr modulo P is: n! * (r!)^-1 * ((n-r)!)^-1 (mod P).
		// We use precomputed inverse factorials.
		var termOneProduct = modularProduct(factorialValues[totalItems + index], inverseFactorialValues[selectedItems + index], currentModulus, chunkDivider);
		var finalTermProduct = modularProduct(termOneProduct, inverseFactorialValues[totalItems - selectedItems], currentModulus, chunkDivider);
		resultsCollection.push(finalTermProduct); // Store the computed value.
	}

	return resultsCollection; // Return the array of calculated combinations.
}

// Aliases for standard JavaScript functions to match the renaming scheme.
const printToConsole = console.log;
const isAnInteger = Number.isInteger;
const stringToInteger = parseInt;
const getModule = require; // Alias for Node.js's 'require' function.


// The main program execution starts here.
// It reads input from the standard input stream (typically a file in competitive programming contexts),
// then passes it to the ExecuteProgram function.
ExecuteProgram(getModule("fileSystem").readFileSync("/dev/stdin", "utf8"));