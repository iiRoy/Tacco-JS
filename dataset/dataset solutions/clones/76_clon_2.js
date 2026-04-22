let ioUtil = require ( 'fs' ) ;


const processInputContent = receivedContent => {
  let numericalSequence = ( receivedContent . trim ( ) ) . split ( " " ) . map ( Number ) ;
  numericalSequence . sort ( function ( elemA , elemB ) { return elemB - elemA ; } ) ;
  console . log ( numericalSequence . join ( " " ) ) ;
};


const loadInputFile = sourceLocation => {
  ioUtil . readFile (
    sourceLocation ,
    'utf8' ,
    ( operationError , fileData ) => {
      processInputContent ( fileData ) ;
    }
  ) ;
} ;


const readStandardEntry = ( ) => {
  const directInput = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
  processInputContent ( directInput ) ;
} ;


let entryPointSpecifier = "" ;

if ( process . argv . length > 2 ) {
  entryPointSpecifier = process . argv [ 2 ] ;
  loadInputFile ( entryPointSpecifier ) ;
}
else {
  readStandardEntry ( ) ;
}