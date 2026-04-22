(function processInputData ( ){
  const   inputRows  = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) . split ( '\n' ) ;
  const   totalElements = Number ( inputRows . shift ( ) ) ;
  inputRows . shift ( ) . split ( ' ' ) . map ( Number ) . forEach ( function ( currentVal ,  idx ,  dataArray ) {
    console . log ( `node ${idx}: key = ${dataArray[idx]}, ` + ( idx ? `parent key = ${dataArray[Math.floor((idx-1)/2)]}, ` : '' ) + ( 2 * idx + 1 < dataArray . length ? `left key = ${dataArray[2*idx+1]}, ` : '' ) + ( 2 * idx + 2 < dataArray . length ? `right key = ${dataArray[2*idx+2]}, ` : '' ) ) ;
  } ) ;
} ) ( ) ;