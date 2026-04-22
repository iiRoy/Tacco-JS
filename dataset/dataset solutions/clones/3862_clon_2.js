// This function processes a multi-line input string to calculate a specific combinatorial result.
function ProcessInputData ( inputString ) {

  // Split the entire input string into an array of lines.
  let lineSegments = inputString.split( "\n" ) ;

  // The first line contains the total number of elements. Convert it to a number.
  let elementCount = +lineSegments[ 0 ] ;

  // The second line contains space-separated numeric values. Split them into an array.
  let numericValues = lineSegments[ 1 ].split( " " ) ;

  // Initialize a hash map to store the frequencies of prefix sums.
  // A sum of 0 is considered to have occurred once initially.
  let frequencyMap = { 0 : 1 } ;

  // Initialize the running prefix sum.
  let currentPrefixSum = 0 ;

  // Iterate through each numeric value to calculate prefix sums and their frequencies.
  for ( let idx = 0 ; idx < elementCount ; idx++ ) {
    // Add the current numeric value (converted to number) to the running sum.
    currentPrefixSum += +numericValues[ idx ] ;

    // Increment the frequency of the current prefix sum in the map.
    // If it's a new sum, initialize its frequency to 1; otherwise, increment.
    if ( frequencyMap[ currentPrefixSum ] ) {
      frequencyMap[ currentPrefixSum ]++ ;
    } else {
      frequencyMap[ currentPrefixSum ] = 1 ;
    }
  }

  // Initialize the variable to store the final combinatorial result.
  let resultCount = 0 ;

  // Declare a temporary variable for frequency.
  let currentFreq ;

  // Iterate through each unique prefix sum (key) in the frequency map.
  for ( let mapEntryKey in frequencyMap ) {
    // Check if the frequency for the current sum exists and assign it to currentFreq.
    // This is a common pattern for "if assignment successful" in JS.
    if ( currentFreq = frequencyMap[ mapEntryKey ] ) {
      // If a sum occurred 'k' times, there are k*(k-1)/2 pairs of indices
      // where the prefix sum is the same. Add this to the total result.
      resultCount += currentFreq * ( currentFreq - 1 ) / 2 ;
    }
  }

  // Output the final calculated result to the console.
  console.log( resultCount ) ;
}


// Call the main processing function with input read from standard input.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;