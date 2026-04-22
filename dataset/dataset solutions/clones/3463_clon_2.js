const stringToInteger = ( inputString ) => Number.parseInt( inputString, 10 ) ;

const parseStringArrayToNumbers = ( stringValues ) => stringValues.map( ( currentElement ) => stringToInteger( currentElement ) ) ;

const calculateAbsolute = ( numericalValue ) => ( numericalValue > 0 ? numericalValue : -numericalValue ) ;

function retrieveMinimum ( ) {
  let inputArguments = arguments;
  let smallestVal = inputArguments[ 0 ];
  for ( let loopCounter = 1; loopCounter < inputArguments.length; loopCounter++ ) {
    if ( inputArguments[ loopCounter ] < smallestVal ) {
      smallestVal = inputArguments[ loopCounter ];
    }
  }
  return smallestVal;
}

function retrieveMaximum ( ) {
  let providedArguments = arguments;
  let largestVal = providedArguments[ 0 ];
  for ( let indexValue = 1; indexValue < providedArguments.length; indexValue++ ) {
    if ( providedArguments[ indexValue ] > largestVal ) {
      largestVal = providedArguments[ indexValue ];
    }
  }
  return largestVal;
}

function findGreatestCommonDivisor ( ) {
  let argumentList = arguments;
  let currentCommonDivisor = argumentList[ 0 ];
  // Helper function for Euclidean algorithm implementation
  const euclideanHelper = ( firstNum, secondNum ) => ( secondNum ? euclideanHelper( secondNum, firstNum % secondNum ) : firstNum );
  for ( let iter = 1; iter < argumentList.length; iter++ ) {
    currentCommonDivisor = euclideanHelper( currentCommonDivisor, argumentList[ iter ] );
  }
  return currentCommonDivisor;
}

// Entry point for the application, processing standard input
executeMainLogic( require( "node:fs" ).readFileSync( "/dev/stdin", { encoding: "utf8" } ) );

function executeMainLogic ( programInputContent ) {
  // Split the entire input content by newline characters
  let inputLines = programInputContent.split( '\n' );
  // Parse the first line as the count of elements
  let totalElements = stringToInteger( inputLines[ 0 ] );

  let numericData = [ ];
  // Populate the array with numerical values from subsequent input lines
  for ( let dataIndex = 0; dataIndex < totalElements; dataIndex++ ) {
    numericData[ dataIndex ] = stringToInteger( inputLines[ dataIndex + 1 ] );
  }

  // Sort the collected numerical data in ascending order
  numericData.sort( ( valA, valB ) => valA - valB );

  let sumAccumulatorA = 0;
  let sumAccumulatorB = 0;

  // Conditional logic based on whether the total number of elements is even or odd
  if ( totalElements % 2 === 0 ) {
    // Process for an even number of elements
    for ( let elementPos = 0; elementPos < totalElements; elementPos++ ) {
      sumAccumulatorA += elementPos >= totalElements / 2 ? 2 * numericData[ elementPos ] : -2 * numericData[ elementPos ];
    }
    sumAccumulatorA += numericData[ totalElements / 2 ] - numericData[ totalElements / 2 + 1 ];
  } else {
    // Process for an odd number of elements
    for ( let elementPos = 0; elementPos < totalElements; elementPos++ ) {
      sumAccumulatorA += elementPos >= ( totalElements - 1 ) / 2 ? 2 * numericData[ elementPos ] : -2 * numericData[ elementPos ];
      sumAccumulatorB += elementPos > ( totalElements - 1 ) / 2 ? 2 * numericData[ elementPos ] : -2 * numericData[ elementPos ];
    }
    sumAccumulatorA -= numericData[ ( totalElements - 1 ) / 2 ] + numericData[ ( totalElements + 1 ) / 2 ];
    sumAccumulatorB += numericData[ ( totalElements - 1 ) / 2 ] + numericData[ ( totalElements - 3 ) / 2 ];
  }

  // Determine the maximum of the two calculated sums
  let finalCalculatedResult = retrieveMaximum( sumAccumulatorA, sumAccumulatorB );

  // Output the final result to the console
  console.log( finalCalculatedResult );

  return 0; // Indicate successful execution of the program
}