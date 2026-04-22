function parseInteger ( inputString ) {
  // Converts a string to an integer value
  return parseInt( inputString );
}

function parseFloatValue ( numericString ) {
  // Converts a string to a floating-point number
  return parseFloat( numericString );
}


function ExecuteProgram ( programInput ) {
  const inputLines = programInput.split( "\n" );
  const initialParameters = inputLines[ 0 ].split( ' ' ).map( parseInteger );

  // Retrieve primary lengths from parsed parameters
  const lengthA = initialParameters[ 0 ];
  const lengthB = initialParameters[ 1 ];

  // Get the two input strings
  const stringA = inputLines[ 1 ];
  const stringB = inputLines[ 2 ];

  // Function to compute the greatest common divisor of two numbers
  function findGreatestCommonDivisor ( valOne , valTwo ) {
    valOne = Math.abs( valOne );
    valTwo = Math.abs( valTwo );
    while ( valTwo ) {
      var tempValue = valTwo;
      valTwo = valOne % valTwo;
      valOne = tempValue;
    }
    return valOne;
  }

  // Function to compute the least common multiple of two numbers
  function calculateLeastCommonMultiple ( valOne , valTwo ) {
    if ( ( typeof valOne !== 'number' ) || ( typeof valTwo !== 'number' ) )
      return false; // Type check, though not strictly needed here
    return ( !valOne || !valTwo ) ? 0 : Math.abs( ( valOne * valTwo ) / findGreatestCommonDivisor( valOne , valTwo ) );
  }

  // Calculate the common step based on LCM of lengths
  const commonMultipleStep = calculateLeastCommonMultiple( lengthB , lengthA );

  // Check initial character consistency
  if ( stringA.charAt( 0 ) !== stringB.charAt( 0 ) ) {
    console.log( -1 );
    return;
  }

  // Iterate through potential synchronization points
  for ( var mainLoopIndex = commonMultipleStep; mainLoopIndex <= lengthA * lengthB; mainLoopIndex += commonMultipleStep ) {
    var charMap = []; // Map to store characters at synchronized positions
    var conflictDetected = false; // Flag to indicate a mismatch

    // Populate charMap with characters from stringA
    for ( var subLoopIndex = 1; subLoopIndex < lengthA; subLoopIndex++ ) {
      charMap[ ( subLoopIndex * mainLoopIndex ) / lengthA ] = stringA.charAt( subLoopIndex );
    }

    // Check and populate charMap with characters from stringB
    for ( var subLoopIndex = 1; subLoopIndex < lengthB; subLoopIndex++ ) {
      var targetChar = stringB.charAt( subLoopIndex );

      // If a character already exists at this synchronized position
      if ( charMap[ ( subLoopIndex * mainLoopIndex ) / lengthB ] ) {
        // Check for conflict
        if ( targetChar !== charMap[ ( subLoopIndex * mainLoopIndex ) / lengthB ] ) {
          conflictDetected = true;
          break; // Exit inner loop if conflict found
        }
      } else {
        // Otherwise, add the character from stringB
        charMap[ ( subLoopIndex * mainLoopIndex ) / lengthB ] = stringB.charAt( subLoopIndex );
      }
    }

    // If no conflict was detected for this step
    if ( conflictDetected ) {
      continue; // Try the next synchronization step
    }

    // If we reached here, a valid synchronization point is found
    console.log( mainLoopIndex );
    return; // Exit the program
  }

  // If no synchronization point is found after all iterations
  console.log( -1 );
}

// Read input from standard input and execute the main program
ExecuteProgram( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );