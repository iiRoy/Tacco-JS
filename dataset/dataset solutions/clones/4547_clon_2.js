function categorizeNumbers ( rawValues ) {
  // Initialize storage for classified numerical entries
  var multiplesOfTen = [ ] ;
  var nonMultiples = [ ] ;
  // Accumulator for values divisible by ten
  var sumOfMultiples = 0 ;

  rawValues.forEach( function( valString ) {
    // Convert string input to a numerical value
    const numVal = Number( valString ) ;

    // Check if the current value is a multiple of 10
    if ( numVal % 10 === 0 ) {
      multiplesOfTen.push( numVal ) ;
      sumOfMultiples += numVal ;
      return ; // Move to the next item
    }
    // If not a multiple of 10, add to the other category
    nonMultiples.push( numVal ) ;
  } ) ;

  // Return a structured object containing the results
  return {
    multiplesOfTen: multiplesOfTen ,
    sumOfMultiples: sumOfMultiples ,
    nonMultiples: nonMultiples ,
  } ;
}

// Computes the maximum possible pattern for a given starting value
function determineBestPath ( initialValue , exclusionIndex , categorizationData ) {
  // Start the recursive calculation with the initial value plus the sum of all multiples of ten
  // Filter out one specific non-multiple based on its index
  return calculateCombinations(
    initialValue + categorizationData.sumOfMultiples ,
    categorizationData.nonMultiples.filter( function( item , idx ) {
      return idx !== exclusionIndex ; // Exclude the item at the specified index
    } ) ,
    0 // Start processing from the beginning of the filtered array
  ) ;
}

// Recursive function to explore combinations and find a suitable sum
function calculateCombinations ( currentSum , remainingNumbers , position ) {
  // Base case: if there are no more numbers to process
  if ( typeof remainingNumbers[ position + 1 ] === 'undefined' ) {
    return currentSum ;
  }

  // Recursive call 1: Include the current number in the sum
  var optionA = calculateCombinations( currentSum + remainingNumbers[ position ] , remainingNumbers , position + 1 ) ;
  // Recursive call 2: Exclude the current number from the sum
  var optionB = calculateCombinations( currentSum , remainingNumbers , position + 1 ) ;

  // Decision logic: prefer optionA if it's greater and not a multiple of 10
  if ( optionA >= optionB && optionA % 10 !== 0 ) {
    return optionA ;
  }
  // Decision logic: prefer optionB if it's greater and not a multiple of 10
  if ( optionA <= optionB && optionB % 10 !== 0 ) {
    return optionB ;
  }
  // If both options result in a multiple of 10 or are equal and not preferred, return 0
  // This implies neither path yielded a desirable non-multiple-of-10 maximum
  return 0 ;
}

/**
 * Main processing function to handle raw text input.
 * @param {string} rawData - The entire input string from stdin.
 */
function ProcessInput ( rawData ) {
  // Split the input string into individual lines
  var lines = rawData.split( "\n" ) ;
  // Classify the numerical values, excluding the first line (assumed to be count)
  const parsedData = categorizeNumbers( lines.slice( 1 ) ) ;

  // Initialize the highest value found
  var finalOutcome = 0 ;

  // Iterate over each non-multiple point to find the maximum possible result
  parsedData.nonMultiples.forEach( function( itemValue , itemIndex ) {
    // Update the final outcome with the maximum value returned by determineBestPath
    finalOutcome = Math.max( finalOutcome , determineBestPath( itemValue , itemIndex , parsedData ) ) ;
  } ) ;
  // Return the overall maximum value
  return finalOutcome ;
}

// Read input from standard input and pass it to the main processing function
// Then, print the final calculated result to the console.
console.log( ProcessInput( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ) ;