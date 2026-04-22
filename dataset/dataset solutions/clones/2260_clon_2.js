// This function processes all incoming data.
function Execute( rawInputData ) {

  const moduloVal = 1000000007; // A large prime number for modulo operations.
  let parsedValues = convertToIntMatrix( processRawInput( rawInputData ) );

  // Generate all possible combinations based on the first two input numbers.
  let combinations = generateCombinations( parsedValues[0][0], parsedValues[0][1] );

  let totalResult = 0; // Accumulator for the final sum.

  // Iterate through each generated combination.
  for ( let combinationIndex = 0; combinationIndex < combinations.length; combinationIndex++ ) {
    // Calculate the difference for the current combination and add to the total, applying modulo.
    totalResult += calculateRangeDifference( parsedValues[1], combinations[combinationIndex] ) % moduloVal;
  }

  // Output the final computed sum to standard output, ensuring it's within the modulo range.
  console.log( totalResult % moduloVal );
}


// Computes the difference between the maximum and minimum values in an array at specified indices.
function calculateRangeDifference( inputArray, currentCombination ) {
  // Initialize minimum and maximum values with the first element indicated by the combination.
  let minValue = inputArray[ currentCombination[0] - 1 ];
  let maxValue = inputArray[ currentCombination[0] - 1 ];

  // Iterate through the rest of the combination elements.
  for ( let elementIndex = 1; elementIndex < currentCombination.length; elementIndex++ ) {
    // Update minimum and maximum based on the array elements at the specified indices.
    minValue = Math.min( minValue, inputArray[ currentCombination[elementIndex] - 1 ] );
    maxValue = Math.max( maxValue, inputArray[ currentCombination[elementIndex] - 1 ] );
  }

  // Return the difference between the maximum and minimum found.
  return ( maxValue - minValue );
}


// Transforms raw multi-line string input into a matrix of string arrays.
function processRawInput( initialData ) {
  // Split the input string by newline characters to get individual lines.
  initialData = initialData.split( "\n" );

  let tempMatrix = []; // Array to store processed lines.

  // Loop through each line of the input.
  for ( let lineIndex = 0; lineIndex < initialData.length; lineIndex++ ) {
    // Split each line by spaces to get an array of strings.
    tempMatrix[ lineIndex ] = initialData[ lineIndex ].split( " " );
  }

  return tempMatrix; // Return the matrix of string arrays.
}


// Converts a matrix of string arrays into a matrix of integer arrays.
function convertToIntMatrix( stringMatrix ) {

  let integerMatrix = []; // The resulting matrix of integers.

  // Iterate over rows.
  for ( let rowIndex = 0; rowIndex < stringMatrix.length; rowIndex++ ) {
    integerMatrix[ rowIndex ] = []; // Initialize current row as an empty array.

    // Iterate over columns in the current row.
    for ( let colIndex = 0; colIndex < stringMatrix[rowIndex].length; colIndex++ ) {
      // Parse each string element to an integer and store it.
      integerMatrix[ rowIndex ][ colIndex ] = parseInt( stringMatrix[ rowIndex ][ colIndex ] );
    }
  }

  return integerMatrix; // Return the matrix with all elements converted to integers.
}


// Generates all k-combinations from a set of n elements.
function generateCombinations( totalElements, selectionSize ) {
  let finalCombinations = []; // Stores all generated combinations.
  let currentSequence = []; // Holds the combination currently being built.

  // Initialize the first combination: [1, 2, ..., selectionSize]
  for ( let initCounter = 1; initCounter <= selectionSize; initCounter++ ) {
    currentSequence[ currentSequence.length ] = initCounter;
  }

  // Loop indefinitely until no more combinations can be generated.
  for ( ; ; ) {
    // Add a copy of the current sequence to the list of final combinations.
    finalCombinations[ finalCombinations.length ] = currentSequence.concat();

    let changePoint = currentSequence.length - 1; // Index to find the rightmost element that can be incremented.

    // Find the largest index 'reverseIter' such that currentSequence[reverseIter] is not at its maximum possible value.
    for ( let reverseIter = currentSequence.length - 1; reverseIter >= 0; reverseIter-- ) {
      // Check if the current element is at its maximum for its position (n - (k - 1 - reverseIter)).
      if ( currentSequence[ reverseIter ] !== totalElements - ( currentSequence.length - reverseIter - 1 ) ) {
        break; // Found an element that can be incremented.
      } else {
        changePoint = reverseIter - 1; // Move left if element is at max.
      }
    }

    // If a 'changePoint' is found (meaning not all elements are at their maximum), generate the next combination.
    if ( changePoint >= 0 ) {
      let baseValue = currentSequence[ changePoint ]; // Value at the change point.

      // Increment the element at 'changePoint' and subsequent elements.
      for ( let fillCounter = 0; fillCounter < currentSequence.length - changePoint; fillCounter++ ) {
        currentSequence[ changePoint + fillCounter ] = baseValue + fillCounter + 1;
      }
    } else {
      break; // All combinations have been generated.
    }
  }

  return finalCombinations; // Return the complete list of k-combinations.
}


// Do not modify the code below this line (standard I/O setup).
Execute( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );