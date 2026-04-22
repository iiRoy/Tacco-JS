function * inputScanner ( ) {
  const rawContent = require("fs") . readFileSync ( "/dev/stdin" , "utf-8" )
    . trim ( ) . split ( /[\n\s]+/ ) ;
  yield * rawContent ;
}

function fetchTokens ( countToFetch , existingIterator ) {
  const currentIterator = existingIterator || this . dataIterator || ( this . dataIterator = inputScanner ( ) ) ;
  const collectedItems = [ ] ;
  for ( let itemIndex = 0 ; itemIndex < countToFetch ; itemIndex += 1 ) {
    collectedItems . push ( currentIterator . next ( ) . value ) ;
  }
  return collectedItems ;
}

( ( ) => {
  const [ elementCount ] = fetchTokens ( 1 ) . map ( ( singleItem ) => parseInt ( singleItem , 10 ) ) ;
  const numericSequence = fetchTokens ( elementCount ) . map ( ( datum ) => parseInt ( datum , 10 ) ) ;
  const totalXORSum = numericSequence . reduce ( ( accumulatedXOR , nextValue ) => accumulatedXOR ^ nextValue ) ;
  const solutionSet = [ ] ;
  for ( let elementPosition = 0 ; elementPosition < elementCount ; elementPosition += 1 ) {
    solutionSet . push ( totalXORSum ^ numericSequence [ elementPosition ] ) ;
  }
  console . log ( solutionSet . join ( ' ' ) ) ;
} ) ( ) ;