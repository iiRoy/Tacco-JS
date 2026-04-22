'use strict' ;

function processData ( rawData ) {
  const dataRows = rawData . split ( '\n' ) ;
  const elementCount = parseInt ( dataRows [ 0 ] ) ;
  const numericValues = dataRows [ 1 ]
    . split ( ' ' )
    . map ( Number )
    . sort ( ( firstElement , secondElement ) => firstElement - secondElement ) ;

  const longestSide = numericValues . pop ( ) ;
  const remainingSidesSum = numericValues . reduce ( ( accumulatedTotal , currentValue , indexPosition , sourceArray ) => accumulatedTotal + currentValue ) ;

  console . log ( longestSide < remainingSidesSum ? 'Yes' : 'No' ) ;
}

processData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;