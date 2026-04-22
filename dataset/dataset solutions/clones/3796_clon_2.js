const processInputData = function ( rawData ) {
 var charSequence = rawData.split ( "\n" ) [ 1 ] ;
 var leastAdjustments = 3 * Math.pow ( 10 , 5 ) ;
 for ( var currentPos = 0 ; currentPos < charSequence.length ; currentPos++ )
 {
  var pivotChar = charSequence [ currentPos ] ;
  var prefixSegment = currentPos === 0 ? "" : charSequence.slice ( 0 , currentPos ) ;
  var suffixSegment = charSequence.slice ( currentPos + 1 ) ;
  var temporaryBuffer = "" ;
  var alterationCount = 0 ;
  for ( var subIdx = 0 ; subIdx < prefixSegment.length ; subIdx++ )
  {
   if ( prefixSegment [ subIdx ] !== "E" )
   {
    alterationCount++ ;
   }
  }
  for ( var subIdx = 0 ; subIdx < suffixSegment.length ; subIdx++ )
  {
   if ( suffixSegment [ subIdx ] !== "W" )
   {
    alterationCount++ ;
   }
  }
  if ( leastAdjustments > alterationCount )
  {
   leastAdjustments = alterationCount ;
  }
 }
 console.log ( leastAdjustments ) ;
} ;


processInputData ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'UTF-8' ) ) ;