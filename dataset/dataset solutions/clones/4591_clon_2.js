'use strict';

const ProcessInput = ( rawData ) => {

  const parts = rawData . trim ( ) . split ( ' ' ) ;

  let valX = parseInt ( parts [ 0 ] ) ;
  let valY = parseInt ( parts [ 1 ] ) ;
  let valZ = parseInt ( parts [ 2 ] ) ;

  let finalCount = 0 ;

  if ( valX === valY && valY === valZ && valX % 2 === 0 ) {
    finalCount = -1 ;
  } else {
    for ( let iterationNum = 1 ; valX % 2 === 0 && valY % 2 === 0 && valZ % 2 === 0 ; iterationNum ++ ) {
      const currentValues = [ valX , valY , valZ ] ;
      valX = currentValues [ 1 ] / 2 + currentValues [ 2 ] / 2 ;
      valY = currentValues [ 0 ] / 2 + currentValues [ 2 ] / 2 ;
      valZ = currentValues [ 0 ] / 2 + currentValues [ 1 ] / 2 ;
      finalCount = iterationNum ;
    }
  }

  console . log ( finalCount ) ;
  return finalCount ;
};

ProcessInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;