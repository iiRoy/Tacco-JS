process . stdin . resume ( ) ;

process. stdin . setEncoding ( 'utf8' ) ;

let accumulatedText = "";

process . stdin . on ( 'data' , ( dataFragment ) => {
  accumulatedText += dataFragment ;
} ) ;

process . stdin . on ( 'end' , ( ) => {
  processContent ( accumulatedText . split ( new RegExp ( '\\r?\\n' ) ) ) ;
} ) ;

function processContent ( rawSegments ) {
  rawSegments = String ( rawSegments ) ;

  rawSegments = rawSegments . match ( new RegExp ( '2' , 'g' ) ) ;

  if ( rawSegments === null ) {
    rawSegments = [ ] ;
  }

  console . log ( rawSegments ) ;

  console . log ( rawSegments . length ) ;
}