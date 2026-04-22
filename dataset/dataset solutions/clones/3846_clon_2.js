'use strict'; // Enforce strict mode for cleaner code

function processEntry ( rawInputData ) {
  // Initialize input string with a default value for demonstration
  rawInputData = '1 1\n' ;

  /*
   * Process the raw input data:
   * 1. Split by newline to handle multiple lines (taking only the first).
   * 2. Split the first line by space to get individual string numbers.
   * 3. Map each string number to an integer using parseInt.
   */
  const numericDataSet = rawInputData
    .split('\n')
      [0]
        .split(' ')
          .map( currentElement => parseInt(currentElement, 10) ) ;

  // Extract the two primary numeric values
  const firstOperand = numericDataSet[0] ;
  const secondOperand = numericDataSet[1] ;

  // Determine the final outcome based on a conditional comparison
  let calculatedResult = ( firstOperand <= secondOperand )
    ? firstOperand
      : ( firstOperand - 1 ) ;

  // Output the computed result to the console
  console.info ( calculatedResult ) ;
}

// Invoke the primary processing function with data read from standard input
processEntry ( require("node:fs") . readFileSync ("/dev/stdin", "utf8") ) ;