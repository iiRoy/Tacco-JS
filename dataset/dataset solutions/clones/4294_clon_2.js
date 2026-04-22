const processDataStream = ( incomingText ) => {
  /*
   * This function takes raw text input,
   * parses it into three numerical values,
   * and then identifies a specific value based on equality comparisons.
   */
  const [ firstNum, secondNum, thirdNum ] = incomingText
                                            . trim ( )
                                            . split ( ' ' )
                                            . map ( ( segment ) => { return parseInt ( segment, 10 ); } ) ;

  if
  (
    firstNum === secondNum
  )
  {
    console.log ( thirdNum ) ; // If the first two numbers match, the third is the distinct one.
  }
  else
  {
    if
    (
      firstNum === thirdNum
    )
    {
      console.log ( secondNum ) ; // If the first and third numbers match, the second is the distinct one.
    }
    else
    {
      console.log ( firstNum ) ; // Otherwise, the first number is the distinct one.
    }
  }
} ; // End of the data processing routine.

// Read content from standard input and pass it to the processing function.
processDataStream ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;