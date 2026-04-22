function computeLongestIncreasingSubsequence
(
)
{
 var arraySize = inputArray[0] + 1 ;
  var lengthTracker = [ ] ;
   var parentTracker = [ ] ;
 for ( var initIndex = 0 ; initIndex < arraySize ; initIndex++ )
   {
    lengthTracker.push( 0 );
     parentTracker.push( 0 );
   }
  inputArray[0] = 0 ;
   parentTracker[0] = -1 ;
 for ( var mainIndex = 1 ; mainIndex < inputArray.length ; mainIndex ++ )
  {
   var prevBestIndex = 0 ;
    for ( var scanIndex = 0 ; scanIndex <= mainIndex - 1 ; scanIndex++ )
    {
     if ( inputArray[scanIndex] < inputArray[mainIndex] && lengthTracker[scanIndex] > lengthTracker[prevBestIndex] )
      prevBestIndex = scanIndex ;
    }
   lengthTracker[mainIndex] = lengthTracker[prevBestIndex] + 1 ;
    parentTracker[mainIndex] = prevBestIndex ;
  }
 var maximumLength = Math.max.apply( null , lengthTracker );
  console.log( maximumLength );
}

var fileContent = require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ;
var inputArray = ( fileContent .trim( ) ) .split ( "\n" ) .map ( Number ) ;
computeLongestIncreasingSubsequence ( ) ;