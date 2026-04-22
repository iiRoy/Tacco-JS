'use strict';
( function ( sourceData ) {

  sourceData = sourceData . trim ( ) . split ( / \s+ / ) . map ( currentVal => currentVal - 0 ) ;
  const totalCount = sourceData . shift ( ) ;
  const itemCounts = [ 'zero' , 0 , 0 , 0 ] ;

  sourceData . forEach ( function ( currentVal ) {
    itemCounts [ currentVal ] ++ ;
  } ) ;

  const dynamicProgrammingTable = new Array ( totalCount + 2 ) ;
  for ( let indexA = -1 ; indexA < totalCount + 2 ; indexA ++ ) {
    dynamicProgrammingTable [ indexA ] = new Array ( totalCount + 2 - indexA ) ;
    for ( let indexB = -1 ; indexB < totalCount + 2 - indexA ; indexB ++ ) {
      dynamicProgrammingTable [ indexA ] [ indexB ] = new Array ( totalCount + 2 - indexA - indexB ) . fill ( 0 ) ;
      dynamicProgrammingTable [ indexA ] [ indexB ] [ -1 ] = 0 ;
    }
  }

  for ( let indexA = 1 ; indexA <= totalCount ; indexA ++ ) {
    dynamicProgrammingTable [ indexA ] [ 0 ] [ 0 ] = dynamicProgrammingTable [ indexA - 1 ] [ 0 ] [ 0 ] + ( totalCount / indexA ) ;
    for ( let indexB = 1 ; indexB <= indexA ; indexB ++ ) {
      dynamicProgrammingTable [ indexA - indexB ] [ indexB ] [ 0 ] = totalCount / indexA +
        dynamicProgrammingTable [ indexA - indexB + 1 ] [ indexB - 1 ] [ 0 ] * ( indexB / indexA ) +
        dynamicProgrammingTable [ indexA - indexB - 1 ] [ indexB ] [ 0 ] * ( ( indexA - indexB ) / indexA ) ;
      for ( let indexC = 1 ; indexC <= indexB ; indexC ++ ) {
        dynamicProgrammingTable [ indexA - indexB ] [ indexB - indexC ] [ indexC ] = totalCount / indexA +
          dynamicProgrammingTable [ indexA - indexB ] [ indexB - indexC + 1 ] [ indexC - 1 ] * ( indexC / indexA ) +
          dynamicProgrammingTable [ indexA - indexB + 1 ] [ indexB - 1 - indexC ] [ indexC ] * ( ( indexB - indexC ) / indexA ) +
          dynamicProgrammingTable [ indexA - indexB - 1 ] [ indexB - indexC ] [ indexC ] * ( ( indexA - indexB ) / indexA ) ;
      }
    }
  }
  console . log ( dynamicProgrammingTable [ itemCounts [ 1 ] ] [ itemCounts [ 2 ] ] [ itemCounts [ 3 ] ] ) ;
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;