// This function processes an input string to perform a specific calculation.
function  ProcessInputData (  dataPayload )
{
  // Split the entire input payload by newline characters to get individual lines.
  let  processedLines  =  dataPayload.split ( "\n" ) ;

  // Parse the first numeric component from the first line of input.
  const  firstNumericValue  =  parseInt ( processedLines[0].split ( " " ) [0] ) ;

  // Parse the second numeric component from the first line of input.
  const  secondNumericValue  =  parseInt ( processedLines[0].split ( " " ) [1] ) ;

  // Parse the third numeric component from the first line of input.
  const  thirdNumericValue  =  parseInt ( processedLines[0].split ( " " ) [2] ) ;

  // Initialize a variable to store the final computed outcome.
  let  calculatedOutcome  =  0 ;

  // Perform the core calculation: floor((first - third) / (third + second)).
  calculatedOutcome  =  Math.floor ( ( firstNumericValue - thirdNumericValue ) / ( thirdNumericValue + secondNumericValue ) ) ;

  // Output the computed outcome to the console.
  console.log ( '%s' , calculatedOutcome ) ;
}

// Entry point: Read data from standard input and pass it to the processing function.
ProcessInputData (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;