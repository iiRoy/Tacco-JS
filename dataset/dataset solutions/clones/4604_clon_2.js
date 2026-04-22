"use strict" ;

// This routine takes a string of numerical data for processing.
function ProcessValues (  dataString   ) {

  let numericStrings  =  dataString . split ( ' ' ) ;
  let   firstNum = Number ( numericStrings [ 0 ] ) ;
  let divisorNum=Number(numericStrings[1]) ;
  let targetRemainder = Number ( numericStrings [ 2 ] ) ;


  firstNum %= divisorNum ;
  let foundMatch = false  ; // We'll use a boolean to track if a solution is found.

  for ( let iteratorIndex = 0 ; iteratorIndex < divisorNum ;  ++iteratorIndex )
  {
    if ( ( firstNum * iteratorIndex ) % divisorNum === targetRemainder )
    {
      foundMatch = true ;
      break ;
    }
  }


  if ( foundMatch ) {
    console . log ( "YES" ) ;
  }
  else
  {
    console . log ( "NO" ) ;
  }
} // End of ProcessValues function.

// The subsequent section manages input/output operations and must remain unaltered.
ProcessValues ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;