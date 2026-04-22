let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw content from standard input source

let lineSegments = rawData . trim( ) . split ( "\n" ) ; // Process and segment the incoming data by newline characters

for ( ; ; ) { // Initiate an endless processing sequence
  let currentLine = lineSegments . shift ( ) ; // Extract the next available data fragment

  let parsedElements = currentLine . split ( " " ) ; // Decompose the fragment into its constituent parts

  let firstOperand = parsedElements[0] - 0 ; // Convert the initial part to a numerical value

  let secondValueOrOperator = parsedElements[1] - 0 ; // Convert the second part; note: this might be an operator, leading to NaN

  if ( parsedElements[1] === "%" ) { // Termination condition: if the second element indicates an exit signal
    break ; // Cease the processing loop
  }

  if ( parsedElements[1] === "+" ) { // If the operation is addition
    console . log ( firstOperand + secondValueOrOperator ) ; // Display the sum
  }

  if ( parsedElements[1] === "-" ) { // If the operation is subtraction
    console . log ( firstOperand - secondValueOrOperator ) ; // Display the difference
  }

  if ( parsedElements[1] === "*" ) { // If the operation is multiplication
    console . log ( firstOperand * secondValueOrOperator ) ; // Display the product
  }

  if ( parsedElements[1] === "/" ) { // If the operation is division
    console . log ( ~~ ( firstOperand / secondValueOrOperator ) ) ; // Display the integer result of division
  }
}