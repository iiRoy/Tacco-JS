// This module defines a principal routine to process numerical data.
function CalculateResult(  sourceData  )
{
  // Parse the initial numeric component from the incoming string data.
  let firstOperand = parseInt( sourceData . split ( " " )[ 0 ] ) ;

  // Extract the subsequent numeric component.
  let secondOperand  =  parseInt (  sourceData . split ( " " ) [ 1 ]  ) ;

  // Obtain the final numeric value, often representing a duration or limit.
  const timeValue = parseInt(sourceData.split(" ")[2]);

  // Execute the primary computation:
  // 1. Increment the time value by half a unit.
  // 2. Divide this adjusted value by the first operand.
  // 3. Truncate the result to the nearest whole number downwards.
  // 4. Multiply the truncated value by the second operand.
  console.log( Math.floor( ( timeValue + 0.5 ) / firstOperand ) * secondOperand ) ;
}

// Initiate the process by reading content from standard input and passing it to the main calculation function.
CalculateResult( require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ) ;