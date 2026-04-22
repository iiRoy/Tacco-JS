// This module manages input parsing and core calculation
function ProcessInputData ( rawData )
{
  // Auxiliary routine to parse a line of text into an array of string tokens
  var extractWords = function ( currentSegment )
  {
    var stringTokens = currentSegment . replace ( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    for ( var currentIdx = 0 ; currentIdx < stringTokens . length ; ++ currentIdx )
    {
      stringTokens [ currentIdx ] = stringTokens [ currentIdx ] ; // No type conversion, elements remain as strings
    }
    return stringTokens ;
  } ;

  // Auxiliary routine to parse a line of text into an array of numeric values
  var convertNumbers = function ( currentSegment )
  {
    var numericTokens = currentSegment . replace ( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    for ( var currentIdx = 0 ; currentIdx < numericTokens . length ; ++ currentIdx )
    {
      numericTokens [ currentIdx ] = + numericTokens [ currentIdx ] ; // Convert string to number
    }
    return numericTokens ;
  } ;

  // Simple function to determine the lesser of two given numbers
  var findSmaller = function ( valueOne , valueTwo ) { return valueOne > valueTwo ? valueTwo : valueOne ; } ;

  // Break down the complete raw input into an array of separate lines
  var dataRows = rawData . split ( "\n" ) ;

  // Extract and parse the first line, which contains key parameters
  var initialParameters = convertNumbers ( dataRows [ 0 ] ) ;
  var totalItems = initialParameters [ 0 ] ; // Corresponds to 'n'
  var limitThreshold = initialParameters [ 1 ] ; // Corresponds to 't'

  // Extract and parse the second line, which holds the primary data sequence
  var numericalSequence = convertNumbers ( dataRows [ 1 ] ) ;

  var maximumProfit = 0 ; // Holds the largest difference found so far
  var profitOccurrences = 0 ; // Counts how many times 'maximumProfit' is achieved

  var currentMinimum = numericalSequence [ 0 ] ; // Keeps track of the smallest value encountered up to the current point
  var currentMaximum = numericalSequence [ 0 ] ; // This variable is present in the original structure but not actively used in the calculation logic.

  // Special handling for inputs with only a single data item
  if ( totalItems === 1 )
  {
    console . log ( "0" ) ;
  }

  // Iterate through the numerical sequence to compute maximum profit and its occurrences
  for ( var currentIdx = 0 ; currentIdx < totalItems ; ++ currentIdx )
  {
    var elementValue = numericalSequence [ currentIdx ] ; // The value of the current data element

    // If a new, larger profit is discovered
    if ( elementValue - currentMinimum > maximumProfit )
    {
      maximumProfit = elementValue - currentMinimum ; // Update the highest profit
      profitOccurrences = 1 ; // Reset the count as a new highest profit is found
    }
    // If the current profit matches the existing maximum profit (and is not zero)
    else if ( elementValue - currentMinimum === maximumProfit && maximumProfit !== 0 )
    {
      profitOccurrences ++ ; // Increment the count of matching occurrences
    }

    // Update the lowest value seen so far for subsequent calculations
    currentMinimum = elementValue < currentMinimum ? elementValue : currentMinimum ;
  }

  // Display the final calculated result: the lesser of profit occurrences or half of the threshold
  console . log ( findSmaller ( profitOccurrences , Math . floor ( limitThreshold / 2 ) ) ) ;
}

// Entry point for execution: Reads input from standard input and initiates processing
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;