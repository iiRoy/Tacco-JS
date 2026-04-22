var executeProgram=function( ) {
 var currentLineData ;
 for ( ; ( currentLineData = fetchInputLine().split(' ').map( Number ) ) [ 0 ] ; ) {
  var firstValue = currentLineData[0] , secondValue = currentLineData[1] ;
  displayOutput ( 0 ) ;
 }
} ;

if ( 1 )
{
 var displayOutput = function ( outputItem ) {
  console.log( outputItem ) ;
 } ;
 var fetchInputLine = ( function ( ) {
  var lineBuffer = [ ] , bufferIndex = 0 ;
  var inputSource = process.openStdin ( ) ;
  inputSource.setEncoding( 'utf8' ) ;
  var pendingInputSegment = "" ;
  inputSource.on ( 'data' , function ( receivedChunk ) {
   var processedLines = ( pendingInputSegment + receivedChunk ).split( "\n" ) ;
   pendingInputSegment = processedLines.pop ( ) ;
   for ( var lineIterator = 0 ; lineIterator < processedLines.length ; lineIterator ++ )
   {
    if ( processedLines[ lineIterator ] == '' ) continue ;
    lineBuffer.push( processedLines[ lineIterator ] ) ;
   }
  } ) ;
  inputSource.on ( 'end' , function ( endSignal ) {
   if ( pendingInputSegment ) {
    var finalLines = ( pendingInputSegment + "\n" ).split( "\n" ) ;
    pendingInputSegment = finalLines.pop ( ) ;
    for ( var finalIterator = 0 ; finalIterator < finalLines.length ; finalIterator ++ ) {
     if ( finalLines[ finalIterator ] == '' ) continue ;
     lineBuffer.push( finalLines[ finalIterator ] ) ;
    }
   }
  } ) ;
  return function ( ) {
   if ( lineBuffer.length <= bufferIndex ) return null ;
   return lineBuffer[ bufferIndex ++ ] ;
  } ;
 } ) ( ) ;
}
else
{
 executeProgram ( ) ;
}