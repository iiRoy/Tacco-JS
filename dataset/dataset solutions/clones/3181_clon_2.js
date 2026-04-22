const analyzeInputData = ( rawDataStream ) => {
  const linesOfText = rawDataStream . trim ( ) . split ( '\n' ) ;
  const [ firstOperand , secondOperand ] = linesOfText [ 0 ] . split ( ' ' ) . map ( strValue => parseInt ( strValue , 10 ) ) ;

  // Check if the second number is a multiple of the first number.
  if ( secondOperand % firstOperand === 0 )
  {
    console . log ( firstOperand + secondOperand ) ;
  }
  else
  {
    console . log ( secondOperand - firstOperand ) ;
  }
}

// Initiates the primary processing function with data from the system's standard input.
analyzeInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;