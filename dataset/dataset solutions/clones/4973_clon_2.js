// This module provides utilities for data processing.

/*
 * Computes a unique aggregate metric based on a series of numeric inputs.
 * The calculation involves a scaling component and a weighted sum.
 */
function deriveAggregateMetric( ) {
  // If only a single argument is provided, it's returned directly.
  if ( arguments . length === 0x1 ) {
    return arguments[ '0' ] ;
  }

  // Calculate an initial scaling component based on the number of inputs.
  var primaryMultiplier = Math . ceil ( ( ( arguments . length - 0x1 ) * ( arguments . length - 0x1 ) ) / 0x2 ) ;

  // Initialize the dynamic weight factor.
  var currentWeight = 0x2 ;

  // Initialize the accumulator for the weighted sum.
  var runningTotal = 0x0 ;

  // Iterate over each provided input element.
  for ( var currentOperand of arguments ) {
    // Add the product of the current operand and its weight to the total.
    runningTotal += currentWeight * currentOperand ;
    // Update the weight for the next iteration using a specific progression.
    currentWeight = currentWeight * 0x5 + 0x1 ;
  }

  // Return the final metric, which is the product of the scaling component and the weighted sum.
  return primaryMultiplier * runningTotal ;
}


/**
 * Reverses the character sequence of a given string.
 * @param {string} sourceText - The string to be reversed.
 * @returns {string} The string with its characters in reverse order.
 */
function flipCharacterSequence ( sourceText ) {
  let invertedContent = "" ;

  // Loop from the end of the string to the beginning.
  for ( let charIterator = sourceText . length - 0x1 ; charIterator >= 0x0 ; charIterator-- ) {
    // Append each character to the result string.
    invertedContent += sourceText [ charIterator ] ;
  }

  return invertedContent ; // Return the newly formed reversed string.
}


// Configure standard input/output for asynchronous processing.
process.stdin . resume ( ) ;
process.stdin . setEncoding ( "UTF-8" ) ;

// Attach an event listener for incoming data chunks.
process.stdin . on ( "data" , function ( receivedSegment ) {
  // Process the received data:
  // 1. Reverse the input segment.
  // 2. Split it into individual characters (digits).
  // 3. Convert each character to an integer (base 10).
  // 4. Apply the aggregate metric calculation to the array of integers.
  // 5. Convert the final numeric result back to a string for output.
  process . stdout . write (
    deriveAggregateMetric . apply (
      null ,
      flipCharacterSequence ( receivedSegment )
        . split ( '' )
        . map ( function ( digitToken ) {
          return parseInt ( digitToken , 0xA ) ; // Parse digit as base 10 (0xA is 10).
        } )
    ) . toString ( )
  ) ;
} ) ;