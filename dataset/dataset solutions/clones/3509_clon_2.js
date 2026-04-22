// This function processes a set of input lines to determine a specific count.
function analyzeNumericData ( rawInputLines ) {
  // Extract a numeric value from the first line of input.
  // This particular value is not utilized in the subsequent logic.
  let firstLineNumericValue = rawInputLines [0] . split ( " " ) [0] - 0 ;

  // Parse the second line of input into an array of numbers.
  const parsedNumericArray = rawInputLines [1] . split ( " " ) . map ( currentVal => currentVal - 0 ) ;

  // Initialize objects to store frequency counts for elements at even and odd positions.
  const firstGroupFrequencies = { } ; // Frequencies for elements at even indices
  const secondGroupFrequencies = { } ; // Frequencies for elements at odd indices

  // Iterate through the parsed numeric array to populate the frequency maps.
  parsedNumericArray . forEach ( ( currentNumber , currentIndex ) => {
    // Check if the current element's index is even or odd.
    if ( ( currentIndex % 2 ) === 0 ) {
      // If even, increment its count in the first group's frequency map.
      firstGroupFrequencies [ currentNumber ] = ( firstGroupFrequencies [ currentNumber ] || 0 ) + 1 ;
    }
    else {
      // If odd, increment its count in the second group's frequency map.
      secondGroupFrequencies [ currentNumber ] = ( secondGroupFrequencies [ currentNumber ] || 0 ) + 1 ;
    }
  } ) ;

  // Obtain sorted keys (numbers) from the frequency maps, ordered by their frequency in descending order.
  const firstGroupRankedKeys = Object . keys ( firstGroupFrequencies ) . sort ( ( keyOne , keyTwo ) => firstGroupFrequencies [ keyTwo ] - firstGroupFrequencies [ keyOne ] ) ;
  const secondGroupRankedKeys = Object . keys ( secondGroupFrequencies ) . sort ( ( keyOne , keyTwo ) => secondGroupFrequencies [ keyTwo ] - secondGroupFrequencies [ keyOne ] ) ;

  // Initialize a variable to accumulate the final result.
  let totalElementsToChange = 0 ;

  // Declare variables to store indices of elements to skip from the sorted frequency lists.
  let firstGroupSkipIndex, secondGroupSkipIndex = 0 ;

  // Determine which top frequency elements to consider for exclusion based on their values.
  if ( firstGroupRankedKeys [ 0 ] == secondGroupRankedKeys [ 0 ] ) {
    // If the most frequent element in both groups is the same value.
    if ( firstGroupRankedKeys [ 1 ] > secondGroupRankedKeys [ 1 ] ) {
      // If the second most frequent value in the first group is numerically greater
      // than the second most frequent value in the second group (original logic preserved).
      firstGroupSkipIndex = 0 ;
      secondGroupSkipIndex = 1 ;
    } else {
      // Otherwise, if the second most frequent value in the first group is not greater.
      firstGroupSkipIndex = 1 ;
      secondGroupSkipIndex = 0 ;
    }
  } else {
    // If the most frequent elements in both groups are different values.
    firstGroupSkipIndex = 0 ;
    secondGroupSkipIndex = 0 ;
  }

  // Calculate the sum of frequencies for elements that are NOT at the determined skip index
  // in the first group's ranked keys.
  firstGroupRankedKeys . filter ( ( currentNumber , index ) => index !== firstGroupSkipIndex ) . forEach ( currentNumber => totalElementsToChange += firstGroupFrequencies [ currentNumber ] ) ;

  // Calculate the sum of frequencies for elements that are NOT at the determined skip index
  // in the second group's ranked keys.
  secondGroupRankedKeys . filter ( ( currentNumber , index ) => index !== secondGroupSkipIndex ) . forEach ( currentNumber => totalElementsToChange += secondGroupFrequencies [ currentNumber ] ) ;

  // Output the final calculated count to the console.
  console . log ( totalElementsToChange ) ;
}

// Invoke the main processing function with input read from standard input.
analyzeNumericData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;