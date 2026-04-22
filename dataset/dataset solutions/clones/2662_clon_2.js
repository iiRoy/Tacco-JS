const processCollection = ( itemCount , inputStringsCollection ) => {
 let pairAccumulator = 0 ;
 const canonicalRepresentations = inputStringsCollection . map ( currentElement => {
  return currentElement . sort ( ) . join ( '' ) ;
 } ) ;
 for ( let loopIndex = 0 ; loopIndex <= itemCount ; loopIndex ++ ) {
  pairAccumulator += canonicalRepresentations . slice ( loopIndex ) . filter ( comparedElement => {
   return canonicalRepresentations [ loopIndex ] === comparedElement ;
  } ) . length ;
 }
 return pairAccumulator ;
} ;


const fileData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( "\n" ) ;
const totalEntries = Number ( fileData [ 0 ] ) ;
const characterArrays = fileData . slice ( 1 ) . map ( elementSource => Array . from ( elementSource ) ) ;
console . log ( processCollection ( totalEntries , characterArrays ) ) ;