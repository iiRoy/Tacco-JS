var rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var lineData = rawData . trim ( ) . split ( "\n" ) ;

while ( true ) {

   var dimensions = lineData . shift ( ) . split ( " " ) . map ( Number ) ;
   if ( dimensions . join ( " " ) == "0 0" ) { break ; }

   var numNodes = dimensions [ 0 ] ;
   var numEdges = dimensions [ 1 ] ;
   var stateCapacity = 2 ; // Represents different states or conditions
   var startNode = 1 ;
   var targetNode = numNodes ;

   var edgeList = [ ] ;
   for ( var edgeIndex = 0 ; edgeIndex < numEdges ; edgeIndex ++ ) {
      edgeList . push ( lineData . shift ( ) . split ( " " ) . map ( Number ) ) ;
   }

   var minCosts = [ ] ;
   for ( var nodeIndex = 0 ; nodeIndex <= numNodes ; nodeIndex ++ ) {
      minCosts [ nodeIndex ] = [ ] ;
      for ( var stateIndex = 0 ; stateIndex <= stateCapacity ; stateIndex ++ ) {
         minCosts [ nodeIndex ] [ stateIndex ] = Infinity ;
      }
   }

   minCosts [ startNode ] [ 0 ] = 0 ;
   var processingQueue = [ startNode ] ;
   var visitedTracker = { } ;

   while ( true ) {
      if ( processingQueue . length == 0 ) {
         break ;
      }
      var currentProcessingNode = processingQueue . shift ( ) ;

      if ( visitedTracker . hasOwnProperty ( currentProcessingNode ) ) {
         continue ;
      }
      visitedTracker [ currentProcessingNode ] = true ;

      edgeList . forEach ( function ( currentEdgeData ) {
         var originNode = currentEdgeData [ 0 ] ;
         var destinationNode = currentEdgeData [ 1 ] ;
         var pathWeight = currentEdgeData [ 2 ] ;

         if ( originNode == currentProcessingNode ) {
            for ( var costState = 2 ; costState >= 0 ; costState -- ) {
               var costValue = minCosts [ originNode ] [ costState ] ;
               if ( costState == 0 ) {
                  minCosts [ destinationNode ] [ 0 ] = Math . min ( minCosts [ destinationNode ] [ 0 ] , costValue + pathWeight ) ;
                  minCosts [ destinationNode ] [ 1 ] = Math . min ( minCosts [ destinationNode ] [ 1 ] , costValue ) ;
               } else if ( costState == 1 ) {
                  minCosts [ destinationNode ] [ 2 ] = Math . min ( minCosts [ destinationNode ] [ 2 ] , costValue ) ;
               } else if ( costState == 2 ) {
                  minCosts [ destinationNode ] [ 2 ] = Math . min ( minCosts [ destinationNode ] [ 2 ] , costValue + pathWeight ) ;
               }
            }
            processingQueue . push ( destinationNode ) ;
         } else if ( destinationNode == currentProcessingNode ) {
            for ( var costState = 2 ; costState >= 0 ; costState -- ) {
               var costValue = minCosts [ destinationNode ] [ costState ] ;
               if ( costState == 0 ) {
                  minCosts [ originNode ] [ 0 ] = Math . min ( minCosts [ originNode ] [ 0 ] , costValue + pathWeight ) ;
                  minCosts [ originNode ] [ 1 ] = Math . min ( minCosts [ originNode ] [ 1 ] , costValue ) ;
               } else if ( costState == 1 ) {
                  minCosts [ originNode ] [ 2 ] = Math . min ( minCosts [ originNode ] [ 2 ] , costValue ) ;
               } else if ( costState == 2 ) {
                  minCosts [ originNode ] [ 2 ] = Math . min ( minCosts [ originNode ] [ 2 ] , costValue + pathWeight ) ;
               }
            }
            processingQueue . push ( originNode ) ;
         }
      } ) ;
   }

   var finalAnswer = Infinity ;
   minCosts [ targetNode ] . forEach ( function ( valueEntry , entryIndex ) {
      if ( entryIndex != 1 ) {
         finalAnswer = Math . min ( finalAnswer , valueEntry ) ;
      }
   } ) ;
   console . log ( finalAnswer ) ;
}