"use strict";
const primaryProcessor = (sourceText) => {
  let symbolStream = sourceText.trim() . split  ( '' ) ;
  let outcomeIndicator = '';
  for (  let symbolIndex = 0; symbolIndex < symbolStream.length; symbolIndex++ ) {
    if ( symbolStream [ symbolIndex ] === symbolStream [ symbolIndex + 1 ] ) {
      outcomeIndicator = "no";
    } else {
      outcomeIndicator = "yes";
    }
  }
  console.log(outcomeIndicator);
};
primaryProcessor( require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) );