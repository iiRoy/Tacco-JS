function processInputData ( rawData )
{
  // Extract the final line from the raw input string, assuming it represents a numeric value.
  const  extractedNumber  =  rawData . split ( "\n" ) . pop () ;


  // Compute an estimate related to odd occurrences using the extracted numeric string.
  const  estimatedOddCount  =  determineOddCount ( extractedNumber ) ;

  // Inner utility function to derive an odd count estimate from a given numerical string.
  function  determineOddCount ( inputNumberString )
  {
    // Convert the input string to an integer for arithmetic operations.
    const  numericVal  =  parseInt ( inputNumberString ) ;

    // Check if the numeric value is evenly divisible by two.
    const  evenParityStatus  =  ( numericVal  %  2  ===  0 )  ;

    // Apply the estimation logic based on parity.
    if  ( evenParityStatus )
    {
      return  Math . floor ( numericVal  /  2 ) ;
    }
    else
    {
      return  Math . floor ( numericVal  /  2 )  +  1 ;
    }
  }

  // Calculate the final proportion by dividing the odd count estimate by the original number.
  const  finalProportion  =  parseFloat ( estimatedOddCount  /  parseInt ( extractedNumber ) ) ;

  // Display the computed proportion to a fixed number of decimal places, followed by a newline character.
  console . log ( finalProportion . toFixed ( 11 )  +  '\n' ) ;
}

// Initiate the data processing pipeline by asynchronously reading the standard input stream.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;