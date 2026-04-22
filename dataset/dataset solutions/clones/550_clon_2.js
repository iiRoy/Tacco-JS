function  executeProcessing ( )
{
  let
    globalIndex ,
    loopCounter ,
    mapEntryCount ,
    queryCount ;

  let
    translationDictionary ,
    currentInputLineParts ,
    outputFragments ;

  for ( globalIndex = 0 ; mapEntryCount = parseInt ( processedLines [ globalIndex ++ ] , 10 ) ; )
  {
    translationDictionary = { } ;

    for ( loopCounter = 0 ; loopCounter < mapEntryCount ; loopCounter ++ )
    {
      currentInputLineParts = processedLines [ globalIndex ++ ] . split ( ' ' ) ;
      translationDictionary [ currentInputLineParts [ 0 ] ] = currentInputLineParts [ 1 ] ;
    }

    queryCount = parseInt ( processedLines [ globalIndex ++ ] , 10 ) ;

    outputFragments = [ ] ;

    for ( loopCounter = 0 ; loopCounter < queryCount ; loopCounter ++ , globalIndex ++ )
    {
      outputFragments . push ( translationDictionary [ processedLines [ globalIndex ] ] || processedLines [ globalIndex ] ) ;
    }

    console . log ( outputFragments . join ( '' ) ) ;
  }
}

let
  rawTextBuffer = '' ;

let
  processedLines ;

process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;
process . stdin . on ( 'data' , function ( dataSegment )
{
  rawTextBuffer += dataSegment ;
} ) ;
process . stdin . on ( 'end' , function ( )
{
  processedLines = rawTextBuffer . split ( / \r\n | \r | \n /g ) ;
  executeProcessing ( ) ;
} ) ;