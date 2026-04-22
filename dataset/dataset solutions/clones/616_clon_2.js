var dataSource = require('fs').readFileSync('/dev/stdin' , 'utf8' );

var dataLines = ( dataSource . trim() ) . split ( "\n" );

var countVal = dataLines.shift() - 0 ;

var resultList = [ ] ;

for ( var outerIdx = 0 ; outerIdx < 5 ; outerIdx ++ )
{
   for ( var innerIdx = outerIdx + 1 ; innerIdx < 5 ; innerIdx ++ )
   {
      resultList . push ( ( dataLines [ outerIdx ] + dataLines [ innerIdx ] ) - 0 ) ;
      resultList . push ( ( dataLines [ innerIdx ] + dataLines [ outerIdx ] ) - 0 ) ;
   }
}

resultList . sort ( function ( elemA , elemB ) {
   return elemA - elemB ;
} ) ;

console . log ( resultList [ 2 ] ) ;