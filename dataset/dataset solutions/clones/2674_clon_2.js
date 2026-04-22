"use strict";

const processInputValues = ( rawInputString ) => {
  const splitInputArray = rawInputString . split ( ' ' );

  const firstOperand = parseInt( splitInputArray[0] , 10 );
  const secondOperand = parseInt( splitInputArray[1] , 10 );
  const thirdOperand = parseInt( splitInputArray[2] , 10 );

  const calculatedSum = secondOperand + thirdOperand ;

  if ( calculatedSum > firstOperand ) {
    const differenceResult = calculatedSum - firstOperand ;
    console.log( differenceResult ) ;
  }
  else
  {
    console.log( 0 ) ;
  }
};

processInputValues ( require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;