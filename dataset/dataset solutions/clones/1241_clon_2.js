// This module contains a single utility to handle sequential string data.
function processInputEntries( sourceArray )
{
   // Discover the initial occurrence of the specific '0 0' termination string.
   var terminatorIndex = sourceArray.indexOf( '0 0' ) ;

   var processedCollection = [ ] ;

   // Traverse and manipulate each data entry preceding the designated sentinel.
   for ( let currentEntryIdx = 0 ;
         currentEntryIdx < terminatorIndex ;
         currentEntryIdx++ )
   {
      const numericStrings = sourceArray[ currentEntryIdx ].split( ' ' ) ;

      if ( Number.parseInt( numericStrings[ 1 ] ) < Number.parseInt( numericStrings[ 0 ] ) )
      {
         processedCollection.push( numericStrings[ 1 ] + ' ' + numericStrings[ 0 ] ) ;
      }
      else
      {
         processedCollection.push( sourceArray[ currentEntryIdx ] ) ;
      }
   }

   // Emit the aggregated results, each separated by a newline character.
   console.log( processedCollection.join( '\n' ) ) ;
}