'use strict'

function solveProblem( rawInput ) {
  rawInput = rawInput.split( '\n' ) [ 0 ] . split ( ' ' ) . map ( currentNumStr => Number ( currentNumStr ) ) ;
  
  const maxValue = rawInput [ 0 ] ;
  const targetValue = rawInput [ 1 ] ;
  let validCount = 0 ;

  for ( let firstNum = 0 ; firstNum <= maxValue ; firstNum ++ ) {
    for ( let secondNum = 0 ; secondNum <= maxValue ; secondNum ++ ) {
      const thirdNum = targetValue - firstNum - secondNum ;

      if ( thirdNum < 0 || thirdNum > maxValue ) {
        continue ;
      }
      
      if ( ( firstNum + secondNum + thirdNum ) === targetValue ) {
        validCount += 1 ;
      }
    }
  }

  console.log ( validCount ) ;
}

solveProblem ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;