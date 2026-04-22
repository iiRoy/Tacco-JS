let globalRawLines ;

/*
 * Utility Routines Overview:
 *  - convertStringsToCharMatrix(stringList): Transforms an array of strings into a 2D array of individual characters.
 *  - determinePrimeFactors(targetValue): Computes the prime factorization of a number, returning counts in an object.
 *  - greatestCommonDivisor(valX, valY): Calculates the largest common divisor of two integers using Euclidean algorithm.
 *  - leastCommonMultiple(firstNum, secondNum): Determines the smallest common multiple for two integers.
 *  - numericDifference(operandA, operandB): Returns the arithmetic difference operandA - operandB; useful for array sorting.
 *  - checkPrimality(candidateNumber): Ascertains if a given integer is a prime number, returning a boolean.
 *  - isNumericValue(entity): Verifies if a string represents a valid non-negative integer using a regular expression.
 *  - calculateSum(collection): Computes the accumulated total of all numerical elements within an array.
 *  - binarySearchLargestLesserOrEqual(sortedArray, targetValue): Finds the index of the greatest element less than or equal to the target in a sorted array.
 *  - splitByNewline(sourceText): Divides a multi-line string into an array of strings at each newline character.
 *  - getNextState(stateMachine, present): A placeholder function for state transition logic, with no current implementation.
 *  - determineLexicographicalRank(permutation): Calculates the lexicographical order (rank) of a given permutation.
 *  - calculateCollectionSum(dataElements): Another function to calculate the sum of elements in a collection, structurally distinct but functionally similar to calculateSum.
 *  - traceValue(valueToTrace): Logs a specific value to the console only if the global tracing flag is active.
 *  - findMaxElementIndex(numericArray): Identifies and returns the index of the maximum numerical element within an array.
 *  - findMinElementIndex(numericArray): Identifies and returns the index of the minimum numerical element within an array.
 *  - convertStringsToCharMatrixAgain(stringList): A duplicate function definition for transforming strings to a 2D character array.
 *  - computeFactorial(inputNumber): Recursively computes the factorial of a non-negative integer.
 *  - transformToNumericMatrix(stringList): Converts an array of string representations of numbers into a 2D array of actual numbers.
 *  - rotateMatrixClockwise(matrixData): Rotates a 2D matrix 90 degrees in a clockwise direction.
 *  - injectSubArray(targetArray, sourceSegment, startIndex): Inserts a segment of values from a source array into a target array starting at a given index.
 *  - reverseArraySegment(dataCollection, startPosition, endPosition): Reverses a specific segment of an array, defined by start and end positions.
 *  - padNumberWithZeros(numberValue, desiredLength): Formats a number by padding it with leading zeros to achieve a specified total length.
 *  - computeArrayTotal(dataElements): Yet another function to calculate the sum of elements in an array, maintaining original file structure.
 *  - verifyAscendingOrder(collection): Checks whether the elements in an array are arranged in non-decreasing order.
 */

const traceEnabled = false ;
const maxVal = Number.MAX_SAFE_INTEGER ;

function ProcessInput( rawData ){
    // Split the entire raw input string into an array of lines, storing globally.
    globalRawLines = rawData.split( '\n' ) ;

    // Parse the second line of input into an array of numbers.
    let numericalList = globalRawLines[1].split( ' ' ).map( Number ) ;

    // Compute the initial total sum of the elements in the numerical list.
    let currentTotal = calculateSum( numericalList ) ;

    // Remove the first three lines from the global input array as they've been processed or are not needed.
    globalRawLines.shift() ; globalRawLines.shift() ; globalRawLines.shift() ;

    // Iterate over the remaining lines of input.
    globalRawLines.forEach( function( currentLineValue ) {
        // Parse each remaining line into a pair of numbers.
        let operationPair = currentLineValue.split( ' ' ).map( Number ) ;

        // Perform the specified calculation: current sum - (value at 0-indexed position) + (second number in pair)
        console.log( currentTotal - numericalList[ operationPair[0] - 1 ] + operationPair[1] ) ;
    } ) ;

}
// Execute the primary input processing function, reading data from standard input.
ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim() ) ;

// This function serves as a placeholder; its original implementation was empty.
function getNextState( stateMachine, present ){
    /* No operation */
}

// Determines the lexicographical rank of a permutation.
function determineLexicographicalRank( permutation ){
  let availableNumbers = [] ; // List of numbers not yet used in the permutation.
  // Assuming 'globalRawLines' is accessible and 'globalRawLines[0]' contains the count of elements.
  let firstLineQuantity = Number( globalRawLines[0] ) ;
  for ( let k = 0 ; k < firstLineQuantity ; ++k ) {
    availableNumbers.push( k + 1 ) ; // Populate with numbers 1 to N.
  }

  let cumulativeRank = 0 ; // Accumulator for the calculated rank.
  for ( let j = 0 ; j < permutation.length ; ++j ) {
    let currentElement = permutation[j] ;
    // Find the 0-based index of the current permutation element in the list of available numbers.
    let elementPosition = availableNumbers.findIndex( item => item === currentElement ) ;
    // Add (factorial of remaining elements) * (position of current element) to the rank.
    cumulativeRank += computeFactorial( permutation.length - 1 - j ) * elementPosition ;
    // Remove the current element from the available numbers list.
    availableNumbers.splice( elementPosition, 1 ) ;
  }
  return cumulativeRank ;
}

// Calculates the sum of numerical elements in a given array.
function calculateSum( collection ){
  let totalAccumulator = 0 ;
  for ( let counter = 0, collectionSize = collection.length ; counter < collectionSize ; ++counter ) {
      totalAccumulator += collection[counter] - 0 ; // Ensure numeric conversion.
  }
  return totalAccumulator ;
}

// Logs a value to the console if the global tracing flag is set to true.
function traceValue( valueToTrace ){
  if ( traceEnabled === true ) {
    console.log( valueToTrace ) ;
  }
}

// Finds the index of the maximum value within a numerical array.
function findMaxElementIndex( numericArray ){
	let largestValue = Number.MIN_SAFE_INTEGER ;
	let largestValueIndex = -1 ;
	for ( let loopIndex = 0 ; loopIndex < numericArray.length ; ++loopIndex ) {
		if ( largestValue < numericArray[loopIndex] ) {
			largestValue = numericArray[loopIndex] ;
			largestValueIndex = loopIndex ;
		}
	}
	return largestValueIndex ;
}

// Finds the index of the minimum value within a numerical array.
function findMinElementIndex( numericArray ){
	let smallestValue = Number.MAX_SAFE_INTEGER ;
	let smallestValueIndex = -1 ;
	for ( let loopCounter = 0 ; loopCounter < numericArray.length ; ++loopCounter ) {
		if ( smallestValue > numericArray[loopCounter] ) {
			smallestValue = numericArray[loopCounter] ;
			smallestValueIndex = loopCounter ;
		}
	}
	return smallestValueIndex ;
}

// Converts an array of strings into a 2D array of characters by splitting each string.
function convertStringsToCharMatrix( stringList ){
	for ( let idx = 0 ; idx < stringList.length ; ++idx ) {
		stringList[idx] = stringList[idx].split( '' ) ;
		}
	return stringList ;
}

// Checks if a given integer is a prime number.
function checkPrimality( candidateNumber ){
    if ( false === Number.isInteger( candidateNumber ) ) {
        return false ;
    }
    if ( candidateNumber <= 1 ) {
        return false ;
    }
    if ( 2 === candidateNumber ) {
        return true ;
    }
    if ( 0 === candidateNumber % 2 ) {
        return false ;
    }
    const rootCeiling = Math.floor( Math.sqrt( candidateNumber ) ) ;
    for ( let divisor = 3 ; divisor <= rootCeiling ; divisor += 2 ) {
        if ( 0 === candidateNumber % divisor ) {
            return false ;
        }
    }
    return true ;
}

// Validates if a string represents a non-negative integer using a regular expression.
function isNumericValue( entity ){
	const numericPattern = /^([1-9]\d*|0)$/ ;
	return numericPattern.test( entity ) ;
}

// A duplicate function definition for converting an array of strings into a 2D array of characters.
// This function exists to maintain the exact number of function declarations as in the original code.
function convertStringsToCharMatrixAgain( stringList ){
	for ( let idx = 0 ; idx < stringList.length ; ++idx ) {
		stringList[idx] = stringList[idx].split( '' ) ;
		}
	return stringList ;
}

// Computes the factorial of a non-negative integer recursively.
function computeFactorial( inputNumber ) {
  if ( inputNumber === 0 ) { return 1 ; }
  return inputNumber * computeFactorial( inputNumber - 1 ) ;
}

// Transforms an array of string-based rows into a 2D array of numbers.
function transformToNumericMatrix( stringList ){
	for ( let rowIdx = 0 ; rowIdx < stringList.length ; ++rowIdx ) {
    stringList[rowIdx] = stringList[rowIdx].split( ' ' ).map( Number ) ;
    }
  return stringList ;
}

// Rotates a 2D matrix 90 degrees clockwise.
function rotateMatrixClockwise( matrixData ) {
  const originalRows = matrixData.length ;
  const originalCols = matrixData[0].length ;
  const lastOriginalRowIndex = originalRows - 1 ; // For indexing from bottom up.

  let rotatedMatrix = new Array( originalCols ) ; // New matrix will have dimensions (cols x rows).
  for ( let colIndex = 0 ; colIndex < originalCols ; ++colIndex ) {
    rotatedMatrix[colIndex] = new Array( originalRows ) ;
    for ( let rowIndex = 0 ; rowIndex < originalRows ; ++rowIndex ) {
      // The element at (r, c) in the original matrix moves to (c, last_row_index - r) in the rotated matrix.
      rotatedMatrix[colIndex][rowIndex] = matrixData[ lastOriginalRowIndex - rowIndex ][ colIndex ] ;
    }
  }
  return rotatedMatrix ;
}

// Inserts a sub-array (sourceSegment) into a targetArray starting at a specified index.
function injectSubArray( targetArray, sourceSegment, startIndex ){
	for ( let targetIdx = startIndex, sourceIdx = 0 ; sourceIdx < sourceSegment.length ; ++targetIdx, ++sourceIdx ) {
		targetArray[targetIdx] = sourceSegment[sourceIdx] ;
	}
	return targetArray ;
}

// Reverses a specific segment of an array in place, defined by 1-based start and end positions.
function reverseArraySegment( dataCollection, startPosition, endPosition ){
	// Extract the segment to be reversed (slice is exclusive of endPosition).
	let segmentToReverse = dataCollection.slice( startPosition - 1, endPosition ) ;
  segmentToReverse.reverse() ; // Reverse the extracted segment.
	// Inject the reversed segment back into the original collection.
	dataCollection = injectSubArray( dataCollection, segmentToReverse, startPosition - 1 ) ;
	return dataCollection ;
}

// Pads a numerical value with leading zeros to achieve a desired string length.
function padNumberWithZeros( numberValue, desiredLength ){
    // Concatenates the number with a long string of zeros and then slices it
    // to the exact desired length from the beginning.
    return ( numberValue + '000000000000000000000000000000000' ).slice( 0, desiredLength ) ;
}

// Another function to calculate the total sum of numerical elements in an array.
// This is included to match the original code's structure with duplicate function definitions.
function computeArrayTotal( dataElements ){
    let totalSum = 0 ;
    for ( let i = 0, elementsCount = dataElements.length ; i < elementsCount ; ++i ) {
        totalSum += dataElements[i] - 0 ; // Ensure numeric type for addition.
    }
    return totalSum ;
}

// Computes the prime factorization of a given number, returning factors and their counts.
function determinePrimeFactors( targetValue ) {
    let factorCounts = {} ; // Object to store prime factors as keys and their exponents as values.

    if ( targetValue === 1 ) {
        return { "1": 1 } ; // Special case: 1 has factor 1 with exponent 1.
    }

    let currentDivisorCandidate = 2 ; // Start checking for prime factors from 2.

    while ( targetValue !== 1 ) {
        let divisorIterator = currentDivisorCandidate ;
        while ( divisorIterator < Number.MAX_SAFE_INTEGER ) {
            if ( targetValue % divisorIterator === 0 ) {
                targetValue /= divisorIterator ; // Divide target by the found factor.
                if ( !( factorCounts[divisorIterator] > 0 ) ) {
                    factorCounts[divisorIterator] = 0 ; // Initialize count if this is a new factor.
                }
                factorCounts[divisorIterator]++ ; // Increment the exponent for the factor.
                break ; // Found a factor, restart search for the next factor from the current one.
            }
            divisorIterator++ ; // Move to the next potential divisor.
        }
        currentDivisorCandidate = divisorIterator ; // Update the starting candidate for the next iteration.
    }
    return factorCounts ;
}

// Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
function greatestCommonDivisor( valX, valY ) {
    if ( valY === 0 ) {
        return valX ; // Base case: GCD(x, 0) is x.
    }
    return greatestCommonDivisor( valY, valX % valY ) ; // Recursive step.
}

// Computes the least common multiple (LCM) of two numbers.
function leastCommonMultiple( firstNum, secondNum ) {
    // Inner helper function to calculate GCD using a recursive arrow function.
    const calculateGcdHelper = ( numA, numB ) => numB ? calculateGcdHelper( numB, numA % numB ) : numA ;
    // LCM(a, b) = |a * b| / GCD(a, b).
    return ( firstNum * secondNum ) / calculateGcdHelper( firstNum, secondNum ) ;
}

// Returns the difference between two numbers (operandA - operandB), commonly used in comparison functions for sorting.
function numericDifference( operandA, operandB ) {
  return operandA - operandB ;
}

// Performs a binary search on a sorted array to find the index of the largest element
// that is less than or equal to the target value.
function binarySearchLargestLesserOrEqual( sortedArray, targetValue ){
	let foundIndex = -1 ; // Stores the index if an exact match is found.

    // Index representing the lower boundary of the search range.
    let lowerBound = 0 ;

    // Index representing the upper boundary of the search range.
    let upperBound = sortedArray.length - 1 ;

    // Continue the search as long as the lower bound does not exceed the upper bound.
    while ( lowerBound <= upperBound ) {

        // Calculate the middle index of the current search range.
        let midPoint = Math.floor( ( lowerBound + upperBound ) / 2 ) ;

        // Compare the value at the middle index with the target value.
        if ( sortedArray[midPoint] === targetValue ) {
            // If an exact match is found, record its index and exit the loop.
            foundIndex = midPoint ;
            break ;
        } else if ( sortedArray[midPoint] < targetValue ) {
            // If the middle value is less than the target, narrow the search to the right half.
            lowerBound = midPoint + 1 ;
        } else {
            // If the middle value is greater than the target, narrow the search to the left half.
            upperBound = midPoint - 1 ;
        }
    }
    // If an exact match was found, return its index; otherwise, return the lowerBound.
    // The lowerBound will be the index where the target *would* be inserted to maintain order,
    // or the index of the first element greater than the target.
    if ( foundIndex !== -1 ) return foundIndex ;
    else return lowerBound ;
}

// Splits a multi-line string into an array of individual strings, using the newline character as a delimiter.
function splitByNewline( sourceText ){
  return sourceText.split( '\n' ) ;
}

// Checks if the elements of an array are sorted in non-decreasing (ascending) order.
function verifyAscendingOrder( collection ){
  let isOrdered = true ; // Flag to indicate if the array is sorted.
  for ( let elementIndex = 1 ; elementIndex < collection.length ; ++elementIndex ) {
    // If a preceding element is greater than the current one, the array is not sorted.
    if ( collection[elementIndex - 1] > collection[elementIndex] ) {
      isOrdered = false ; // Set flag to false.
      break ; // No need to continue checking.
    }
  }
  return isOrdered ;
}