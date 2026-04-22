function  executeProcessing ( )   {
  console . log (   receivedDataBuffer . toUpperCase ( ) ) ;
}

  let
receivedDataBuffer  =  '' ;

process.stdin.resume ( )  ;
process.stdin . setEncoding (   'utf8' ) ;
process.stdin.on ( 'data' , function( dataSegment ) {
  receivedDataBuffer  += dataSegment ;
} ) ;
process.stdin.on ( 'end' , function ( ) {
  executeProcessing ( ) ;
} ) ;