"use strict";

const executeLogic =  ( inputData ) => {
  inputData = inputData . trim() . split ( '\n' ) ;
  const sequenceLength = parseInt ( inputData[0] . split ( ' ' ) [0] ) ;
  const limitValue = parseInt ( inputData [0] . split ( ' ' ) [1] ) ;

  const valueSequence = inputData[1] . split ( ' ' ) . map ( itemValue => parseInt ( itemValue ) ) ;
  let totalExcess = 0 ;

  for ( let currentIndex = 0 ; currentIndex < sequenceLength - 1 ; currentIndex ++ ) {
    let pairSum = valueSequence [ currentIndex ] + valueSequence [ currentIndex + 1 ] ;

    if ( pairSum > limitValue ) {
      valueSequence [ currentIndex + 1 ] = Math . max ( 0 , valueSequence [ currentIndex + 1 ] - ( pairSum - limitValue ) ) ;
      totalExcess += pairSum - limitValue ;
    }
  }

  console.log ( totalExcess ) ;
} ;

executeLogic ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;