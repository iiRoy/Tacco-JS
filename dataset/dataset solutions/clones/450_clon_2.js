var sourceData = require('fs').readFileSync( '/dev/stdin', 'utf8' ) ;
var lineSegments = ( sourceData.trim() ) . split ( "\n" ) ;
while ( true ) {
   var firstNumericValue = lineSegments.shift() - 0 ;
   if  ( firstNumericValue === 0 ) {
     break ;
   }
   var secondNumericValue = lineSegments.shift() - 0 ;
   var thirdNumericValue = lineSegments.shift() - 0 ;
   var fourthNumericValue = lineSegments.shift() - 0 ;
   var fifthNumericValue = lineSegments.shift() - 0 ;
   var collectedNumbers = [
      firstNumericValue,
      secondNumericValue,
      thirdNumericValue,
      fourthNumericValue,
      fifthNumericValue
   ];
   var possibleOptions = [ 1, 2, 3 ] ;
   possibleOptions = possibleOptions.filter( function ( currentOption ) {
      return (
         currentOption !== firstNumericValue &&
         currentOption !== secondNumericValue &&
         currentOption !== thirdNumericValue &&
         currentOption !== fourthNumericValue &&
         currentOption !== fifthNumericValue
      );
   } );
   if ( possibleOptions.length === 2 || possibleOptions.length === 0 ) {
      for ( var iterationIndex = 0 ; iterationIndex < 5 ; iterationIndex ++ ) {
         console.log( 3 ) ;
      }
   } else {
      collectedNumbers.forEach( function ( currentDataSetItem ) {
         if ( possibleOptions[0] === 1 ) {
           console.log( ( currentDataSetItem === 2 ) ? 2 : 1 ) ;
         }
         if ( possibleOptions[0] === 2 ) {
           console.log( ( currentDataSetItem === 1 ) ? 2 : 1 ) ;
         }
         if ( possibleOptions[0] === 3 ) {
           console.log( ( currentDataSetItem === 1 ) ? 1 : 2 ) ;
         }
      } );
   }
}