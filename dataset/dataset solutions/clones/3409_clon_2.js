// Obtain the necessary file system utilities.
const fileSystemUtil = require('fs');

/*
 * This primary function orchestrates the data processing.
 * It takes an array of textual input lines, performs numerical
 * transformations and a specific aggregation, then logs the result.
 */
const processDataFlow = ( incomingTextLines ) => {

  // Discard the first line and convert subsequent lines to floating-point numbers.
  const processedNumericalList = incomingTextLines . slice ( 1 ) . map ( parseFloat ) ;

  // Determine the single highest numerical value from the processed list.
  const maximumValue = Math . max ( ...processedNumericalList ) ;

  // Execute a reduction operation on the numerical list to compute the final sum.
  // A special rule applies: the first occurrence of the maximum value is halved.
  console . log (
    processedNumericalList . reduce (
      ( aggregatorObject , currentNumericItem ) => {
        // Check if the maximum value has not yet been accounted for and if the current item is the maximum.
        if ( ! aggregatorObject . maxElementFound && currentNumericItem === maximumValue ) {
          // If true, mark the max as found and add half its value to the total.
          return { calculatedTotal : aggregatorObject . calculatedTotal + currentNumericItem / 2 , maxElementFound : true } ;
        } else {
          // Otherwise, just add the full value of the current item to the total.
          return { maxElementFound : aggregatorObject . maxElementFound , calculatedTotal : aggregatorObject . calculatedTotal + currentNumericItem } ;
        }
      } ,
      // Initial state for the aggregation: max not yet found, total starts at zero.
      { maxElementFound : false , calculatedTotal : 0.0 }
    ) . calculatedTotal
  ) ;
} ;

// Define constants for the input source and encoding.
const standardInputPath = '/dev/stdin' ;
const encodingFormat = 'utf8' ;
const lineBreakChar = '\n' ;

// Read the input file, decode it, clean whitespace, and split into lines,
// then pass the resulting array to the main processing function.
processDataFlow (
  fileSystemUtil
    . readFileSync ( standardInputPath , encodingFormat )
    . trim ( )
    . split ( lineBreakChar )
) ;