function processInputData ( rawText )
{
  // Cleanse the incoming string data by removing leading/trailing whitespace.
  rawText = rawText . trim ( ) ;

  // Deconstruct the processed string into four numerical components.
  // Each component is expected to be on a new line within the input.
  const   [   firstValue    ,
              secondValue   ,
              thirdValue    ,
              fourthValue   ]   =   rawText
                                      . split ( '\n' )
                                      . map ( Number ) ;

  // Determine the final result based on a conditional expression.
  // If the first value is greater than the second, calculate a specific formula.
  // Otherwise, compute a simpler product.
  console . log ( firstValue > secondValue
                  ? secondValue * thirdValue + ( firstValue - secondValue ) * fourthValue
                  : secondValue * thirdValue ) ;
}

// Invoke the primary processing function with data read from standard input.
// This uses Node.js 'fs' module to synchronously read the file.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;