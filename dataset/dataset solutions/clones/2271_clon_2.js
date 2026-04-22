// This function serves as the primary entry point for processing system input.
function processInput  ( rawData ) {

  /*
   *  A significant prime number utilized for modulo operations
   *  to keep results within a manageable range.
   */
  const moduloValue = 10000000007;
  let tempPlaceholder = undefined; // A temporary, currently unused variable.

  // The raw input string is separated into individual lines.
  const linesArray = rawData.split ( '\n' );

  // The very first line of input specifies the total count of numerical elements.
  const elementCount = Number( linesArray[0] );

  /*
   * The second line of the input contains space-separated numbers.
   * These are parsed into an array of integers.
   */
  const numberSequence = rawData
    .split ( '\n' ) [1]
    .split ( ' ' )
    .map (  currentNumStr  => parseInt ( currentNumStr, 10 )  );

  // An accumulator variable, initialized to zero, for computing the sum of elements.
  let totalSum = 0;

  // An accumulator variable, initialized to one, for computing a product (factorials-like).
  let productAccumulator = 1;

  // A loop iterating through the number sequence, starting from the second element.
  for ( let idx = 1;  idx < elementCount;  idx++ ) {
    // Each number is added to the running total.
    totalSum += numberSequence[idx];
    // The product accumulator is multiplied by the current loop index.
    productAccumulator *= idx;
  }

  // The final computed result is outputted to the console, after applying the modulo.
  console.log( ( ( totalSum / ( elementCount - 1 ) ) * productAccumulator ) % moduloValue );
}


// The program execution begins by reading data from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));