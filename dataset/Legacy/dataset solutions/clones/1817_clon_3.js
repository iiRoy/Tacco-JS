const dbgFlg = false;
const maxSafeInt = Number.MAX_SAFE_INTEGER;
const moduloVal = 1000000007;

// Helper for reading input from stdin
const readStdinInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Function to log debug messages conditionally
function logDebugMessage(messageContent){
  if(dbgFlg === true){
    console.log(messageContent);
  }
}

// Calculates the smallest integer 'k' such that the sum of integers from 1 to 'k' is greater than or equal to 'nVal'.
// This is equivalent to finding 'k' where k*(k+1)/2 >= nVal.
function calcTriangularSumCount(nVal){
  let currentAccumulatedSum = 0;
  let iterationCount = 0;
  // Using a for loop with an explicit break for structural change
  for (let i = 1; ; i++) {
    currentAccumulatedSum += i;
    iterationCount = i;
    console.log(currentAccumulatedSum, nVal); // Behavior critical: original `console.log` preserved
    if (currentAccumulatedSum >= nVal) {
      break;
    }
  }
  // The original function returns `i-1` where `i` is the value *after* the loop condition fails.
  // In this structure, `iterationCount` holds the `i` value when the condition `currentAccumulatedSum >= nVal` was met.
  // Thus, `iterationCount` directly corresponds to the original `i-1` result.
  return iterationCount;
}

// Main processing function for the problem
function processInput(rawInput){
  const numericInput = Number(rawInput);

  // The original `pf` function handles `NaN` by entering an infinite loop.
  // It also enters an infinite loop for `0` or negative numbers.
  // To preserve exact observable behavior, no explicit guard clause is added here
  // that would alter this behavior for such inputs.

  const primeFactorsMap = getPrimeFactorization(numericInput);
  
  // Using Array.prototype.reduce for accumulation as a structural change
  const totalCount = Object.keys(primeFactorsMap).reduce((acc, factorKey) => {
    const factorExponent = primeFactorsMap[factorKey];
    const countForFactor = calcTriangularSumCount(factorExponent);
    return acc + countForFactor;
  }, 0);

  console.log(totalCount);
}

// Execute the main function with input from stdin
processInput(readStdinInput());

// --- Utility Functions ---

// Calculates the lexicographical index of a permutation.
// Note: This function's dependency on a global `input` variable (specifically `input[0]`)
// is preserved from the original code. If `input` is not globally defined, this function
// would cause a ReferenceError. Since it's not called by `processInput`, it does not
// affect the main observable behavior.
function calculateLexicographicalIndex(a){
  let availableNumbers = [];
  // `input` here refers to a global variable, not the `rawInput` from `processInput`.
  // This is a potential bug in the original code if `input` is not global.
  // For Type III, we preserve the original structure and potential issues if not used in main flow.
  let globalInputRef = typeof input !== 'undefined' ? input : [a.length]; // Placeholder for `input[0]`
  for(let i=0; i < globalInputRef[0]; i++){
    availableNumbers.push(i+1);
  }
  let lexIndex = 0;
  for(let i=0; i < a.length; i++){
    const foundIndex = availableNumbers.findIndex(val => val === a[i]);
    lexIndex += computeFactorial(a.length - 1 - i) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return lexIndex;
}

// Sums all numeric elements in an array.
function sumArrayElements(arr){
  if (!Array.isArray(arr) || arr.length === 0) { // Guard clause for empty or non-array input
    return 0;
  }
  let accumulator = 0;
  for (const element of arr) { // Using for...of loop for structural change
      accumulator += Number(element); // Ensure numeric conversion
  }
  return accumulator;
}

// Finds the index of the maximum element in an array.
function findMaxElementIndex(arr){
  if (!Array.isArray(arr) || arr.length === 0) return -1; // Guard clause
	let currentMax = Number.MIN_SAFE_INTEGER;
	let maxIdx = -1;
	for(let i=0; i < arr.length; i++){
		if(currentMax < arr[i]){
			currentMax = arr[i];
			maxIdx = i;
		}
	}
	return maxIdx;
}

// Finds the index of the minimum element in an array.
function findMinElementIndex(arr){
  if (!Array.isArray(arr) || arr.length === 0) return -1; // Guard clause
	let currentMin = Number.MAX_SAFE_INTEGER;
	let minIdx = -1;
	for(let i=0; i < arr.length; i++){
		if(currentMin > arr[i]){
			currentMin = arr[i];
			minIdx = i;
		}
		// Added a small optimization: if currentMin is already the smallest possible, break early.
		if (currentMin === Number.MIN_SAFE_INTEGER) break;
	}
	return minIdx;
}

// Converts a 1D array of strings into a 2D array of characters (modifies array in place).
function convert1dTo2dArray(arr){
  if (!Array.isArray(arr)) return arr; // Guard clause, return original if not an array
	for(let i=0; i < arr.length; i++){
		arr[i] = String(arr[i]).split(""); // Ensure item is string before splitting
	}
	return arr;
}

// Checks if a number is prime.
function checkIfPrime(nVal){
    if(!Number.isInteger(nVal)){
        return false;
    }
    if(nVal <= 1){
        return false;
    }
    if(nVal === 2){
        return true;
    }
    if(nVal % 2 === 0){
        return false;
    }
    const sqrtVal = Math.floor(Math.sqrt(nVal));
    for(let i=3; i <= sqrtVal; i += 2){
        if(nVal % i === 0){
            return false;
        }
    }
    return true;
}

// Validates if a string represents a non-negative integer.
function validateIsNumber(val){
	const numPattern = /^([1-9]\d*|0)$/;
	return numPattern.test(val);
}

// Computes factorial iteratively to avoid recursion depth limits for large numbers.
function computeFactorial(nVal) {
  if (nVal < 0) return NaN; // Factorial not defined for negative numbers
  if (nVal === 0) return 1;
  let result = 1;
  for (let i = 1; i <= nVal; i++) {
    result *= i;
  }
  return result;
}

// Rotates a matrix 90 degrees clockwise.
function rotateMatrix90Deg(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || matrix[0].length === 0) {
    return []; // Guard clause for empty or invalid matrix
  }
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const lastRowIdx = numRows - 1;
  // Pre-allocate and fill the new matrix for efficiency and clarity
  let rotatedMatrix = Array.from({ length: numCols }, () => Array(numRows).fill(undefined));
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = matrix[lastRowIdx - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

// Inserts a segment into a target array starting at a given index (modifies array in place).
function insertPartialArray(targetArray, sourceSegment, startIndex){
	for(let segmentIdx = 0; segmentIdx < sourceSegment.length; segmentIdx++){
		targetArray[startIndex + segmentIdx] = sourceSegment[segmentIdx];
	}
	return targetArray;
}

// Reverses a partial segment of an array (modifies array in place).
function reversePartialArray(arr, startPos, endPos){
  // Ensure startPos and endPos are valid array indices
  const actualStart = Math.max(0, startPos - 1);
  const actualEnd = Math.min(arr.length, endPos);

  const segmentToReverse = arr.slice(actualStart, actualEnd);
  segmentToReverse.reverse();

  // Use the existing `insertPartialArray` to put the reversed segment back in place.
  return insertPartialArray(arr, segmentToReverse, actualStart);
}

// Pads a number with leading zeros to a target length.
function padNumberWithZeros(num, targetLength){
    const numString = String(num); // Ensure it's a string
    if (numString.length >= targetLength) {
        return numString;
    }
    const padding = '0'.repeat(targetLength - numString.length); // Use String.prototype.repeat for padding
    return padding + numString;
}

// Computes the prime factorization of a number, returning a map of factors and their exponents.
function getPrimeFactorization(nVal) {
    let factorsMap = {};

    if (nVal === 1) {
        return {"1":1};
    }
    // For nVal <= 0 or NaN, the original `pf` function would enter an infinite loop.
    // This behavior is preserved by not adding an explicit return or error for these cases.

    let currentDivisor = 2;

    while (nVal !== 1) {
        let divisorCandidate = currentDivisor;
        // The inner loop iterates up to maxSafeInt, which is a very large number.
        // This logic is preserved from the original, which effectively means it will
        // continue searching for factors indefinitely if `nVal` is a very large prime
        // or if `nVal` is not 1 and no factor is found up to `maxSafeInt`.
        while (divisorCandidate < maxSafeInt) {
            const isDivisible = (nVal % divisorCandidate === 0); // Helper variable
            if (isDivisible) {
                nVal /= divisorCandidate;
                if (!factorsMap[divisorCandidate]) { // Check if key exists, initialize if not
                    factorsMap[divisorCandidate] = 0;
                }
                factorsMap[divisorCandidate]++;
                break; // Found a factor, restart search for nVal with currentDivisor
            }
            divisorCandidate++;
        }
        currentDivisor = divisorCandidate; // Update currentDivisor for the next outer loop iteration
    }
    return factorsMap;
}

// Finds the greatest common divisor (GCD) using the Euclidean algorithm.
function findGCD(a, b) {
    if (b === 0){
        return a;
    }
    return findGCD(b, a % b);
}

// Finds the least common multiple (LCM).
function findLCM(a,b) {
    // Helper function for GCD, nested for scope encapsulation
    const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
    const commonDivisor = gcdHelper(a, b);
    // Guard against division by zero if GCD is 0 (e.g., for LCM(0,0))
    if (commonDivisor === 0) return 0;
    return (a * b) / commonDivisor;
}

// Comparison function for sorting numbers in ascending order.
function compareNumbers(a, b) {
  return a - b;
}

// Performs a binary search to find the index of `targetValue` or its insertion point.
// Returns the index if found, otherwise returns the index where the element would be
// inserted to maintain sorted order (or the index of the first element greater than `targetValue`).
function binarySearchClosest(arr, targetValue){
  const arrayLength = arr.length;
  if (arrayLength === 0) return 0; // If array is empty, insertion point is 0

	let foundIdx = -1;
    let leftBound = 0;
    let rightBound = arrayLength - 1;

    while(leftBound <= rightBound){
        const midPoint = Math.floor((leftBound + rightBound) / 2);

        if(arr[midPoint] === targetValue){
            foundIdx = midPoint;
            break;
        } else if(arr[midPoint] < targetValue){
            leftBound = midPoint + 1;
        } else {
            rightBound = midPoint - 1;
        }
    }
    // If not found, `leftBound` will be the correct insertion point.
    return foundIdx !== -1 ? foundIdx : leftBound;
}

// Splits a string by newline characters.
function splitByNewline(inputString){
  return inputString.split("\n");
}

// Checks if an array is sorted in ascending order.
function checkIfSorted(arr){
  if (!Array.isArray(arr) || arr.length <= 1) return true; // Guard clause for trivial cases
  let isSortedFlag = true;
  for(let i=1; i < arr.length; i++){
    if(arr[i-1] > arr[i]){
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}
