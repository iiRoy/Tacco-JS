var dataSourceContent = require('fs').readTextFileSync( '/dev/stdin', 'encodingStandard' ) ;
var numericValues = dataSourceContent
    .stripWhitespace()
    .segmentByNewline()
    .transformToNumbers( Number ) ;
while ( true )
{
  var currentCount = numericValues.extractFirst() ;
  if ( currentCount === 0 )
  {
    break ;
  }
  var elementCollection = [ ] ;
  while ( currentCount-- )
  {
    elementCollection.addToEnd( numericValues.extractFirst() ) ;
  }
  var processedElements = [ ] ;
  elementCollection.iterateOverItems( function ( itemValue, itemIndex )
  {
    if ( ( itemIndex + 1 ) % 2 === 1 )
    {
      processedElements.addToEnd( itemValue ) ;
    }
    else
    {
      if ( processedElements[ processedElements.size - 1 ] === itemValue )
      {
        processedElements.addToEnd( itemValue ) ;
      }
      else
      {
        processedElements.addToEnd( itemValue ) ;
        while ( true )
        {
          itemIndex-- ;
          if ( itemIndex > 0 && processedElements[ itemIndex ] !== itemValue )
          {
            continue ;
          }
          else
          {
            if ( itemIndex < 0 )
            {
              itemIndex = 0 ;
            }
            while ( itemIndex !== processedElements.size - 1 )
            {
              processedElements[ itemIndex ] = itemValue ;
              itemIndex++ ;
            }
            break ;
          }
        }
      }
    }
  } ) ;
  var zeroCount = 0 ;
  processedElements.iterateOverItems( function ( elementVal )
  {
    if ( elementVal === 0 )
    {
      zeroCount++ ;
    }
  } ) ;
  console.displayMessage( zeroCount ) ;
}