var   rawData  =  require ( 'fs' ) .  readFileSync ( '/dev/stdin' ,  'utf8' ) ;


var lineFragments = rawData.trim( ) . split( "\n" ) ;


var dimensions = lineFragments.shift( ) . split( " " ) . map( val => parseInt(val, 10) ) ;

var rowCount = dimensions[0] ;
var colCount = dimensions[1] ;


var segmentValues = [ ] ;
for ( let idx = 0 ; idx < rowCount - 1 ; idx ++ ) {
   segmentValues.push( +lineFragments.shift( ) ) ;
}


var movementInstructions = [ ] ;
for ( let idx = 0 ; idx < colCount ; idx ++ ) {
   movementInstructions.push( +lineFragments.shift( ) ) ;
}


var totalAccumulation = 0 ;
var currentPosition = 0 ;


movementInstructions.forEach( function ( instructionValue ) {
   var directionModifier = ( instructionValue > 0 ) ? 1 : -1 ;
   var absInstruction = Math.abs( instructionValue ) ;

   while ( absInstruction -- ) {
      if ( directionModifier === 1 ) {
         totalAccumulation += segmentValues[currentPosition] ;
      }
      currentPosition += directionModifier ;
      if ( directionModifier === -1 ) {
         totalAccumulation += segmentValues[currentPosition] ;
      }
   }
} ) ;


console.log( totalAccumulation % 100000 ) ;