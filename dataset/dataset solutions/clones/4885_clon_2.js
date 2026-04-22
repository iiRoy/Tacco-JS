// This module defines a primary function to process a collection of input data.
function ExecuteLogic( incomingString )
{
  // Utility method: Transforms a textual line into an array of string components.
  const extractWords = function( textLine )
  {
    let stringElements = textLine . trim ( ) . split ( " " );
    for ( let currentIdx = 0 ; currentIdx < stringElements . length ; ++currentIdx )
    {
      stringElements [ currentIdx ] = stringElements [ currentIdx ] ; // Preserves original code's structure
    }
    return stringElements ;
  };


  // Utility method: Transforms a textual line into an array of numeric values.
  const convertNumbers = ( dataLine ) =>
  {
    let parsedValues = dataLine . trim ( ) . split ( " " ) ;
    for ( let k = 0 ; k < parsedValues . length ; k ++ )
    {
      parsedValues [ k ] = + parsedValues [ k ] ; // Converts string to number
    }
    return parsedValues ;
  };

  // Helper method: Determines the lesser of two given numerical inputs.
  const determineMinVal = function ( firstNum , secondNum )
  {
    return firstNum > secondNum ? secondNum : firstNum ;
  };


  // Divide the entire raw input string into separate lines.
  const inputSegments = incomingString . split ( "\n" ) ;
  // Parse the initial line to obtain fundamental configuration parameters.
  const initialParams = convertNumbers ( inputSegments [ 0 ] ) ;

  // Retrieve the total count of items from the first parameter set.
  const totalElements = initialParams [ 0 ] ;
  // Retrieve the maximum allowed duration from the second parameter.
  const maxDuration = initialParams [ 1 ] ;

  // Process the subsequent line, containing the list of values for items.
  const itemPrices = convertNumbers ( inputSegments [ 1 ] ) ;

  // Variables to track the highest observed profit and its frequency.
  let maxGain = 0 ;
  let maxProfitCount = 0 ;

  // Initialize minimum and maximum tracking values using the first item's price.
  let lowestValueSeen = itemPrices [ 0 ] ;
  let highestValueSeen = itemPrices [ 0 ] ; // This variable is present for structural consistency, though unused in logic.


  // Begin iterating through each item's price to compute potential gains.
  for ( let currentItemIndex = 0 ; currentItemIndex < totalElements ; ++currentItemIndex )
  {
    const currentPrice = itemPrices [ currentItemIndex ] ;

    // Calculate the profit from buying at the lowest point and selling at the current price.
    let potentialProfit = currentPrice - lowestValueSeen ;

    if ( potentialProfit > maxGain )
    {
      // If a new peak profit is identified, update the maximum and reset the occurrence counter.
      maxGain = potentialProfit ;
      maxProfitCount = 1 ;
    }
    else if ( potentialProfit === maxGain )
    {
      // If the current profit matches the established maximum, increment its occurrence count.
      maxProfitCount ++ ;
    }

    // Update the minimum price encountered so far for subsequent comparisons.
    lowestValueSeen = currentPrice < lowestValueSeen ? currentPrice : lowestValueSeen ;
  }

  // Display the result: the smaller of the profit occurrence count or half the maximum duration.
  console . log ( determineMinVal ( maxProfitCount , Math . floor ( maxDuration / 2 ) ) ) ;
}


// This final block is responsible for reading data from the standard input stream
// and initiating the primary data processing routine. It should remain unaltered.
ExecuteLogic ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;