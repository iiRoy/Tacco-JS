let receivedData = require('fs').readFileSync('/dev/stdin', 'utf8') .trim() .split('\n')

// Extract the primary number from the input and convert it to an integer
var principalValue = receivedData.shift() * 1

/**
 * Calculates all positive integer divisors for a given number.
 * The divisors are returned in ascending order.
 * @param {number} inputVal - The number for which to find divisors.
 * @returns {number[]} An array containing all divisors of inputVal.
 */
var retrieveDivisors = function ( inputVal ) {
  var divisorCollection = [] // Initialize an array to hold the found divisors

  // Iterate from 1 up to the square root of the input value
  for ( var currentIter = 1 ; currentIter * currentIter <= inputVal ; currentIter++ ) {

    // Check if currentIter is a divisor of inputVal
    if ( inputVal % currentIter === 0 ) {
      divisorCollection.push( currentIter ) // Add the current divisor

      // If the current divisor is not equal to its pair (inputVal / currentIter),
      // add the pair as well to avoid duplicates for perfect squares
      if ( currentIter !== inputVal / currentIter ) {
        divisorCollection.push( inputVal / currentIter )
      }
    }
  }
  // Sort the collected divisors in ascending numerical order
  return divisorCollection.sort( ( valA , valB ) => valA - valB )
}


// Obtain the complete set of divisors for the principal value
var factorSet = retrieveDivisors( principalValue )

// Initialize the minimum length with the number of digits of the principal value itself
var smallestDigitCount = principalValue.toString().length

// Loop through each factor in the calculated factor set
for ( var iterIndex = 0 ; iterIndex < factorSet.length ; iterIndex++ ) {
  var currentFactor = factorSet[ iterIndex ] // Get the current factor (let's call it 'b')
  var complementaryFactor = principalValue / currentFactor // Calculate its corresponding factor (let's call it 'a')

  // Determine the maximum digit count between the two factors
  var currentMaxDigits = complementaryFactor > currentFactor
                       ? complementaryFactor.toString().length
                       : currentFactor.toString().length

  // If the current maximum digit count is smaller than the smallest found so far, update it
  if ( smallestDigitCount > currentMaxDigits ) {
    smallestDigitCount = currentMaxDigits
  }
}

// Output the final smallest maximum digit count found
console.log( smallestDigitCount )