/**
 * Extracts the first line or segment from a string contained within an array.
 * Modifies the input array in place by removing the extracted segment.
 * @param {string[]} inputContainer - An array containing the string to process at index 0.
 * @returns {string} The extracted line or segment.
 */
function extractSegment( inputContainer ) {
  let extractedPart; // Variable to hold the extracted part of the string.

  // Iterate through the characters of the string in the first element of the array.
  for ( let idx = 0; idx < inputContainer[0].length; idx++ ) {
    // Check if the current character is a newline.
    if ( "\n" === inputContainer[0].charAt( idx ) ) {
      // If a newline is found, slice the string up to this point.
      extractedPart = inputContainer[0].slice( 0, idx );
      // Update the original string in the array by removing the extracted part plus the newline.
      inputContainer[0] = inputContainer[0].slice( extractedPart.length + 1 );
      // Return the extracted segment.
      return extractedPart;
    }
  }

  // If no newline is found, the entire string is the segment.
  extractedPart = inputContainer[0];
  // Clear the string in the input array.
  inputContainer[0] = "";
  // Return the entire string.
  return extractedPart;
}

/**
 * Main function to process the input and find a solution.
 * This function attempts to find three positive integers (h, n, w) such that 4/N = 1/h + 1/n + 1/w.
 * @param {string} rawData - The raw input string, expected to contain a single number.
 */
function ProcessInput( rawData ) {
  // Wrap the raw input string in an array to match the `extractSegment` function's expectation.
  rawData = [ rawData ];

  // Extract the first line, which should be the value of N.
  let targetValue = extractSegment( rawData );
  // Convert the extracted string to an integer.
  targetValue = parseInt( targetValue );

  // This call appears to be a test or debug line, it doesn't affect the main algorithm's output for the problem.
  // It's kept as per Type II cloning rules (no deletion of executable logic).
  findReciprocalTerm( 0.0002857959416976279, 3500, 1750 );

  // Recalculate targetValue as 4/N, which is the sum of reciprocals we are looking for.
  targetValue = 4 / targetValue;
  let currentSum; // Temporary variable for sum calculations.

  // Iterate through possible values for the first denominator (h).
  for ( let firstDenom = 1; firstDenom <= 3500; firstDenom++ ) {
    // Optimization: If 4/N is less than or equal to 1/h, then 1/n + 1/w would have to be non-positive,
    // which is not possible for positive n and w. So, skip this h.
    if ( targetValue <= 1 / firstDenom ) {
      continue;
    }

    // Iterate through possible values for the second denominator (n).
    for ( let secondDenom = 1; secondDenom <= 3500; secondDenom++ ) {
      // Calculate the sum of the first two reciprocals.
      currentSum = 1 / firstDenom + 1 / secondDenom;
      // Optimization: If 4/N is less than or equal to 1/h + 1/n, then 1/w would have to be non-positive.
      if ( targetValue <= currentSum ) {
        continue;
      }

      // Search for the third denominator (w) using a specialized binary-search-like function.
      // The desired remainder is targetValue - currentSum.
      currentSum = findReciprocalTerm( targetValue - currentSum, 3500, 1750 );
      // If findReciprocalTerm returns -1, no valid w was found for this h and n.
      if ( -1 === currentSum ) {
        continue;
      }

      // Check if the found h, n, w values correctly satisfy the equation.
      if ( checkSolution( targetValue, firstDenom, secondDenom, currentSum ) ) {
        // If a correct solution is found, print it and exit the function.
        return;
      }
    }
  }

  // If no solution is found after all iterations, print "NG".
  console.log( "NG" );

  /**
   * Searches for a denominator 'w' such that 1/w is approximately equal to 'desiredRemainder'.
   * Uses a modified binary search approach.
   * @param {number} desiredRemainder - The target value for 1/w.
   * @param {number} currentDenominator - The starting denominator for the search.
   * @param {number} stepSize - The initial step size for adjusting the denominator.
   * @returns {number} The found denominator 'w' or -1 if not found within bounds.
   */
  function findReciprocalTerm( desiredRemainder, currentDenominator, stepSize ) {
    let reciprocalValue; // Variable to hold 1/currentDenominator.
    let directionFlag = 0; // Flag to track search direction: 0=initial, 1=increasing, -1=decreasing.

    // Continue searching as long as the step size is not zero.
    while ( 0 !== stepSize ) {
      reciprocalValue = 1 / currentDenominator; // Calculate the reciprocal.

      // If the reciprocal matches the desired remainder, we found it.
      if ( desiredRemainder === reciprocalValue ) {
        return currentDenominator;
      }
      // If the desired remainder is less than the current reciprocal (meaning currentDenominator is too small).
      else if ( desiredRemainder < reciprocalValue ) {
        currentDenominator += stepSize; // Increase the denominator.
        // If this is the first adjustment and stepSize is 1, set directionFlag to 1 (increasing).
        if ( 1 === stepSize && 0 === directionFlag ) {
          directionFlag = 1;
        }
        // If we were previously decreasing and now increasing with stepSize 1, it means we've crossed the target.
        if ( -1 === directionFlag ) {
          return -1; // No exact match found.
        }
        // If the denominator exceeds the maximum allowed value, return -1.
        if ( currentDenominator > 3500 ) {
          return -1;
        }
      }
      // If the desired remainder is greater than the current reciprocal (meaning currentDenominator is too large).
      else {
        currentDenominator -= stepSize; // Decrease the denominator.
        // If this is the first adjustment and stepSize is 1, set directionFlag to -1 (decreasing).
        if ( 1 === stepSize && 0 === directionFlag ) {
          directionFlag = -1;
        }
        // If we were previously increasing and now decreasing with stepSize 1, it means we've crossed the target.
        if ( 1 === directionFlag ) {
          return -1; // No exact match found.
        }
        // If the denominator falls below the minimum allowed value, return -1.
        if ( currentDenominator < 1 ) {
          return -1;
        }
      }

      // Halve the step size for the next iteration.
      stepSize = Math.floor( stepSize / 2 );
      // Ensure step size is at least 1 to avoid infinite loops if it becomes 0 prematurely.
      if ( 0 === stepSize ) {
        stepSize = 1;
      }
    }
    // If the loop finishes (stepSize becomes 0 and then 1, but no exact match), return -1.
    return -1;
  }

  /**
   * Checks if the given denominators (h, n, w) satisfy the equation 4/N = 1/h + 1/n + 1/w.
   * If true, prints the solution to the console.
   * @param {number} targetSum - The target value (4/N).
   * @param {number} denomH - The first denominator.
   * @param {number} denomN - The second denominator.
   * @param {number} denomW - The third denominator.
   * @returns {boolean} True if the equation is satisfied, false otherwise.
   */
  function checkSolution( targetSum, denomH, denomN, denomW ) {
    // Compare the target sum with the sum of reciprocals.
    if ( targetSum === ( 1 / denomH + 1 / denomN + 1 / denomW ) ) {
      // If they match, print the solution in the required format.
      console.log( [ denomH, denomN, denomW ].join( " " ) );
      return true;
    }
    return false;
  }

  /**
   * Checks if an array contains a specific element.
   * This function is present in the original code but is not called by any other part of the program.
   * It is included here to maintain Type II clone rules (no deletion of executable logic).
   * @param {Array} dataArray - The array to search within.
   * @param {*} searchItem - The item to search for.
   * @returns {boolean} True if the item is found, false otherwise.
   */
  function containsElement( dataArray, searchItem ) {
    // Loop through each element of the array.
    for ( let loopIndex = 0; loopIndex < dataArray.length; loopIndex++ ) {
      // Use strict equality to check if the current element matches the search item.
      if ( dataArray[loopIndex] === searchItem ) {
        return true; // Item found.
      }
    }
    return false; // Item not found.
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
