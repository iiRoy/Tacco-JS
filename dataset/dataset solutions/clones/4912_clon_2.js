function ProcessInput( rawData )
{
  // Cleanse the incoming string data and segment it into an array of strings
  let tokenizedData = rawData . trim() . split(' ');

  // Convert the initial segment to an integer, establishing an upper bound for iteration
  const limitValue = parseInt( tokenizedData[0] , 10 );
  // Convert the subsequent segment to an integer, serving as a foundational numeric component
  const baseValue = parseInt( tokenizedData[1], 10 );

  // Establish a mutable variable to accumulate the computed outcome, starting with the base value
  let calculatedResult = baseValue;

  // Initiate a repetitive sequence, commencing from one and continuing until the loop counter reaches the limit
  for ( let loopCounter = 1 ; loopCounter < limitValue ; loopCounter++ )
  {
    // Modify the accumulated result by multiplying it with the base value decremented by one
    calculatedResult *= ( baseValue - 1 );
  }

  // Present the final accumulated numerical outcome to the standard output stream
  console . log ( calculatedResult ) ;
}

// Acquire the content from the standard input stream (e.g., a file) and encode it as UTF-8, then pass it for processing
ProcessInput ( require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ) ;