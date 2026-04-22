var   dataSource  = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
var inputSegments = dataSource . split ( '\n' ) ;


var currentSegment ; 
while ( currentSegment = inputSegments . shift ( ) )
{
  var combinationTally =   0   ; 
  var targetSum        = +currentSegment; 

  console.log(currentSegment);
  console.log(targetSum);

  for ( var idxA = 0 ; idxA < 9 ; idxA++ )
  {
    for ( var idxB = 0 ; idxB < 9 ; idxB++ )
    {
      for ( var idxC = 0 ; idxC < 9 ; idxC++ )
      {
        for ( var idxD = 0 ; idxD < 9 ; idxD++ )
        {
          if ( idxA + idxB + idxC + idxD == targetSum )
          {
              combinationTally ++ ; 
          }
        }
      }
    }
  }
  console.log(combinationTally);
}