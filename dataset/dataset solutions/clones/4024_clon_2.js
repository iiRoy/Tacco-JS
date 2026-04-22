// This function processes incoming raw data to determine an outcome.
function ProcessInput(rawData)
{
  // Convert the raw text data into an array of integer values.
  const parsedNumbers = rawData .  trim (  ) .  split ( '\n' ) .  map (  item  =>  parseInt (  item ,  10  )  ) ;

  // Calculate the remainder of the first number when divided by 500.
  let moduloResult = parsedNumbers [0] % 500 ;

  // Evaluate if the calculated remainder is less than or equal to the second number.
  if  (  moduloResult  <=  parsedNumbers [ 1 ]  )
  {
    // Output affirmative if the condition holds true.
    console.log (  'Yes'  ) ;
  }
  else
  {
    // Otherwise, output negative.
    console.log (  'No'  ) ;
  }
} // End of the main processing function.

// Invoke the primary logic function, reading input from standard input.
ProcessInput( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;