let sourceContent = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ;
const lineCollection = ( sourceContent . trim ( ) ) . split ( "\n" ) ;
let recordSet = [ ] ;
let dimensionSize ;

for ( let idx = 0 ; idx < lineCollection . length ; idx ++ )
{
   let currentValues = lineCollection [ idx ] . split ( " " ) . map ( Number ) ;

   if ( currentValues . length === 1 )
   {
      if ( idx === 0 )
      {
         dimensionSize = currentValues [ 0 ] ;
         continue ;
      }

      let aggregateRow = [ ] ;

      for ( let colIdx = 0 ; colIdx < dimensionSize + 1 ; colIdx ++ )
      {
         aggregateRow . push ( 0 ) ;
      }

      recordSet . forEach ( function ( rowEntry )
      {
         for ( let elementIdx = 0 ; elementIdx < dimensionSize + 1 ; elementIdx ++ )
         {
            aggregateRow [ elementIdx ] += rowEntry [ elementIdx ] ;
         }

         rowEntry = rowEntry . map ( function ( numericValue )
         {
            return ( "     " + numericValue ) . slice ( -5 ) ;
         } ) ;

         console . log ( rowEntry . join ( "" ) ) ;
      } ) ;

      aggregateRow = aggregateRow . map ( function ( numericValue )
      {
         return ( "     " + numericValue ) . slice ( -5 ) ;
      } ) ;

      console . log ( aggregateRow . join ( "" ) ) ;

      if ( currentValues [ 0 ] === 0 )
      {
         break ;
      }

      recordSet = [ ] ;

      dimensionSize = currentValues [ 0 ] ;
   }
   else
   {
      let totalSum = currentValues . reduce ( function ( accumulator , currentValue )
      {
         return accumulator + currentValue ;
      } ) ;

      currentValues . push ( totalSum ) ;

      recordSet . push ( currentValues ) ;
   }
}