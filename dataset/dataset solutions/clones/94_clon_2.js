// This script processes spatial data points and their radii.
(  function( sourceText )
{
  // Prepare the input text by splitting it into individual lines.
  var    processedLines = sourceText.replace ( /\n$/ , '' ) .split ( '\n' );
  // The first line indicates the total number of test cases to process.
  var   numIterations = Number ( processedLines.shift() ) ;


  for ( var   loopCounter = 0 ;   loopCounter < numIterations ;   loopCounter++ )
  {
    // Extract parameters for the current test case.
    var currentParams = processedLines.shift().split ( ' ' ) .map ( Number ) ;

    var xCoord1 = currentParams.shift() ; // X-coordinate of the first point
    var yCoord1 = currentParams.shift() ; // Y-coordinate of the first point
    var radius1 = currentParams.shift() ; // Radius of the first circle

    var xCoord2 = currentParams.shift() ; // X-coordinate of the second point
    var yCoord2 = currentParams.shift() ; // Y-coordinate of the second point
    var radius2 = currentParams.shift() ; // Radius of the second circle

    // Calculate the Euclidean distance between the centers of the two circles.
    var centerDistance = Math.sqrt( Math.pow( xCoord2 - xCoord1 , 2 ) + Math.pow( yCoord2 - yCoord1 , 2 ) ) ;

    // Determine the relationship between the two circles based on their distance and radii.
    if ( centerDistance <= radius1 + radius2 )
    {
      if ( centerDistance < radius2 - radius1 )
      {
        console.log( -2 ) ; // One circle is completely inside the other, second is larger
      }
      else if ( centerDistance < radius1 - radius2 )
      {
        console.log( 2 ) ; // One circle is completely inside the other, first is larger
      }
      else
      {
        console.log( 1 ) ; // Circles intersect or touch at one point
      }
    }
    else
    {
      console.log( 0 ) ; // Circles do not intersect at all
    }
  }
} ) ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;