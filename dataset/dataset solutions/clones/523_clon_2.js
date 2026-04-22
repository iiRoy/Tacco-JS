var dataSource = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var lineArray = dataSource . trim ( ) . split ( "\n" ) ;
var configParams = lineArray . shift ( ) . split ( " " ) . map ( Number ) ;

var numItems = configParams [ 0 ] ;
var limitVal = configParams [ 2 ] ;
var itemStates = [ ] ;
var peakItem = [ 0 , 0 ] ;
var currentTime = 0 ;

for ( var idx = 0 ; idx < numItems ; idx ++ ) itemStates [ idx ] = [ 0 , 0 , idx ] ;

lineArray . push ( [ 1 , limitVal , 0 ] . join ( " " ) ) ;

for ( var idx = 0 ; idx < lineArray . length ; idx ++ )
{
   var parsedLine = lineArray [ idx ] . split ( " " ) . map ( Number ) ;
   var targetIndex = parsedLine [ 0 ] - 1 ;
   var eventTime = parsedLine [ 1 ] ;
   var changeAmount = parsedLine [ 2 ] ;

   itemStates [ peakItem [ 0 ] ] [ 1 ] += eventTime - currentTime ;
   currentTime = eventTime ;
   itemStates [ targetIndex ] [ 0 ] += changeAmount ;

   if ( changeAmount > 0 )
   {
      if ( itemStates [ targetIndex ] [ 0 ] > peakItem [ 1 ] ) peakItem = [ targetIndex , itemStates [ targetIndex ] [ 0 ] ] ;
      else if ( itemStates [ targetIndex ] [ 0 ] == peakItem [ 1 ] && targetIndex <= peakItem [ 0 ] ) peakItem = [ targetIndex , itemStates [ targetIndex ] [ 0 ] ] ;
   }
   else if ( changeAmount < 0 && peakItem [ 0 ] == targetIndex )
   {
      var currentMaxScore = 0 ;
      var maxScoreIndex = 0 ;
      for ( var innerIdx = 0 ; innerIdx < itemStates . length ; innerIdx ++ )
      {
         if ( currentMaxScore < itemStates [ innerIdx ] [ 0 ] ) { maxScoreIndex = innerIdx ; currentMaxScore = itemStates [ innerIdx ] [ 0 ] ; }
      }
      peakItem = [ maxScoreIndex , itemStates [ maxScoreIndex ] [ 0 ] ] ;
   }
}

itemStates . sort ( function ( itemA , itemB )
{
   if ( itemA [ 1 ] == itemB [ 1 ] ) return itemA [ 2 ] - itemB [ 2 ] ;
   else return itemB [ 1 ] - itemA [ 1 ] ;
} ) ;

console . log ( itemStates [ 0 ] [ 2 ] + 1 ) ;