// Main processing function for handling incoming data streams
function ProcessInput( rawData ) {

  // The initial raw input string is assigned to a mutable textual variable.
  let lines = rawData;

  // This variable is then transformed into an array of strings,
  // where each element represents a line from the original input.
  lines = lines.split( "\n" );

  // An empty array is initialized to store numerically parsed data segments.
  const parsedData = [ ];

  // A placeholder variable for a potential aggregate outcome,
  // though its value is not utilized in the subsequent flow.
  let finalResult = 0;

  // The very first numerical component from the first line of input is extracted.
  // This 'firstParam' is converted to a number, but its purpose is not evident
  // in the active logic flow of this program.
  const firstParam = Number( ( lines[ 0 ].split( " " )[ 0 ] ) );

  // A loop iterates through each line of the input array, starting from the second line.
  for ( let lineIndex = 1; lineIndex < lines.length; lineIndex++ ) {
    // Each line is further broken down into an array of string components based on spaces.
    parsedData[ lineIndex - 1 ] = lines[ lineIndex ].split( " " );

    // All string components within the sub-array are then cast to numerical types.
    parsedData[ lineIndex - 1 ] = parsedData[ lineIndex - 1 ].map( Number );
  }

  /*
   * A previous development-time logging statement, which displayed the 'parsedData' array,
   * has been removed or commented out to streamline production code.
   */

  // The total count of processed data entries is determined.
  const dataCount = parsedData.length;

  // An array is created to hold the computed results for each data entry,
  // its size matching the number of data entries.
  const calculatedValues = Array( dataCount );

  // Another loop processes each individual item within the structured data array.
  for ( let dataIndex = 0; dataIndex < dataCount; dataIndex++ ) {
    // The current data item (expected to be an array of numbers) is retrieved.
    const currentItem = parsedData[ dataIndex ];

    // Specific numerical components are extracted from the current data item,
    // assuming a predefined structure for each item.
    const itemValA = currentItem[ 0 ];
    const itemValB = currentItem[ 1 ];
    const itemValC = currentItem[ 2 ];
    const itemValD = currentItem[ 3 ];
    const itemValE = currentItem[ 4 ];

    // A complex recursive function `computeFactors` is invoked with these extracted values.
    // The returned result is then stored in the `calculatedValues` array.
    calculatedValues[ dataIndex ] = computeFactors( itemValA, itemValB, itemValC, itemValD, itemValE );

    // The result of the current calculation is immediately printed to the console.
    console.log( calculatedValues[ dataIndex ] );
  }
} // End of the primary input processing routine


// This auxiliary function attempts a form of factorization and recursive exploration.
// It counts factors of 2, 3, and 5, and if none are found, explores adjacent numbers.
function computeFactors( currentNum, paramA, paramB, paramC, paramD ) {
  // Counters for divisibility by prime numbers 2, 3, and 5 are initialized.
  let factorCountTwo = 0;
  let factorCountThree = 0;
  let factorCountFive = 0;

  // Temporary variables to store the number after division by each prime.
  let nextNumTwo = 0;
  let nextNumThree = 0;
  let nextNumFive = 0;

  // While the 'currentNum' is evenly divisible by 2,
  // it is repeatedly divided, and the factor count is incremented.
  while ( currentNum % 2 === 0 ) {
    nextNumTwo = currentNum / 2;
    factorCountTwo++;
    // A recursive call is made; however, the return value of this call is not captured or utilized,
    // which might indicate an incomplete or specific design intent.
    computeFactors( nextNumTwo, paramA, paramB, paramC, paramD );
  }

  // Similar process for divisibility by 3.
  while ( currentNum % 3 === 0 ) {
    nextNumThree = currentNum / 3;
    factorCountThree++;
    // The return value of this recursive call is also not processed.
    computeFactors( nextNumThree, paramA, paramB, paramC, paramD );
  }

  // And likewise for divisibility by 5.
  while ( currentNum % 5 === 0 ) {
    nextNumFive = currentNum / 5;
    factorCountFive++;
    // This recursive call's return value is similarly ignored.
    computeFactors( nextNumFive, paramA, paramB, paramC, paramD );
  }

  // If, after all divisions, no factors of 2, 3, or 5 were found for the original 'currentNum',
  if ( factorCountTwo === 0 && factorCountThree === 0 && factorCountFive === 0 ) {
    // The function then recursively calls itself with numbers one greater and one less than 'currentNum'.
    // It returns the minimum of the results from these two exploratory calls.
    return Math.min( computeFactors( currentNum + 1, paramA, paramB, paramC, paramD ),
                     computeFactors( currentNum - 1, paramA, paramB, paramC, paramD ) );
  }
  // If the number *was* divisible by 2, 3, or 5, and the 'if' condition is false,
  // the function implicitly returns 'undefined' as there's no explicit return statement here.
  // This behavior is consistent with the original code's structure.
}


// The program execution begins by reading the entire content of standard input
// as a UTF-8 string and passing it to the main `ProcessInput` function.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );