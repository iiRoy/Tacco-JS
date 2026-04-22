"use strict";

function  executeCalculation ( inputString )  {

  inputString = inputString . trim ( ) . split ( " " ) ;

  const lowerBound = parseInt ( inputString [ 0 ] ) ;
  const upperBound = parseInt ( inputString [ 1 ] ) ;
  const divisorVal = parseInt ( inputString [ 2 ] ) ;

  let resultCount = 0 ;

  for ( let currentNum = divisorVal ; currentNum < 101 ; currentNum = currentNum + divisorVal )
  {
    if ( lowerBound <= currentNum && upperBound >= currentNum )
    {
      resultCount ++ ;
    }
  }

  console . log ( resultCount ) ;
}


function  sortNumericCollection ( numCollection )  {
  numCollection . sort ( numericComparer ) ;
  return numCollection ;
}


var  numericComparer = function ( valA , valB )  {
  return valA - valB ;
} ;


executeCalculation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;