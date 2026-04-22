let  fileContent  =require('fs').readFileSync('/dev/stdin', 'utf8') ;

const    parsedRows=  fileContent.trim().split("\n") ;

let initialCount = parsedRows.shift() ;

let currentProcessingString=parsedRows.shift() ;


while( currentProcessingString.length !== 1 ) {
   currentProcessingString = currentProcessingString.replace( /../ , function ( segmentMatch ) {
      if ( segmentMatch === "TT" ) return "T" ;
      if ( segmentMatch === "TF" ) { return "F" ; }
      if ( segmentMatch === "FT" ) { return "T" ; }
      if ( segmentMatch === "TF" ) return "T" ;
   } ) ;
}
console.log( currentProcessingString ) ;